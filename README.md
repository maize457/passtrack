# PWA

.

## 
****

---

## 파일 구조

```
passtrack/
├── passtrack-firebase.html   ← 앱 본체 (단일 파일)
├── manifest.json             ← PWA 매니페스트
├── sw.js                     ← 서비스 워커 (오프라인 지원)
├── firebase.json             ← Firebase Hosting 설정
├── firestore.rules           ← Firestore 보안 규칙
├── icons/
│   ├── icon-192.png          ← PWA 아이콘 (직접 추가 필요)
│   └── icon-512.png          ← PWA 아이콘 (직접 추가 필요)
└── README.md
```

---

## GitHub Pages 배포 방법

1. 이 저장소를 `passtrack`으로 생성
2. 모든 파일 업로드
3. Settings → Pages → Branch: `main` / `(root)` 저장

---

## Firebase 설정 (최초 1회)

### 1. Authentication
- Firebase Console → Authentication → Sign-in method
- **Google** 사용 설정
- 승인된 도메인 → `maize457.github.io` 추가

### 2. Firestore 규칙
Firebase Console → Firestore → 규칙 탭에 `firestore.rules` 내용 붙여넣기

### 3. Firestore 인덱스 (필요 시)
자동 생성 링크가 콘솔에 뜨면 클릭하여 생성

---

## 주요 기능

| 탭 | 기능 |
|---|---|
| 홈 | D-Day, 오늘 할 일 진행률, 강의/복습 현황, 집중력 예보, 주간 리포트 |
| 진도 | 강의 CRUD, 뽀모도로 타이머, 세션 요약, 완강 화면 |
| 학습 | 오답노트 CRUD, AI 이미지 인식, 복습 일정 자동 생성 |
| 성적 | 과목별·총합 성적 그래프, AI 분석, OX 퀴즈 |
| 관리 | 오늘 기록(수면/식사/운동), 생리 달력, AI 학습 분석, 루틴 체크 |

---

## 기술 스택

- Vanilla HTML/CSS/JS (단일 파일 PWA)
- Firebase Auth (Google OAuth) + Firestore 실시간 동기화
- localStorage 자동 폴백 (비로그인 사용 가능)
- Gemini 1.5 Flash API (AI 분석, 이미지 OCR, OX 퀴즈)

---

## Firebase 설정값 (앱 내 하드코딩)

```
Project: passtrack-3dffb
Auth Domain: passtrack-3dffb.firebaseapp.com
```
