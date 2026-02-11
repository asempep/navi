# NAVI 시즌 전적 웹사이트

- **프론트엔드**: React (Vite)
- **백엔드**: Java Spring Boot
- **DB**: MySQL

## 기능

- **홈**: 시즌 전적(경기/승/무/패), 득점순위, 도움순위, 출석순위
- **탭**: 홈 | 전체 경기 | 골 | 도움 | 출석
- **선수 상세**: 홈에서 선수 이름 클릭 시 출석·골·어시·전화번호 및 **참가한 경기** 목록(경기별 골/어시) 표시
- **관리자**: 선수 전화번호 입력·수정 (관리 페이지에서 저장)

## 사전 요구사항

- JDK 17+
- Node.js 18+
- MySQL 8.x (로컬 또는 원격)

## 1. MySQL DB 생성

```bash
mysql -u root -p
```

```sql
CREATE DATABASE navi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

백엔드 `application.yml`에서 DB 비밀번호를 본인 환경에 맞게 수정하세요.

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/navi_db?...
    username: root
    password: 여기에_비밀번호
```

## 2. 백엔드 실행 (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

(Maven이 없어도 `./mvnw`가 첫 실행 시 Maven을 받아서 사용합니다.)

또는 IDE에서 `NaviApplication` 실행.

- 초기 데이터(시즌 전적 2경기, 선수, 골/도움/출석)를 넣으려면:
  ```bash
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=init
  ```
  (최초 1회만 실행하면 됩니다.)

API: `http://localhost:8080/api/home`, `/api/matches`, `/api/goals`, `/api/assists`, `/api/attendance`, `/api/player/{선수명}`, `/api/players`(관리자용)

## 3. 프론트엔드 실행 (React)

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

- Vite 프록시로 `/api` 요청이 백엔드(8080)로 전달됩니다.

## 선수 전화번호 및 DB

- **player 테이블**에 `phone_number` 컬럼이 없으면, **백엔드 재시작 시** `spring.jpa.hibernate.ddl-auto: update` 설정으로 자동 추가됩니다. (`application.yml`에 이미 설정되어 있음.)
- 전화번호는 **관리자 페이지**에서만 입력·수정할 수 있습니다. 관리자 로그인 후 「선수 전화번호 관리」에서 선수별로 입력하고 해당 행의 「저장」을 누르면 반영됩니다.

## 프로젝트 구조

```
09_NaviPage/
├── backend/                 # Spring Boot
│   ├── src/main/java/com/navi/
│   │   ├── entity/          # JPA 엔티티
│   │   ├── repository/
│   │   ├── service/
│   │   ├── controller/
│   │   └── dto/
│   └── src/main/resources/
│       └── application.yml
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── pages/           # 홈, 전체경기, 골, 도움, 출석
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
├── 2026 NAVI - *.csv        # 참고용 원본 데이터
└── README.md
```

## 빌드

- 백엔드: `cd backend && ./mvnw package` → `target/navi-backend-1.0.0.jar`
- 프론트: `cd frontend && npm run build` → `frontend/dist/` (정적 파일을 Spring에서 서빙하려면 백엔드에 복사 후 설정 추가)
