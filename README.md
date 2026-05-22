# 목표 트래커

## 배포 방법

### 1. Supabase Google 로그인 활성화
Supabase 대시보드 → Authentication → Providers → Google 활성화

### 2. GitHub에 올리기
```bash
git init
git add .
git commit -m "목표 트래커 초기 배포"
git remote add origin https://github.com/YOUR_USERNAME/goal-tracker.git
git push -u origin main
```

### 3. Vercel 배포
- vercel.com 접속 → GitHub 연동 → goal-tracker 레포 선택 → Deploy

### 4. Supabase Redirect URL 설정
Supabase → Authentication → URL Configuration
- Site URL: https://your-app.vercel.app
- Redirect URL 추가: https://your-app.vercel.app/**

### 5. 안드로이드 설치
Chrome에서 앱 URL 접속 → 메뉴(⋮) → "홈 화면에 추가"
