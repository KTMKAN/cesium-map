# cesium-map
- 개요 : cesium 라이브러리를 활용한 Draw Interaction 구현 연습 Vue 프로젝트
- 주요사항
1. 진행단계
    가. CesiumView1 : Line 그리기 구현
    나. CesiumView2 : Rectangle 그리기 구현
    다. CesiumView3 : Point, Line, Rectangle, Circle, Polygon 그리기 구현, LayerList(레이어관리 컴포넌트) 구현 
    라. CesiumView4 : Cesium Draw Interection 고도화-컴포넌트화,
2. 각 컴포넌트는 class 형태의 ts 파일로 구현하므로써 특정 프레임워크에 대한 종속성이 없도록 구현
3. 컴포넌트들 간의 이벤트 핸들링을 위해 Observer패턴을 활용 => Observable 클래스를 extends or use 하여 이벤트 핸들링 기능 삽입
4. 컴포넌트 설계시 UI부분을 Renderer로 따로 분리하여 Logic과 UI간의 종속성 제거

## 실행전
npm install

## 실행
npm run serve
