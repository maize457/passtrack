# PassTrack

**경찰 9급 공채 수험생 전용 학습 관리 PWA**

배포 URL: https://maize457.github.io/passtrack/passtrack-firebase.html

---

## 기능 요약

| 탭 | 핵심 기능 |
|---|---|
| 홈 | D-Day 카운트다운, 오늘 강의·복습 현황, 집중력 예보 |
| 진도 | 강의 추가/수정/삭제, 뽀모도로 타이머, 세션 기록 |
| 학습 | 오답노트 CRUD, 복습 일정 자동 생성 (에빙하우스 간격), 다시 풀어보기 |
| 성적 | 성적 입력/추이 그래프, AI 분석 (Gemini), OX 퀴즈 생성 |
| 관리 | 수면·식사·운동 기록, 생리 달력·예측, 루틴 체크 |

---

## 기술 스택

- **Frontend**: Vanilla HTML/CSS/JS (단일 파일 PWA)
- **인증/DB**: Firebase Auth (Google OAuth) + Firestore
- **오프라인**: localStorage 자동 폴백
- **AI**: Gemini 1.5 Flash API
- **배포**: GitHub Pages

---

## 파일 구조

```
passtrack-firebase.html   # 앱 본체 (단일 파일)
manifest.json             # PWA 매니페스트
sw.js                     # 서비스 워커 (오프라인 캐시)
firebase.json             # Firebase Hosting 설정
firestore.rules           # Firestore 보안 규칙
icons/
  icon-192.png            # PWA 아이콘 (직접 추가 필요)
  icon-512.png            # PWA 아이콘 (직접 추가 필요)
```

---

## 배포 방법

### GitHub Pages

1. `maize457/passtrack` 저장소에 파일 업로드
2. Settings → Pages → Branch: `main` / `/(root)` 선택
3. `https://maize457.github.io/passtrack/passtrack-firebase.html` 접속

### Firebase 콘솔 필수 설정

1. **Authentication** → Google 공급업체 사용 설정
2. **Authorized domains**에 `maize457.github.io` 추가
3. **Firestore** 보안 규칙 적용 (`firestore.rules` 파일 내용 사용)

---

## 데이터 모델 (Firestore)

기본 경로: `users/{uid}/`

| 컬렉션 | 용도 |
|---|---|
| `lectures` | 강의 목록 |
| `wrongNotes` | 오답노트 |
| `reviewLogs` | 복습 일정 (저장 시 5회차 자동 생성) |
| `scores` | 성적 기록 |
| `routines` | 루틴 체크리스트 |
| `dailyLogs` | 일별 수면/식사/운동 (doc ID = YYYY-MM-DD) |
| `sessions` | 뽀모도로 세션 |
| `periodLogs` | 생리 기록 |
| `_config/main` | 앱 설정 단일 문서 |

---

## 오프라인 동작

Firebase 연결 실패 시 `localStorage`로 자동 전환되며 동일한 UI로 동작합니다.

| localStorage 키 | 데이터 |
|---|---|
| `pt_lec` | lectures |
| `pt_wn` | wrongNotes |
| `pt_rl` | reviewLogs |
| `pt_sc` | scores |
| `pt_rt` | routines |
| `pt_dl` | dailyLogs |
| `pt_sess` | sessions |
| `pt_per` | periodLogs |
| `pt_cfg` | config |
| `pt_searches` | 최근 검색어 |

---

## 구현 현황

### P0 완료 (핵심)
- [x] Firebase 인증 + Firestore 리스너
- [x] 홈 화면 (D-DAY, 복습 목록, 완료 버튼)
- [x] 강의 추가 / 목록 / 진도 업데이트
- [x] 오답 추가 / 목록 / 복습 일정 자동 생성
- [x] 복습 완료 처리
- [x] 오늘 기록(수면) 저장

### P1 완료 (핵심 UX)
- [x] 뽀모도로 타이머 전체 흐름
- [x] 오답 상세 + 편집 + 다시 풀어보기
- [x] 성적 입력 + 추이 그래프
- [x] 성적 기록 수정 / 삭제
- [x] 집중력 예보 자동 계산
- [x] 검색 (오답/강의/성적 동시)
- [x] 토스트 메시지

### P2 완료 (UX 완성도)
- [x] AI 분석 Gemini 연동 (관리 + 성적)
- [x] OX 퀴즈 AI 생성
- [x] 생리 달력 + 예측
- [x] 강의 수정 / 삭제 (액션시트)
- [x] 다크 모드 토글

### P3 완료
- [x] 온보딩 플로우
- [x] 루틴 체크리스트

---

*PassTrack v1.0.0*
