# IFC Viewer PRO (Render-ready)

업로드한 `.ifc` 파일을 3D로 렌더링하고, 마우스로 회전/이동/줌할 수 있으며,
요소별(카테고리) 토글과 층(스토리) 뷰를 지원합니다. 선택 요소의 속성도 확인 가능합니다.

본 프로젝트는 **Vite + React + Three.js + IFC.js(web-ifc-viewer)** 기반이며,
**web-ifc WASM** 파일은 CDN에서 로드하도록 설정되어 있어 Render 같은 호스팅에서
`application/wasm` MIME 문제를 피할 수 있습니다.

## 빠른 시작 (로컬)
```bash
npm install
npm run dev
```
브라우저에서 http://localhost:5173 열기

## 빌드
```bash
npm run build
npm run preview
```

## Render 배포 가이드 (Static Site)
1. 이 저장소를 GitHub에 푸시
2. Render에서 **Static Site** 선택 후 연결
3. Build Command: `npm install && npm run build`
   Publish Directory: `dist`
4. 환경변수 불필요

> 참고: WASM은 다음 경로에서 로드합니다: `https://unpkg.com/web-ifc@0.0.51/`

## 기능
- IFC 업로드 및 전체 3D 렌더링
- 마우스 Orbit(회전)/이동/줌
- 요소 카테고리(벽/바닥/창/문/보/기둥/난간/커튼월 등) 노출 토글
- 카테고리 단독 보기
- 스토리(층) 기반 하이라이트 보기
- 클릭한 요소의 속성(프로퍼티) 조회 + JSON 다운로드
- 뷰 리셋

## 트러블슈팅
- **WASM MIME 에러**: 본 프로젝트는 CDN을 사용하므로 일반적으로 발생하지 않습니다.
- **대형 IFC 성능**: 브라우저 메모리 및 GPU 한계에 의존합니다. 필요 시 모델을 분할하거나 LOD를 적용하세요.
- **카테고리 필터가 비어 보일 때**: 해당 IFC에 그 카테고리 요소가 없으면 보이지 않습니다.

## 라이선스
MIT


---
### Render 설치 충돌(ERESOLVE) 시 빠른 해결
- 본 저장소는 `three@0.135.0`으로 고정되어 있어 정상 설치됩니다.
- 만약 다른 버전으로 바꾸다 충돌하면 **임시 우회**로 아래처럼 빌드 커맨드를 설정하세요:
  ```bash
  npm install --legacy-peer-deps && npm run build
  ```
