import React, { useRef, useEffect, useState } from 'react'
import { IfcViewerAPI } from 'web-ifc-viewer'
import * as THREE from 'three'

// 자주 쓰는 IFC 카테고리 (필터용)
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
  IFCCURTAINWALL: 1254314750,
  IFCBUILDINGSTOREY: 3124254112,
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
    // 뷰어 컨테이너
    const container = document.createElement('div')
    container.id = 'viewer-container'
    containerRef.current.appendChild(container)

    const viewer = new IfcViewerAPI({ container, backgroundColor: new THREE.Color(0xffffff) })

    // 🔒 Render Static 환경 안전 설정
    viewer.IFC.loader.ifcManager.useWebWorkers(false)         // 멀티스레드 비활성화
    viewer.IFC.loader.ifcManager.setWasmPath('/wasm/')        // 동일 오리진 WASM

    // 가시성 옵션
    viewer.axes.setAxes()
    viewer.grid.setGrid(50, 50)
    // ⛑️ 버전별로 postProduction이 없을 수 있으므로 안전 가드
    if (viewer.context?.renderer?.postProduction) {
      viewer.context.renderer.postProduction.active = true
    }

    // 선택/프리픽
    window.onmousemove = () => viewer.IFC.selector.prePickIfcItem()
    window.onclick = async () => {
      if (!modelIDRef.current) return
      try {
        const result = await viewer.IFC.selector.pickIfcItem()
        if (!result) return
        const { modelID, id } = result
        const props = await viewer.IFC.getProperties(modelID, id, true, true)
        setPropsText(JSON.stringify(props, null, 2))
      } catch (e) {
        console.error('[pickIfcItem error]', e)
      }
    }

    viewerRef.current = viewer

    return () => {
      try {
        viewer.dispose()
      } catch (_) {}
    }
  }, [])

  // 파일 선택 (동일 파일 재선택 허용 + 실패 시 알림)
  const onFileSelected = async (e) => {
    const input = e.target
    const file = input.files && input.files[0]
    // 같은 파일을 다시 선택해도 onChange가 발생하도록 리셋
    input.value = ''

    if (!file) return
    try {
      console.time('[IFC] load')
      setLoaded(false)
      setPropsText('')
      setStoreys([])
      setActiveStorey(null)

      // 일부 환경에서 File 그대로보다 버퍼가 안정적
      const buf = await file.arrayBuffer()
      await loadIFC(new Uint8Array(buf), file.name)

      console.timeEnd('[IFC] load')
    } catch (err) {
      console.error('[IFC load error]', err)
      alert('IFC 로드 중 오류가 발생했습니다. 브라우저 콘솔을 확인해주세요.')
      setLoaded(false)
    }
  }

  // IFC 로딩 (File | Uint8Array 모두 허용)
  const loadIFC = async (ifcDataOrFile, filename = 'model.ifc') => {
    if (!viewerRef.current || !ifcDataOrFile) return
    const viewer = viewerRef.current
    setLoaded(false)

    try {
      const model = await viewer.IFC.loadIfc(ifcDataOrFile, true)
      if (!model) throw new Error('IFC model is null')
      modelIDRef.current = model.modelID

      await viewer.shadowDropper.renderShadow(model.modelID)
      viewer.context.fitToFrame()

      // 스토리(층) 수집
      const spatial = await viewer.IFC.getSpatialStructure(model.modelID, true)
      const foundStoreys = []
      const walk = (node) => {
        if (!node) return
        if (node.type === 'IFCBUILDINGSTOREY') {
          foundStoreys.push({
            expressID: node.expressID,
            name: node.name || `Storey ${node.expressID}`,
          })
        }
        node.children?.forEach(walk)
      }
      walk(spatial)
      setStoreys(foundStoreys)

      // 카테고리 서브셋 생성 (빠른 토글)
      await buildCategorySubsets(model.modelID)

      setLoaded(true)
    } catch (err) {
      console.error('[loadIFC failed]', err)
      setLoaded(false)
      throw err
    }
  }

  const buildCategorySubsets = async (modelID) => {
    const viewer = viewerRef.current
    if (!viewer) return
    for (const cat of CATEGORY_LIST) {
      const catID = IFC[cat]
      try {
        const ids = await viewer.IFC.getAllItemsOfType(modelID, catID, false)
        const idArr = ids.map((i) => i.expressID)
        if (idArr.length) {
          await viewer.IFC.subsets.createSubset({
            modelID,
            ids: idArr,
            scene: viewer.context.scene,
            removePrevious: true,
            customID: `subset-${cat}`,
            material: new THREE.MeshPhongMaterial({
              color: 0xbdbdbd,
              side: THREE.DoubleSide,
            }),
          })
        }
      } catch (e) {
        // 해당 카테고리가 없거나 API 차이일 수 있음 (무시)
        console.warn('[subset build warn]', cat, e?.message || e)
      }
    }
  }

  // 카테고리 토글
  const onToggleCategory = (cat) => {
    const viewer = viewerRef.current
    const modelID = modelIDRef.current
    if (!viewer || !modelID) return

    const next = new Set(activeCats)
    if (next.has(cat)) next.delete(cat)
    else next.add(cat)
    setActiveCats(next)

    const subsetObj = viewer.IFC.subsets.getSubset(modelID, IFC[cat], `subset-${cat}`)
    if (subsetObj) subsetObj.visible = next.has(cat)
  }

  // 카테고리 단독 보기
  const showOnlyCategory = (cat) => {
    CATEGORY_LIST.forEach((c) => {
      if (c === cat) {
        if (!activeCats.has(c)) onToggleCategory(c)
      } else {
        if (activeCats.has(c)) onToggleCategory(c)
      }
    })
  }

  // 뷰 리셋
  const resetView = () => {
    if (!viewerRef.current) return
    viewerRef.current.context.fitToFrame()
  }

  // 스토리 하이라이트
  const onSetStorey = async (storeyID) => {
    const viewer = viewerRef.current
    const modelID = modelIDRef.current
    if (!viewer || !modelID) return
    setActiveStorey(storeyID)

    try {
      const spatial = await viewer.IFC.getSpatialStructure(modelID, true)
      const idsToHighlight = new Set()

      const collect = (node) => {
        if (!node) return
        if (node.expressID === storeyID) {
          const gather = (n) => {
            n.children?.forEach((ch) => {
              if (ch.expressID) idsToHighlight.add(ch.expressID)
              if (ch.children?.length) gather(ch)
            })
          }
          gather(node)
        } else {
          node.children?.forEach(collect)
        }
      }
      collect(spatial)

      await viewer.IFC.selector.unpickIfcItems()
      await viewer.IFC.selector.highlightIfcItemsByID(modelID, Array.from(idsToHighlight))
    } catch (e) {
      console.warn('[storey highlight warn]', e)
    }
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
          <input type="file" accept=".ifc,.IFC" onChange={onFileSelected} />
        </label>
        <button className="btn" onClick={resetView}>뷰 리셋</button>
        {loaded ? (
          <span className="muted">로드 완료 • 드래그 회전 / 휠 줌 / Shift+드래그 이동 • 클릭 시 속성 표시</span>
        ) : (
          <span className="muted">IFC 파일을 업로드하세요</span>
        )}
      </div>

      <aside className="sidebar">
        <div className="section">
          <h3>요소 필터</h3>
          <div className="badges">
            {CATEGORY_LIST.map((cat) => (
              <span
                key={cat}
                className={`badge ${activeCats.has(cat) ? 'active' : ''}`}
                onClick={() => onToggleCategory(cat)}
                title={`토글 ${cat}`}
              >
                {cat.replace('IFC', '')}
              </span>
            ))}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <select className="grow" onChange={(e) => showOnlyCategory(e.target.value)} defaultValue="">
              <option value="" disabled>카테고리 단독 보기…</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="btn" onClick={() => setActiveCats(new Set(CATEGORY_LIST))}>전체 보이기</button>
          </div>
        </div>

        <div className="section">
          <h3>층(스토리) 보기</h3>
          {storeys.length === 0 && <div className="muted">스토리 정보 없음 (모델 구조 분석 대기 또는 미포함)</div>}
          {storeys.length > 0 && (
            <ul>
              {storeys.map((s) => (
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
              <li style={{ marginTop: 6 }}>
                <button
                  className="btn"
                  onClick={() => { setActiveStorey(null); viewerRef.current?.IFC.selector.unpickIfcItems() }}
                >
                  스토리 선택 해제
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="section">
          <h3>선택 요소 속성</h3>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="btn" onClick={downloadProps} disabled={!propsText}>JSON 다운로드</button>
            <span className="muted">클릭한 요소의 IfcPropertySet 등 표시</span>
          </div>
          <pre className="muted" style={{ maxHeight: 240, overflow: 'auto', background: '#f7f7f7', padding: 8, borderRadius: 8 }}>
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
