# Study Dashboard

고등학생 개인 학업 관리용 GitHub Pages 프로토타입입니다.

## 현재 기능

- D-Day 등록 / 삭제 / 자동 계산
- 할 일 등록 / 완료 / 삭제
- 오늘 공부 기록
- 요일별 시간표
- 날짜 선택 캘린더
- 메모
- localStorage 데이터 저장

## GitHub Pages 실행

1. GitHub에서 새 Repository를 만듭니다.
2. `index.html`, `style.css`, `app.js`, `README.md`를 업로드합니다.
3. Repository의 **Settings → Pages**로 이동합니다.
4. 배포 소스를 `Deploy from a branch`로 설정합니다.
5. `main` 브랜치와 `/ (root)`를 선택하고 저장합니다.
6. 잠시 기다리면 GitHub Pages 주소에서 앱이 실행됩니다.

## 데이터

현재 데이터는 서버가 아니라 **사용 중인 브라우저의 localStorage**에 저장됩니다.

따라서 같은 브라우저에서는 새로고침해도 유지되지만, 다른 기기나 브라우저와 자동으로 동기화되지는 않습니다.

## 다음 개발 후보

- 과목별 공부 통계
- 주간 / 월간 공부량
- 시험 / 수행평가 일정
- 실제 교시가 있는 시간표
- 캘린더에 일정 연결
- 오늘의 학업 요약
