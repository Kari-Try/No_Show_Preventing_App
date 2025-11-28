-- No-show reservation platform schema for MySQL 8.0+
-- Simplified for Spring Boot initialization (triggers/procs handled in application code)

CREATE DATABASE IF NOT EXISTS noshow_reservation
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE noshow_reservation;
SET time_zone = 'Asia/Seoul';

-- 1) Roles / policies
CREATE TABLE IF NOT EXISTS roles (
  role_id   TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(20) NOT NULL UNIQUE,
  CONSTRAINT ck_roles_name CHECK (role_name IN ('customer','owner','admin'))
) ENGINE=InnoDB;

INSERT INTO roles (role_name) VALUES ('customer'),('owner'),('admin')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

CREATE TABLE IF NOT EXISTS system_settings (
  policy_key   VARCHAR(64) PRIMARY KEY,
  policy_value VARCHAR(255) NOT NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO system_settings (policy_key, policy_value) VALUES
  ('GRADE_AUTO_MIN_ELIGIBLE', '4')
ON DUPLICATE KEY UPDATE policy_value = VALUES(policy_value);

CREATE TABLE IF NOT EXISTS user_grades (
  grade_id                  SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  grade_name                VARCHAR(30) NOT NULL UNIQUE,
  grade_code                VARCHAR(32) UNIQUE,
  deposit_discount_percent  DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  min_success_reservations  INT UNSIGNED NOT NULL DEFAULT 0,
  priority                  SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  is_default                BOOLEAN NOT NULL DEFAULT FALSE,
  require_no_show_zero      BOOLEAN NOT NULL DEFAULT FALSE,
  max_no_show_rate          DECIMAL(5,4) NULL,
  CONSTRAINT ck_grade_discount CHECK (deposit_discount_percent BETWEEN 0 AND 100),
  CONSTRAINT ck_max_no_show_rate CHECK (max_no_show_rate IS NULL OR (max_no_show_rate >= 0 AND max_no_show_rate <= 1))
) ENGINE=InnoDB;

INSERT INTO user_grades
  (grade_name, grade_code, deposit_discount_percent, min_success_reservations, priority, is_default, require_no_show_zero, max_no_show_rate)
VALUES
  ('ELITE','ELITE',      20.00, 0, 1, FALSE, TRUE,  NULL ),
  ('EXCELLENT','EXCELLENT',  10.00, 0, 2, FALSE, FALSE, 0.050),
  ('STANDARD','STANDARD',    0.00, 0, 3, TRUE,  FALSE, 0.200),
  ('POOR','POOR',        0.00, 0, 4, FALSE, FALSE, NULL )
ON DUPLICATE KEY UPDATE
  deposit_discount_percent = VALUES(deposit_discount_percent),
  priority                 = VALUES(priority),
  is_default               = VALUES(is_default),
  require_no_show_zero     = VALUES(require_no_show_zero),
  max_no_show_rate         = VALUES(max_no_show_rate);

-- 2) Users / permissions
CREATE TABLE IF NOT EXISTS users (
  user_id             VARCHAR(30) PRIMARY KEY NOT NULL,
  username            VARCHAR(30)  NOT NULL UNIQUE,
  phone               VARCHAR(20)  NULL UNIQUE,
  email               VARCHAR(255) NULL UNIQUE,
  password_hash       VARBINARY(128) NULL,
  real_name           VARCHAR(50)  NOT NULL,
  login_type          ENUM('local','naver') NOT NULL DEFAULT 'local',
  naver_id            VARCHAR(100) UNIQUE NULL,
  profile_image       VARCHAR(500) NULL,
  grade_id            SMALLINT UNSIGNED NULL,
  no_show_count       INT UNSIGNED NOT NULL DEFAULT 0,
  success_count       INT UNSIGNED NOT NULL DEFAULT 0,
  tos_version         VARCHAR(20)  NOT NULL,
  tos_accepted_at     DATETIME     NOT NULL,
  privacy_version     VARCHAR(20)  NOT NULL,
  privacy_accepted_at DATETIME     NOT NULL,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME     NULL,
  CONSTRAINT fk_users_grade FOREIGN KEY (grade_id) REFERENCES user_grades(grade_id)
    ON UPDATE RESTRICT ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_grade_assignments (
  user_id      VARCHAR(30)          NOT NULL,
  grade_id     SMALLINT UNSIGNED    NOT NULL,
  assigned_at  DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by  VARCHAR(30)          NULL,
  PRIMARY KEY (user_id, assigned_at),
  CONSTRAINT fk_uga_user   FOREIGN KEY (user_id)   REFERENCES users(user_id),
  CONSTRAINT fk_uga_grade  FOREIGN KEY (grade_id)  REFERENCES user_grades(grade_id),
  CONSTRAINT fk_uga_admin  FOREIGN KEY (assigned_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id  VARCHAR(30)       NOT NULL,
  role_id  TINYINT UNSIGNED  NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3) Venues / services / schedule
CREATE TABLE IF NOT EXISTS venues (
  venue_id                      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  owner_user_id                 VARCHAR(30) NOT NULL,
  venue_name                    VARCHAR(100) NOT NULL,
  description                   TEXT NULL,
  base_price                    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  default_deposit_rate_percent  DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  currency                      CHAR(3) NOT NULL DEFAULT 'KRW',
  timezone                      VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul',
  address_line1                 VARCHAR(200) NULL,
  address_line2                 VARCHAR(200) NULL,
  is_active                     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_owner_name (owner_user_id, venue_name),
  CONSTRAINT ck_venue_deposit CHECK (default_deposit_rate_percent BETWEEN 0 AND 100),
  CONSTRAINT fk_venues_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS venue_services (
  service_id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_id                BIGINT UNSIGNED NOT NULL,
  service_name            VARCHAR(100) NOT NULL,
  description             TEXT NULL,
  price                   DECIMAL(12,2) NOT NULL,
  duration_minutes        SMALLINT UNSIGNED NOT NULL,
  capacity                INT UNSIGNED NOT NULL DEFAULT 1,
  deposit_rate_percent    DECIMAL(5,2) NULL,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_venue_service (venue_id, service_name),
  CONSTRAINT ck_vs_deposit CHECK (deposit_rate_percent IS NULL OR deposit_rate_percent BETWEEN 0 AND 100),
  CONSTRAINT fk_vs_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_hours (
  business_hour_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_id         BIGINT UNSIGNED NOT NULL,
  day_of_week      TINYINT UNSIGNED NOT NULL,
  open_time        TIME NOT NULL,
  close_time       TIME NOT NULL,
  UNIQUE KEY uq_bh (venue_id, day_of_week, open_time, close_time),
  CONSTRAINT ck_bh_dow CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT ck_bh_window CHECK (open_time < close_time),
  CONSTRAINT fk_bh_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS availability_blocks (
  block_id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_id     BIGINT UNSIGNED NOT NULL,
  block_date   DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  reason       VARCHAR(200) NULL,
  UNIQUE KEY uq_block (venue_id, block_date, start_time, end_time),
  CONSTRAINT ck_block_window CHECK (start_time < end_time),
  CONSTRAINT fk_block_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4) Reservations / payments
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id                   BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_user_id                 VARCHAR(30) NOT NULL,
  venue_id                         BIGINT UNSIGNED NOT NULL,
  service_id                       BIGINT UNSIGNED NOT NULL,
  party_size                       SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  scheduled_start                  DATETIME NOT NULL,
  scheduled_end                    DATETIME NOT NULL,
  status                           ENUM('BOOKED','COMPLETED','CANCELED','NO_SHOW') NOT NULL DEFAULT 'BOOKED',
  booked_at                        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  canceled_at                      DATETIME NULL,
  canceled_by_user_id              VARCHAR(30) NULL,
  cancel_reason                    VARCHAR(200) NULL,
  no_show_marked_at                DATETIME NULL,
  total_price_at_booking           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  applied_deposit_rate_percent     DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  applied_grade_id                 SMALLINT UNSIGNED NOT NULL,
  applied_grade_discount_percent   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  deposit_amount                   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency                         CHAR(3) NOT NULL DEFAULT 'KRW',
  created_at                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_exact_slot (service_id, scheduled_start),
  KEY ix_resv_customer (customer_user_id, booked_at),
  KEY ix_resv_venue_time (venue_id, scheduled_start),
  CONSTRAINT ck_resv_times CHECK (scheduled_start < scheduled_end),
  CONSTRAINT ck_resv_deposit CHECK (applied_deposit_rate_percent BETWEEN 0 AND 100
                                    AND applied_grade_discount_percent BETWEEN 0 AND 100
                                    AND deposit_amount >= 0),
  CONSTRAINT fk_resv_customer FOREIGN KEY (customer_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_resv_venue    FOREIGN KEY (venue_id) REFERENCES venues(venue_id),
  CONSTRAINT fk_resv_service  FOREIGN KEY (service_id) REFERENCES venue_services(service_id),
  CONSTRAINT fk_resv_canceler FOREIGN KEY (canceled_by_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_resv_grade    FOREIGN KEY (applied_grade_id) REFERENCES user_grades(grade_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  payment_id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_id     BIGINT UNSIGNED NOT NULL,
  payer_user_id      VARCHAR(30) NOT NULL,
  payment_type       ENUM('DEPOSIT','BALANCE','REFUND') NOT NULL,
  method             VARCHAR(30) NOT NULL,
  provider           VARCHAR(30) NULL,
  provider_txn_id    VARCHAR(100) NULL,
  amount             DECIMAL(12,2) NOT NULL,
  currency           CHAR(3) NOT NULL DEFAULT 'KRW',
  status             ENUM('AUTHORIZED','CAPTURED','CANCELED','REFUNDED','FAILED') NOT NULL,
  related_payment_id BIGINT UNSIGNED NULL,
  paid_at            DATETIME NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_provider_txn (provider, provider_txn_id),
  KEY ix_pay_resv (reservation_id, payment_type, status),
  CONSTRAINT ck_pay_amt CHECK (amount >= 0),
  CONSTRAINT fk_pay_resv  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_pay_user  FOREIGN KEY (payer_user_id)  REFERENCES users(user_id),
  CONSTRAINT fk_pay_rel   FOREIGN KEY (related_payment_id) REFERENCES payments(payment_id)
) ENGINE=InnoDB;

-- 5) Reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_id   BIGINT UNSIGNED NOT NULL,
  venue_id         BIGINT UNSIGNED NOT NULL,
  user_id          VARCHAR(30) NOT NULL,
  rating           TINYINT UNSIGNED NOT NULL,
  content          TEXT NOT NULL,
  image_data       LONGBLOB NULL,
  image_mime_type  VARCHAR(50) NULL,
  image_url        VARCHAR(500) NULL,
  owner_reply      TEXT NULL,
  owner_reply_at   DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review_unique (reservation_id),
  KEY ix_review_venue (venue_id, created_at),
  CONSTRAINT ck_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_resv  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE RESTRICT,
  CONSTRAINT fk_reviews_venue FOREIGN KEY (venue_id)       REFERENCES venues(venue_id)        ON DELETE RESTRICT,
  CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)        REFERENCES users(user_id)         ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6) FAQ
CREATE TABLE IF NOT EXISTS venue_faq (
  faq_id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_id   BIGINT UNSIGNED NOT NULL,
  question   VARCHAR(200) NOT NULL,
  answer     TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_faq_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
) ENGINE=InnoDB;
