<div align="center">

# 🔍 PassageFinder

**시험 문제의 출처 지문을 PDF에서 즉시 찾아주는 데스크톱 앱**

[![version](https://img.shields.io/badge/version-1.0.2-blue?style=flat-square)](https://github.com/YMJ-02/pdf_search_v2/releases)
[![platform](https://img.shields.io/badge/platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white)](https://github.com/YMJ-02/pdf_search_v2/releases)
[![license](https://img.shields.io/github/license/YMJ-02/pdf_search_v2?style=flat-square&color=green)](https://github.com/YMJ-02/pdf_search_v2/blob/main/LICENSE)

</div>

---

중간·기말고사가 끝나면 항상 같은 질문이 온다. *"이 문제, 어디서 나온 거예요?"*

PassageFinder는 시험 문제의 키워드를 입력하면, 수업 시간에 쓴 PDF 교재에서 해당 지문이 어느 페이지에 있는지 바로 찾아준다.

Python도, Node.js도 설치할 필요 없다. `.exe` 파일 하나를 설치하면 끝.

---

## 작동 방식

```
PDF 교재 업로드
  ↓
  페이지별 텍스트 추출 (PyMuPDF)
  ↓
  TF-IDF + N-gram + LSA 모델 학습
  ↓
  시험 문제 키워드 입력
  ↓
  코사인 유사도 계산 → 관련 지문 페이지 반환
```

---

## 설치 방법

> Python, Node.js 등 별도 설치 불필요. 설치 파일 하나로 바로 사용 가능.

1. 아래 **Releases** 페이지에서 `PassageFinder Setup x.x.x.exe` 다운로드
   → [https://github.com/YMJ-02/pdf_search_v2/releases](https://github.com/YMJ-02/pdf_search_v2/releases)
2. 다운받은 `.exe` 더블클릭
3. **다음 → 다음 → 설치 완료**
4. 바탕화면의 **PassageFinder** 아이콘 클릭하면 바로 실행

> 각 컴퓨터마다 독립적으로 설치·사용 가능. 데이터는 각자 PC에 저장됨.

---

## 사용법

### 1. PDF 업로드

1. 왼쪽 **파일 선택** 버튼 클릭
2. 수업에서 사용한 PDF 교재 선택 (여러 개 동시 선택 가능)
3. **업로드** 버튼 클릭 → 처리 완료까지 대기

### 2. 지문 검색

1. 오른쪽 검색창에 시험 문제의 핵심 키워드 또는 문장 입력
2. Enter 또는 검색 버튼 클릭
3. 유사도 순으로 정렬된 결과 확인 — 파일명, 페이지 번호, 해당 지문 미리보기 제공

### 3. 데이터 초기화

새 학기·새 시험 범위로 교체할 때:
- **전체 초기화** 버튼 클릭 → 업로드된 PDF와 학습된 모델 전체 삭제
- 이후 새 PDF를 다시 업로드하면 됨

---

## 검색 알고리즘

| 기술 | 역할 |
|------|------|
| **TF-IDF** | 각 페이지에서 중요한 단어 가중치 계산 |
| **N-gram** | 연속된 단어 패턴(구문) 인식 |
| **LSA** (잠재 의미 분석) | 단어 의미 기반 유사 개념 매칭 |
| **Cosine Similarity** | 입력 쿼리와 각 페이지의 유사도 점수 계산 |

---

## 프로젝트 구조

```
pdf_search_v2/
├── backend/
│   ├── app.py              # Flask API 서버
│   ├── nlp_processor.py    # TF-IDF / LSA 모델 처리
│   ├── pdf_processor.py    # PDF 텍스트 추출
│   ├── requirements.txt    # Python 의존성
│   └── backend.spec        # PyInstaller 빌드 스펙
├── frontend/
│   └── src/
│       ├── App.jsx          # 메인 앱
│       └── components/      # UI 컴포넌트
├── electron/
│   ├── main.js             # Electron 메인 프로세스
│   └── preload.js          # IPC 브릿지
├── .github/workflows/
│   └── build.yml           # GitHub Actions 자동 빌드
└── package.json            # Electron 빌드 설정
```

---

## 개발자 빌드 방법

### 요구 사항

- Python 3.11+
- Node.js 20+
- Git

### 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/YMJ-02/pdf_search_v2.git
cd pdf_search_v2

# 2. Python 백엔드 의존성 설치
cd backend
pip install -r requirements.txt
python app.py

# 3. 새 터미널에서 프론트엔드 실행
cd frontend
npm install
npm run dev
```

### 배포용 .exe 빌드

```bash
# 태그 push → GitHub Actions가 자동으로 빌드 후 Releases에 업로드
git tag v1.x.x
git push origin v1.x.x
```

---

## 버전 히스토리

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0.2 | 2026-04-18 | 한글 파일명 인코딩 수정 (UTF-8 강제 적용) |
| 1.0.1 | 2026-04-18 | 한글 UI 깨짐 수정, 버전명 수정 |
| 1.0.0 | 2026-04-18 | 최초 데스크톱 앱 릴리즈 (Electron + PyInstaller) |

---

## 개발자

| | |
|--|--|
| GitHub | [@YMJ-02](https://github.com/YMJ-02) |
| 다른 프로젝트 | [SlideScribe](https://github.com/YMJ-02/SlideScribe) — 강의 영상을 구조화된 노트로 변환 |

---

## 버그 제보

[Issues](https://github.com/YMJ-02/pdf_search_v2/issues) 탭에서 제보해 주세요.

제보 시 아래 정보를 포함해 주세요:
- Windows 버전
- 발생한 상황 (어떤 작업 중 오류가 났는지)
- 오류 메시지 스크린샷
