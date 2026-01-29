# Plan: Photo Booth 정밀 레이아웃 및 고정 해상도 구현

## TL;DR

> **Quick Summary**: 기기 환경에 관계없이 동일한 고품질 결과물을 얻을 수 있도록 고정 해상도 캔버스 엔진을 구현하고, 요청하신 정밀 디자인 가이드(픽셀 단위 배치, 폰트 웨이트 등)를 적용합니다.
> 
> **Deliverables**:
> - 고정 해상도 다운로드 엔진 (`photobooth-context.tsx`)
> - 정밀 프리뷰 UI (`ResultStep.tsx`)
> - Pretendard 폰트 웨이트 최적화 (`globals.css`)
> 
> **Estimated Effort**: Short
> **Parallel Execution**: NO - 순차적 구현 권장
> **Critical Path**: Canvas 로직 수정 → 프리뷰 UI 동기화

---

## Context

### Original Request
사용자가 제공한 고정 픽셀 규격(일반 1500x2250, 세로 1375x4096)과 사진 크기, 간격(23px), 폰트 가이드(Pretendard Medium 500, 로고 66px, 날짜 33px)를 결과물에 완벽하게 적용하고 기기별 해상도 이슈를 해결해야 함.

### Interview Summary
**Key Discussions**:
- **고정 해상도**: 화면 해상도가 아닌 캔버스 고정 픽셀 값을 사용하여 화질 저하 및 비율 어긋남 방지.
- **광고 로직**: 첫 다운로드 시에만 광고, 이후 즉시 다운로드 가능하도록 구현.
- **레이아웃**: 상하단 여백 자동 계산을 통해 로고와 날짜의 중앙 정렬 보장.

### Metis Review
**Identified Gaps** (addressed):
- **폰트 로딩**: 캔버스 드로잉 시 폰트 로딩 완료를 보장해야 함 (FontFace API 사용 검토).
- **이미지 품질**: `toDataURL` 사용 시 품질 파라미터 최적화.

---

## Work Objectives

### Core Objective
모든 모바일 기기에서 동일한 픽셀 규격과 디자인 레이아웃을 가진 인화 사진 다운로드 기능 구현.

### Concrete Deliverables
- `components/photobooth/photobooth-context.tsx`의 `downloadResult` 함수.
- `components/photobooth/steps/Result.tsx`의 프리뷰 섹션.

### Definition of Done
- [ ] 일반 4컷 다운로드 파일 크기가 정확히 1500x2250px인가?
- [ ] 세로 4컷 다운로드 파일 크기가 정확히 1375x4096px인가?
- [ ] 사진 사이 간격이 23px로 고정되어 있는가?
- [ ] 로고와 날짜가 각각 상하단 영역의 정중앙에 위치하는가?
- [ ] 폰트가 Pretendard Medium(500)으로 적용되었는가?

---

## Verification Strategy

### QA approach: Manual verification
- **명령어**: 다운로드 버튼 클릭 후 생성된 이미지 파일의 상세 정보 확인.
- **체크포인트**: 이미지 해상도, 컷 사이 간격(픽셀 측정), 폰트 두께 육안 확인.

---

## TODOs

- [ ] 1. **고정 해상도 캔버스 생성 및 배경 로직 수정**

  **What to do**:
  - `layout` 타입에 따라 캔버스 크기 고정 (1500x2250 또는 1375x4096).
  - 테마별 그라디언트/단색 배경을 새 캔버스 크기에 맞춰 다시 그리기.
  - 상단 로고 영역과 하단 날짜 영역의 높이를 사진 영역 배치 후 남는 공간으로 자동 계산.

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 픽셀 단위의 정확한 좌표 계산이 필요함.
  - **Skills**: `bash`, `lsp_diagnostics`

  **Acceptance Criteria**:
  - `canvas.width`와 `canvas.height`가 상수로 고정됨.
  - 배경색이 전체 캔버스를 빈틈없이 채움.

- [ ] 2. **정밀 사진 배치 및 필터 적용**

  **What to do**:
  - 사진 크기 고정 (일반: 673x926, 세로: 1244x904).
  - 간격(gap) 23px 적용.
  - 사진 영역의 시작 Y 좌표(`startY`)를 상단 여백 이후로 설정.
  - `ctx.rect`를 사용하여 라운드 없이 각진 형태로 사진 배치.

  **Acceptance Criteria**:
  - 사진 컷 사이의 간격이 정확히 23px임.
  - 사진에 radius(둥근 모서리)가 전혀 없음.

- [ ] 3. **로고 및 날짜 타이포그래피 구현 (Medium 500)**

  **What to do**:
  - `ctx.font` 설정 시 `500` 웨이트 명시.
  - 로고: 66px, 상단 영역 중앙 배치.
  - 날짜: 33px, 하단 영역 중앙 배치.
  - `textBaseline = "middle"`을 사용하여 수직 중앙 정렬 정밀도 향상.

  **Acceptance Criteria**:
  - 폰트 크기가 가이드와 일치함.
  - 상하단 여백 내에서 시각적 중앙 정렬이 완벽함.

- [ ] 4. **결과 페이지 프리뷰 UI 동기화**

  **What to do**:
  - `ResultStep.tsx`에서 보이는 프리뷰 화면도 결과물과 비슷한 비율(2:3 또는 약 1:3)을 유지하도록 CSS 조정.
  - 프리뷰 내의 사진 간격도 비율에 맞춰 시각적으로 조정.

  **Acceptance Criteria**:
  - 프리뷰 화면이 다운로드될 이미지와 거의 흡사함.

---

## Success Criteria

### Final Checklist
- [ ] 모든 해상도에서 1500x2250 / 1375x4096 이미지 생성 성공.
- [ ] 첫 다운로드 시에만 광고가 뜨고, 이후 무제한 다운로드 가능.
- [ ] 폰트 및 굵기가 가이드(Medium 500)를 정확히 따름.
