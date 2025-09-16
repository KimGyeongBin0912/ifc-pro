        import React, { useRef, useEffect, useState } from 'react'
        import { IfcViewerAPI } from 'web-ifc-viewer'
        import * as THREE from 'three'

        // Common IFC categories for filtering
        const IFC = {
          IFCWALL: 1979125885,
          IFCWALLSTANDARDCASE: 1473910865,
          IFCSLAB: 1264930421,
          IFCBEAM: 665602368,
          IFCCOLUMN: 2002594938,
          IFCWINDOW: 1493184502,
          IFCDOOR: 1227024538,
          IFCPLATE: 1607154359,
          IFCMEMBER: 1838606352,
          IFCSTAIR: 3215560486,
          IFCROOF: 3007965303,
          IFCRAILING: 1916427380,
          IFCFURNISHINGELEMENT: 2217338592,
          IFCDISTRIBUTIONELEMENT: 3181165321,
          IFCSLABELEMENTEDCASE: 1601531635,
          IFCCURTAINWALL: 1254314750,
          IFCSITE: 32344328,
          IFCBUILDING: 4031249490,
          IFCBUILDINGSTOREY: 3124254112,
          IFCSPACE: 2209200919,
        }

        const CATEGORY_LIST = [
          'IFCWALL',
          'IFCWALLSTANDARDCASE',
          'IFCSLAB',
          'IFCBEAM',
          'IFCCOLUMN',
          'IFCWINDOW',
          'IFCDOOR',
          'IFCPLATE',
          'IFCMEMBER',
          'IFCSTAIR',
          'IFCROOF',
          'IFCRAILING',
          'IFCFURNISHINGELEMENT',
          'IFCDISTRIBUTIONELEMENT',
          'IFCCURTAINWALL',
        ]

        export default function App() {
          const containerRef = useRef(null)
          const viewerRef = useRef(null)
          const modelIDRef = useRef(null)

          const [loaded, setLoaded] = useState(false)
          const [activeCats, setActiveCats] = useState(new Set(CATEGORY_LIST))
          const [storeys, setStoreys] = useState([])
          const [activeStorey, setActiveStorey] = useState(null)
          const [propsText, setPropsText] = useState('')

          useEffect(() => {
            const container = document.createElement('div')
            container.id = 'viewer-container'
            containerRef.current.appendChild(container)

            const viewer = new IfcViewerAPI({ container, backgroundColor: new THREE.Color(0xffffff) })
            // Serve WASM from CDN to avoid MIME issues on some hosts
            viewer.IFC.setWasmPath('https://unpkg.com/web-ifc@0.0.51/')

            // Optional: enhance visuals
            viewer.axes.setAxes()
            viewer.grid.setGrid(50, 50)

            // Highlight material
            if (viewer.IFC?.selector?.selection?.material?.color) {   viewer.IFC.selector.selection.material.color = new THREE.Color(0x00aaff) }

            viewerRef.current = viewer

            // Click selection + properties panel
            window.onmousemove = () => viewer.IFC.selector.prePickIfcItem()
            window.onclick = async () => {
              if (!modelIDRef.current) return
              const result = await viewer.IFC.selector.pickIfcItem()
              if (!result) return
              const { modelID, id } = result
              const props = await viewer.IFC.getProperties(modelID, id, true, true)
              setPropsText(JSON.stringify(props, null, 2))
            }

            return () => {
              if (viewer) {
                viewer.dispose()
              }
            }
          }, [])

          const loadIFC = async (file) => {
            if (!viewerRef.current || !file) return
            setLoaded(false)
            setPropsText('')
            setStoreys([])
            setActiveStorey(null)

            const model = await viewerRef.current.IFC.loadIfc(file, true)
            modelIDRef.current = model.modelID
            await viewerRef.current.shadowDropper.renderShadow(model.modelID)
            viewerRef.current.context.renderer.postProduction.active = true
            viewerRef.current.context.fitToFrame()

            // Build spatial tree to get storeys
            const spatial = await viewerRef.current.IFC.getSpatialStructure(model.modelID, true)
            const foundStoreys = []
            const recur = (node) => {
              if (!node) return
              if (node.type === 'IFCBUILDINGSTOREY') foundStoreys.push({ expressID: node.expressID, name: node.name || `Storey ${node.expressID}` })
              node.children?.forEach(recur)
            }
            recur(spatial)
            setStoreys(foundStoreys)

            // Precreate subsets for category filters
            await buildCategorySubsets(model.modelID)

            setLoaded(true)
          }

          const buildCategorySubsets = async (modelID) => {
            const viewer = viewerRef.current
            if (!viewer) return
            // Create a subset mesh per category for fast toggle
            for (const cat of CATEGORY_LIST) {
              try {
                const catID = IFC[cat]
                const ids = await viewer.IFC.getAllItemsOfType(modelID, catID, false)
                const idArr = ids.map(i => i.expressID)
                if (idArr.length) {
                  await viewer.IFC.subsets.createSubset({
                    modelID,
                    ids: idArr,
                    scene: viewer.context.scene,
                    removePrevious: true,
                    customID: `subset-${cat}`,
                    material: new THREE.MeshPhongMaterial({ color: 0xbdbdbd, side: THREE.DoubleSide })
                  })
                }
              } catch (e) {
                console.warn('Subset build failed for', cat, e)
              }
            }
          }

          const onToggleCategory = (cat) => {
            const viewer = viewerRef.current
            const modelID = modelIDRef.current
            if (!viewer || !modelID) return

            const next = new Set(activeCats)
            if (next.has(cat)) next.delete(cat)
            else next.add(cat)
            setActiveCats(next)

            const subsetID = `subset-${cat}`
            const subset = viewer.context.items.pickableIfcModels.find(m => m.name === subsetID) ||
                           viewer.context.scene.children.find(o => o.userData?.subsets?.has?.(subsetID)) // fallback

            const subsetObj = viewer.IFC.subsets.getSubset(modelID, IFC[cat], subsetID)
            if (subsetObj) subsetObj.visible = next.has(cat)
            // For safety, also hide original base model when using subsets completely (optional)
            // viewer.context.items.ifcModels[0].visible = false
          }

          const showOnlyCategory = (cat) => {
            CATEGORY_LIST.forEach(c => {
              if (c === cat) {
                if (!activeCats.has(c)) onToggleCategory(c)
              } else {
                if (activeCats.has(c)) onToggleCategory(c)
              }
            })
          }

          const resetView = () => {
            if (!viewerRef.current) return
            viewerRef.current.context.fitToFrame()
          }

          const onSetStorey = async (storeyID) => {
            const viewer = viewerRef.current
            const modelID = modelIDRef.current
            if (!viewer || !modelID) return
            setActiveStorey(storeyID)

            // Hide all by default, then show items in selected storey
            // Strategy: isolate by spatial structure
            const spatial = await viewer.IFC.getSpatialStructure(modelID, true)
            const idsToShow = new Set()

            const collect = (node) => {
              if (!node) return
              if (node.expressID === storeyID) {
                // collect all descendants
                const gather = (n) => {
                  n.children?.forEach(ch => {
                    if (ch.expressID) idsToShow.add(ch.expressID)
                    if (ch.children?.length) gather(ch)
                  })
                }
                gather(node)
              } else {
                node.children?.forEach(collect)
              }
            }
            collect(spatial)

            // Use visibility manager via subsets – simple approach: toggle categories but also hide everything not in idsToShow
            // Simpler: hide base model and use selection by IDs to create a one-off subset
            // However, to keep performance, we roughly keep categories but dim those not in storey with clipping
            // For clarity and reliability here: use the built-in "toggle all items" then "isolate by IDs".
            await viewer.IFC.selector.unpickIfcItems()
            await viewer.IFC.selector.highlightIfcItemsByID(modelID, Array.from(idsToShow))

            // Make highlighted items stand out; the rest can remain visible
          }

          const onFileSelected = (e) => {
            const file = e.target.files?.[0]
            if (file) loadIFC(file)
          }

          const downloadProps = () => {
            if (!propsText) return
            const blob = new Blob([propsText], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'ifc-selected-properties.json'
            a.click()
            URL.revokeObjectURL(url)
          }

          return (
            <div className="app">
              <div className="topbar">
                <label className="filelabel">
                  IFC 파일 업로드
                  <input type="file" accept=".ifc" onChange={onFileSelected} />
                </label>
                <button className="btn" onClick={resetView}>뷰 리셋</button>
                {loaded ? <span className="muted">로드 완료 • 마우스로 드래그/휠 회전/줌 • 클릭시 속성 보기</span> : <span className="muted">IFC 파일을 업로드하세요</span>}
              </div>

              <aside className="sidebar">
                <div className="section">
                  <h3>요소 필터</h3>
                  <div className="badges">
                    {CATEGORY_LIST.map(cat => (
                      <span
                        key={cat}
                        className={`badge ${activeCats.has(cat) ? 'active' : ''}`}
                        onClick={() => onToggleCategory(cat)}
                        title={`토글 ${cat}`}
                      >
                        {cat.replace('IFC','')}
                      </span>
                    ))}
                  </div>
                  <div className="row" style={{marginTop: 8}}>
                    <select className="grow" onChange={(e) => showOnlyCategory(e.target.value)} defaultValue="">
                      <option value="" disabled>카테고리 단독 보기…</option>
                      {CATEGORY_LIST.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button className="btn" onClick={() => setActiveCats(new Set(CATEGORY_LIST))}>전체 보이기</button>
                  </div>
                </div>

                <div className="section">
                  <h3>층(스토리) 보기</h3>
                  {storeys.length === 0 && <div className="muted">스토리 정보 없음 (모델 구조 분석 대기 혹은 미포함)</div>}
                  {storeys.length > 0 && (
                    <ul>
                      {storeys.map(s => (
                        <li key={s.expressID}>
                          <label>
                            <input
                              type="radio"
                              name="storey"
                              checked={activeStorey === s.expressID}
                              onChange={() => onSetStorey(s.expressID)}
                            />
                            {' '}{s.name} <span className="muted">#{s.expressID}</span>
                          </label>
                        </li>
                      ))}
                      <li style={{marginTop: 6}}>
                        <button className="btn" onClick={() => { setActiveStorey(null); viewerRef.current?.IFC.selector.unpickIfcItems() }}>스토리 선택 해제</button>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="section">
                  <h3>선택 요소 속성</h3>
                  <div className="row" style={{marginBottom: 8}}>
                    <button className="btn" onClick={downloadProps} disabled={!propsText}>JSON 다운로드</button>
                    <span className="muted">클릭한 요소의 IfcPropertySet 등 표시</span>
                  </div>
                  <pre className="muted" style={{maxHeight: 240, overflow: 'auto', background:'#f7f7f7', padding:8, borderRadius:8}}>
{propsText || '요소를 클릭하면 속성이 여기에 표시됩니다.'}
                  </pre>
                </div>

                <div className="section">
                  <h3>힌트</h3>
                  <div className="muted">
                    <div><span className="kbd">마우스 좌클릭 드래그</span> 회전</div>
                    <div><span className="kbd">휠</span> 줌</div>
                    <div><span className="kbd">Shift + 드래그</span> 이동</div>
                  </div>
                </div>
              </aside>

              <main className="viewer" ref={containerRef}></main>
            </div>
          )
        }
