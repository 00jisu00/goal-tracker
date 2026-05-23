# 목표 트래커 — Claude Code 인수인계 문서

## 프로젝트 개요
Supabase(DB+인증) + Vercel(호스팅) + 단일 HTML 파일로 구성된 PWA 목표 트래커 웹앱.

---

## 배포 정보
- **앱 URL**: https://goal-tracker-seven-zeta.vercel.app
- **GitHub**: https://github.com/00jisu00/goal-tracker
- **Supabase URL**: https://fiikawlccmydcafjylnm.supabase.co
- **Supabase Publishable Key**: sb_publishable_27pcngDMpXY5VuUwIu995w_H87iYXhC
- **Google Cloud 프로젝트**: watch list (watch-list-496100)
- **OAuth 클라이언트**: my watch list

---

## 파일 구조
```
goal-tracker/
├── index.html      # 앱 전체 (CSS + HTML + JS 단일 파일, 약 970줄)
├── manifest.json   # PWA 설정
├── sw.js           # Service Worker (캐시 없이 항상 네트워크 fetch)
├── vercel.json     # Vercel 라우팅 설정
├── icon-192.png    # 앱 아이콘
└── icon-512.png    # 앱 아이콘
```

---

## 앱 기능 구조

### 4개 탭
1. **연간** — 연간 목표 메모장. 수동 달성 체크 가능, 수정/삭제 가능
2. **월간설정** — 월별 독립 운영. 반복형/프로젝트형 목표 설정
3. **오늘체크** — 오늘 날짜 기준 자동 필터. 주차별 프로젝트 목표 표시
4. **리뷰** — 주간현황(W1~W4 타임라인) / 월간요약(달력+날짜클릭 상세)

### 목표 유형
- **반복형**: 주 N회/매일. 오늘체크에서 원클릭 체크, 실행기록 메모
- **프로젝트형**: W1~W4 주차별 세부목표. 해당 주차 것만 오늘체크에 표시. 이번주 완료시 배너로 접힘

### 주차 계산 방식
- 월의 주차를 월요일 기준으로 계산
- 오늘이 속한 주차의 W 번째 세부목표만 오늘체크에 표시
- 예: 5/19(화) = 5월 4주차 → W4 항목만 표시

---

## Supabase DB 스키마

```sql
-- 연간 목표
year_goals (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  text text,
  note text,
  done boolean DEFAULT false,
  created_at timestamptz
)

-- 월간 목표
monthly_goals (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  month_key text,        -- 예: '2026-05'
  name text,
  goal_type text,        -- 'repeat' | 'project'
  log_type text,         -- 'none' | 'memo'
  color text,            -- hex color
  repeat_unit text,      -- 'week' | 'day'
  repeat_count int,
  collapsed boolean,
  sort_order int,
  created_at timestamptz
)

-- 주간 세부 목표 (프로젝트형)
weekly_goals (
  id uuid PRIMARY KEY,
  monthly_goal_id uuid REFERENCES monthly_goals ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  name text,
  note text,
  sort_order int,
  created_at timestamptz
)

-- 달성 체크
goal_checks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  goal_id uuid,
  goal_type text,        -- 'repeat' | 'weekly'
  checked_date text,     -- 'YYYY-MM-DD'
  UNIQUE(user_id, goal_id, checked_date)
)

-- 실행 기록
goal_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  goal_id uuid,
  log_date text,         -- 'YYYY-MM-DD'
  memo text,
  created_at timestamptz
)
```

모든 테이블에 RLS 활성화, 본인 데이터만 접근 정책 적용.

---

## 디자인 시스템
- **참고**: Airbnb(둥근 radius, 따뜻한 톤) + Figma(세그먼트 탭) + Lovable(그라데이션)
- **브랜드 컬러**: #17437d (네이비 블루)
- **폰트**: Inter
- **목표 색상 팔레트 (10색)**:
  - #BFDDF0, #8CC0EB (블루)
  - #9ECAD6, #A7C1A8 (청록+그린)
  - #FBC3C1, #FFA4A4 (코랄)
  - #EBD6FB, #E5D9F2 (연보라)
  - #FFF9D2, #FFE99A (옐로우)

---

## 인증 설정 현황

### Supabase
- Google Provider: **Enabled**
- Site URL: https://goal-tracker-seven-zeta.vercel.app
- Redirect URLs: 3개 등록
  - https://goal-tracker-seven-zeta.vercel.app/**
  - https://goal-tracker-seven-zeta.vercel.app
  - https://goal-tracker-seven-zeta.vercel.app/

### Google Cloud Console (my watch list)
- 승인된 JavaScript 원본:
  - https://00jisu00.github.io
  - https://goal-tracker-seven-zeta.vercel.app
- 승인된 리디렉션 URI:
  - https://00jisu00.github.io/my-watchlist
  - https://fiikawlccmydcafjylnm.supabase.co/auth/v1/callback

### 현재 index.html Supabase 클라이언트 설정
```js
const sb = supabase.createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'goal-tracker-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
```

---

## 현재 미해결 문제 🚨

### 문제
안드로이드 크롬에서 PWA(홈 화면 앱)로 설치 후 Google 로그인이 안 됨.
- 증상: 계정 선택 → 다시 로그인 화면으로 돌아옴
- PC 크롬: 정상 작동
- 안드로이드 크롬 브라우저 직접 접속: 정상 작동
- 안드로이드 PWA(홈 화면 앱): 로그인 안 됨

### 시도한 것들
- Supabase redirect URL 3개 등록 ✅
- Google Cloud Console redirect URI 등록 ✅
- flowType: 'pkce' 적용 ✅
- persistSession + localStorage 설정 ✅
- SW 캐시 무효화 (항상 네트워크 fetch) ✅
- PWA popup 방식 시도 → 안드로이드 팝업 차단으로 실패
- handleAuthRedirect() 함수로 URL hash/code 파싱 시도 ✅
- 크롬 업데이트 완료 ✅
- 캐시 삭제 후 재시도 ✅

### 현재 signInWithGoogle 함수
```js
async function signInWithGoogle() {
  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: currentUrl,
      queryParams: { prompt: 'select_account' }
    }
  });
  if (error) alert('로그인 실패: ' + error.message);
}
```

### 예상 원인
안드로이드 PWA는 별도 브라우저 컨텍스트로 실행되어
OAuth redirect 후 원래 앱으로 돌아오지 못하는 구조적 문제.
localStorage는 공유되나 세션 처리 타이밍 문제 가능성.

---

## 완료된 기능 목록
- ✅ 연간/월간/오늘체크/리뷰 4탭 구조
- ✅ 반복형/프로젝트형 목표 CRUD
- ✅ 주차별 날짜 자동 매핑
- ✅ 목표별 색상 선택
- ✅ 실행 기록 (메모)
- ✅ 월간 달력 + 날짜 클릭 상세
- ✅ Supabase 데이터 영구 저장
- ✅ PC ↔ 모바일 데이터 동기화 (PC에서는 작동)
- ✅ Google 로그인 (PC에서는 작동)
- ✅ PWA 설치 (아이콘, manifest)
- ⬜ 안드로이드 PWA Google 로그인 (미해결)
