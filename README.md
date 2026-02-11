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
- 프론트: `cd frontend && npm run build` → `frontend/dist/`

---

## 배포 (Vercel + Railway)

- **프론트엔드**: Vercel  
- **백엔드 + DB**: Railway (Spring Boot + MySQL)

### 1. Railway: MySQL + 백엔드

1. [Railway](https://railway.app) 로그인 후 **New Project**.
2. **Add Plugin** → **MySQL** 선택. 생성된 MySQL 서비스에서 **Variables** 탭에 접속해 연결 정보 확인.
3. **Add Service** → **GitHub Repo**에서 이 저장소 선택 후:
   - **Root Directory** 설정 칸이 없어도 됨. 프로젝트 루트(`09_NaviPage/`)에 있는 **Dockerfile**이 백엔드를 빌드하므로, Railway가 이 Dockerfile을 자동 감지해 사용함.
   - **Deploy** 후 서비스 URL 확인 (예: `https://navi-backend-production-xxxx.up.railway.app`).
4. 백엔드 서비스 **Variables**에 다음 추가 (MySQL 연결 정보는 2번에서 복사):
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://호스트:포트/DB명?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Seoul`  
     (Railway MySQL은 보통 `MYSQL_URL` 등으로 주어지며, 형식이 `mysql://...` 이면 앞에 `jdbc:` 붙이고 드라이버 호환 형태로 수정)
   - `SPRING_DATASOURCE_USERNAME` = MySQL 사용자명
   - `SPRING_DATASOURCE_PASSWORD` = MySQL 비밀번호
   - `PORT`는 Railway가 자동 주입하므로 별도 설정 불필요.
5. 재배포 후 **Settings** → **Networking** → **Generate Domain** 으로 공개 URL 생성.
6. **DB에 CSV 데이터 넣기**: 브라우저나 curl로 **GET 백엔드URL/api/admin/seed-csv** 를 호출하세요.  
   - DB가 **비어 있을 때**: CSV 데이터가 DB에 들어갑니다. (예: `https://xxx.up.railway.app/api/admin/seed-csv`)  
   - **이미 데이터가 있을 때** (표시가 안 되거나 덮어쓰고 싶을 때): **GET …/api/admin/seed-csv?force=true** 로 호출하면 기존 시즌/경기/출석/골·도움 데이터를 지우고 CSV로 다시 넣습니다. (선수 전화번호는 유지됩니다.)

### 2. Vercel: 프론트엔드

1. [Vercel](https://vercel.com) 로그인 후 **Add New** → **Project**.
2. 이 저장소 연결. **Root Directory**를 `frontend`로 설정.
3. **Environment Variables** 추가:
   - `VITE_API_BASE` = `https://위에서_확인한_Railway_백엔드_URL/api`  
     (끝에 `/api` 포함, 예: `https://navi-backend-production-xxxx.up.railway.app/api`)
4. **Deploy** 후 프론트 URL에서 동작 확인.

### 3. Railway에서 "Communications link failure" / "Connection refused" 나올 때

- **원인**: 백엔드가 MySQL에 연결할 때 쓰는 주소가 `localhost`이거나, 환경 변수가 백엔드 서비스에 없음.
- **해결**:
  1. Railway 대시보드에서 **MySQL 서비스** 선택 → **Variables** 탭에서 다음 값을 복사:
     - 호스트: `MYSQLHOST` 또는 `MYSQL_URL` 안의 호스트
     - 포트: `MYSQLPORT` 또는 URL 안의 포트
     - 사용자: `MYSQLUSER`
     - 비밀번호: `MYSQLPASSWORD`
     - DB명: `MYSQLDATABASE` (없으면 `railway`)
  2. **백엔드 서비스** 선택 → **Variables** 탭에서 아래 세 개를 **반드시** 설정 (값은 위에서 복사한 것 사용):
     - `SPRING_DATASOURCE_URL` = `jdbc:mysql://복사한호스트:복사한포트/복사한DB명?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Seoul`  
       (⚠️ `localhost` 사용 금지. 반드시 MySQL 서비스에서 보이는 호스트/포트 사용)
     - `SPRING_DATASOURCE_USERNAME` = 복사한 사용자명
     - `SPRING_DATASOURCE_PASSWORD` = 복사한 비밀번호
  3. 저장 후 **백엔드 서비스**에서 **Redeploy** 실행.

### 4. 참고

- Railway MySQL Variables에 `MYSQL_PRIVATE_URL` 등이 있으면, 해당 값을 JDBC 형식(`jdbc:mysql://...`)으로 바꿔 `SPRING_DATASOURCE_URL`에 넣으면 됩니다.
- 관리자 비밀번호: Vercel에 `VITE_ADMIN_PASSWORD` 환경 변수로 설정 (선택).
