# No_Show_Preventing_App

보증금 기반 노쇼 방지 예약 플랫폼 (Spring Boot + React) – 제공된 MySQL 스키마를 그대로 사용합니다.

## 주요 기능
- **전체 스키마 반영**: `spring-backend/src/main/resources/schema.sql`에 있는 테이블/뷰/프로시저/트리거 적용.
- **인증**: 로컬 회원가입/로그인 + 네이버 OAuth (`NAVER_CLIENT_ID/SECRET/CALLBACK_URL`).
- **예약**: 30분 단위 슬롯, 상태 흐름 `DEPOSIT_PENDING → BOOKED`, 10분 내 미결제 시 실패/취소 처리, 겹치는 예약 방지.
- **결제**: 보증금 결제 API, MyReservations에 DEPOSIT_PENDING/FAILED 배지와 결제 버튼 노출.
- **사장 기능**: 업장/서비스/영업시간/예약 불가 관리, 업장 예약 조회 및 노쇼/강제 취소/완료 처리.
- **고객 기능**: 마이페이지에 등급/할인율/예약 통계, “내 리뷰” (이미지 포함) 표시. 업장 상세에서 평균 별점과 리뷰 이미지 조회.
- **리뷰**: 완료된 예약당 1회, 이미지 블롭 저장, `/api/reviews/{id}/image`로 조회.
- **등급 로직**: `GRADE_AUTO_MIN_ELIGIBLE=4` (4건 미만은 기본 STANDARD), 노쇼율 기반 자동 재산정(프로시저/트리거).

## 준비물
- Java 17+, Maven
- MySQL 8.0+
- Node.js 18+ (React 프론트)

## 환경 변수 예시
```
DB_URL=jdbc:mysql://localhost:3306/noshow_reservation?createDatabaseIfNotExist=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=비밀번호
FRONTEND_URL=http://localhost:3000
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
NAVER_CALLBACK_URL=http://localhost:8000/auth/naver/callback
```

## 백엔드 실행
```
cd spring-backend
mvn spring-boot:run
```
기동 시 `schema.sql`이 자동 실행되어 빈 DB를 초기화합니다. 스키마를 수정했다면 `mvn clean package`로 `target/classes/schema.sql`을 갱신하세요.

## 추가 모듈 설치
npm install swiper
npm install --save kakao-maps-sdk

## 프런트 실행
```
cd frontend
npm install
npm start
```
기본 포트는 http://localhost:3000, API 기본 주소는 http://localhost:8000 으로 가정합니다.

## 등급별 보증금 할인 안내 (기본 설정)
- ELITE: 20% (노쇼 0명 전용)
- EXCELLENT: 10% (노쇼율 5% 이하)
- STANDARD: 0% (기본, 노쇼율 20% 이하)
- POOR: 0% (한계 초과 시 적용)

## 기타
- 사장 전용 화면: `/my-venues`, `/owner/reservations`
- 고객 전용: `/my-reservations`, `/mypage`
- 리뷰는 COMPLETED 예약의 작성자만 가능, 예약당 1개. 이미지 블롭은 `/api/reviews/{id}/image`로 조회.
