# No_Show_Preventing_App
노쇼 방지 플랫폼

제공된 MySQL 스키마를 기반으로 한 노쇼 방지형 보증금 예약 플랫폼의  
Spring Boot + React 레퍼런스 구현체입니다.

## 추가된 내용 (What was added)
- 기존 SQL 스키마(users, venues, services, reservations, payments, reviews, FAQ)에 맞춘 새로운 Spring Boot 백엔드(`spring-backend`)를 추가했습니다.
- 기존 프론트엔드 라우트가 그대로 동작하도록 API 형태를 맞췄습니다.
  - `/auth/signup`, `/auth/login`
  - `/api/venues`
  - `/api/reservations`
  - `/api/payments/deposit`
  - `/api/reviews/venue/{id}`
- MySQL 스키마는 `spring-backend/src/main/resources/schema.sql` 에 포함되어 있으며,  
  애플리케이션 기동 시 자동으로 실행됩니다.  
  (보증금/등급 관련 트리거·프로시저 로직은 DB 트리거 대신 애플리케이션 코드에서 처리합니다.)

## 사전 준비 사항 (Prerequisites)
- Java 17+
- Maven
- 접속 가능한 MySQL 8.0+
- Node.js 18+ (`frontend` 폴더의 기존 React 프론트엔드용)

## 데이터베이스 (Database)
프롬프트에서 제공된 스키마는 `spring-backend/src/main/resources/schema.sql` 에 포함되어 있습니다.  
Spring Boot는 `continue-on-error=true` 설정으로 이 스크립트를 기동 시 실행하므로,  
비어 있는 데이터베이스를 안전하게 초기화할 수 있습니다.

MySQL에는 `noshow_reservation` 데이터베이스에 대해 테이블 생성 권한이 있는 계정이 필요합니다.

환경 변수(선택 사항 – 괄호 안은 기본값):
- `DB_URL`  
  (`jdbc:mysql://localhost:3306/noshow_reservation?createDatabaseIfNotExist=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8`)
- `DB_USERNAME` (`root`)
- `DB_PASSWORD` (`password`)
- `FRONTEND_URL` (`http://localhost:3000`)
- `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` / `NAVER_CALLBACK_URL`  
  (네이버 로그인 연동 시 필수, 콜백 기본값: `http://localhost:8000/auth/naver/callback`)

## Spring 백엔드 실행 (Run the Spring backend)
```bash
cd spring-backend
mvn spring-boot:run
