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
  min_party_size          INT UNSIGNED NOT NULL DEFAULT 1,
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
  status                           ENUM('DEPOSIT_PENDING','BOOKED','COMPLETED','CANCELED','NO_SHOW','DEPOSIT_FAILED') NOT NULL DEFAULT 'DEPOSIT_PENDING',
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
  UNIQUE KEY uq_exact_slot (service_id, scheduled_start, status),
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

-- 7) 관리자 뷰
CREATE OR REPLACE VIEW v_admin_overview AS
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE r.role_name = 'owner')    AS total_owners,
  (SELECT COUNT(*) FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE r.role_name = 'customer') AS total_customers,
  (SELECT COUNT(*) FROM venues) AS total_venues,
  (SELECT COUNT(*) FROM reservations
     WHERE YEAR(booked_at) = YEAR(CURDATE()) AND MONTH(booked_at) = MONTH(CURDATE())) AS reservations_this_month,
  (SELECT COUNT(*) FROM reservations
     WHERE status = 'NO_SHOW' AND YEAR(booked_at) = YEAR(CURDATE()) AND MONTH(booked_at) = MONTH(CURDATE())) AS noshows_this_month;

CREATE OR REPLACE VIEW v_monthly_reservation_stats AS
SELECT DATE_FORMAT(booked_at, '%Y-%m') AS ym,
       COUNT(*) AS total_resv,
       SUM(status = 'NO_SHOW')     AS noshow_cnt,
       SUM(status = 'COMPLETED')   AS completed_cnt,
       SUM(status = 'CANCELED')    AS canceled_cnt
FROM reservations
GROUP BY DATE_FORMAT(booked_at, '%Y-%m')
ORDER BY ym DESC;

CREATE OR REPLACE VIEW v_user_grade_counts AS
SELECT g.grade_name, COUNT(u.user_id) AS users_in_grade
FROM user_grades g
LEFT JOIN users u ON u.grade_id = g.grade_id
GROUP BY g.grade_id, g.grade_name
ORDER BY users_in_grade DESC;

-- 8) 프로시저 : 등급 자동 재산정
DELIMITER $$

CREATE PROCEDURE sp_recalc_user_grade(IN p_user_id VARCHAR(30))
BEGIN
  DECLARE v_success       INT UNSIGNED DEFAULT 0;
  DECLARE v_noshow        INT UNSIGNED DEFAULT 0;
  DECLARE v_eligible      INT UNSIGNED DEFAULT 0;
  DECLARE v_rate          DECIMAL(8,6) DEFAULT 0;
  DECLARE v_min_auto      INT UNSIGNED DEFAULT 4;
  DECLARE v_new_grade_id  SMALLINT UNSIGNED;
  DECLARE v_cur_grade_id  SMALLINT UNSIGNED;

  SELECT COALESCE(CAST(policy_value AS UNSIGNED), 4)
    INTO v_min_auto
    FROM system_settings WHERE policy_key = 'GRADE_AUTO_MIN_ELIGIBLE'
    LIMIT 1;

  SELECT
    SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END),
    SUM(CASE WHEN r.status = 'NO_SHOW'   THEN 1 ELSE 0 END)
  INTO v_success, v_noshow
  FROM reservations r
  WHERE r.customer_user_id = p_user_id;

  SET v_success  = IFNULL(v_success, 0);
  SET v_noshow   = IFNULL(v_noshow, 0);
  SET v_eligible = v_success + v_noshow;
  SET v_rate     = CASE WHEN v_eligible > 0 THEN v_noshow / v_eligible ELSE 0 END;

  UPDATE users
     SET success_count = v_success,
         no_show_count = v_noshow
   WHERE user_id = p_user_id;

  IF v_eligible < v_min_auto THEN
    SELECT grade_id INTO v_new_grade_id
      FROM user_grades WHERE is_default = TRUE ORDER BY priority LIMIT 1;

  ELSE
    IF v_noshow = 0 THEN
      SELECT grade_id INTO v_new_grade_id
        FROM user_grades WHERE require_no_show_zero = TRUE
        ORDER BY priority LIMIT 1;
    ELSE
      SELECT grade_id INTO v_new_grade_id
        FROM user_grades
       WHERE max_no_show_rate IS NOT NULL
         AND v_rate <= max_no_show_rate
       ORDER BY priority
       LIMIT 1;

      IF v_new_grade_id IS NULL THEN
        SELECT grade_id INTO v_new_grade_id
          FROM user_grades
         WHERE max_no_show_rate IS NULL
           AND require_no_show_zero = FALSE
         ORDER BY priority
         LIMIT 1;
      END IF;
    END IF;
  END IF;

  SELECT grade_id INTO v_cur_grade_id FROM users WHERE user_id = p_user_id;

  IF v_new_grade_id IS NOT NULL AND v_new_grade_id <> v_cur_grade_id THEN
    UPDATE users SET grade_id = v_new_grade_id WHERE user_id = p_user_id;
    INSERT INTO user_grade_assignments (user_id, grade_id, assigned_at, assigned_by)
    VALUES (p_user_id, v_new_grade_id, NOW(), NULL);
  END IF;
END$$

CREATE PROCEDURE sp_recalc_all_user_grades()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_uid VARCHAR(30);
  DECLARE cur CURSOR FOR SELECT user_id FROM users WHERE is_active = TRUE;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_uid;
    IF done = 1 THEN
      LEAVE read_loop;
    END IF;
    CALL sp_recalc_user_grade(v_uid);
  END LOOP;
  CLOSE cur;
END$$

-- 9) 트리거 : 기본등급/스냅샷/리뷰/등급재산정

CREATE TRIGGER bi_users_set_default_grade
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.grade_id IS NULL THEN
    SET NEW.grade_id = (SELECT grade_id FROM user_grades WHERE is_default = TRUE ORDER BY priority LIMIT 1);
  END IF;
END$$

CREATE TRIGGER bi_reservations_snapshot
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
  DECLARE v_deposit_rate DECIMAL(5,2);
  DECLARE v_grade_id SMALLINT UNSIGNED;
  DECLARE v_grade_disc DECIMAL(5,2);

  SELECT COALESCE(vs.deposit_rate_percent, v.default_deposit_rate_percent)
    INTO v_deposit_rate
    FROM venue_services vs
    JOIN venues v ON v.venue_id = vs.venue_id
   WHERE vs.service_id = NEW.service_id;

  SELECT u.grade_id, COALESCE(g.deposit_discount_percent, 0.00)
    INTO v_grade_id, v_grade_disc
    FROM users u
    LEFT JOIN user_grades g ON g.grade_id = u.grade_id
   WHERE u.user_id = NEW.customer_user_id;

  SET NEW.applied_deposit_rate_percent   = v_deposit_rate;
  SET NEW.applied_grade_id               = v_grade_id;
  SET NEW.applied_grade_discount_percent = v_grade_disc;

  IF NEW.total_price_at_booking IS NULL OR NEW.total_price_at_booking = 0 THEN
    SELECT price INTO NEW.total_price_at_booking
      FROM venue_services WHERE service_id = NEW.service_id;
    SET NEW.total_price_at_booking = NEW.total_price_at_booking * NEW.party_size;
  END IF;

  SET NEW.deposit_amount =
    ROUND(NEW.total_price_at_booking * (NEW.applied_deposit_rate_percent/100.0)
          * (1 - (NEW.applied_grade_discount_percent/100.0)), 0);

  IF NEW.currency IS NULL THEN
    SET NEW.currency = 'KRW';
  END IF;
END$$

CREATE TRIGGER bi_reviews_only_completed
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_user   VARCHAR(30);
  DECLARE v_venue  BIGINT UNSIGNED;

  SELECT status, customer_user_id, venue_id
    INTO v_status, v_user, v_venue
    FROM reservations
   WHERE reservation_id = NEW.reservation_id;

  IF v_status <> 'COMPLETED' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Review allowed only for COMPLETED reservations.';
  END IF;

  IF v_user <> NEW.user_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Review must be written by the reservation owner.';
  END IF;

  SET NEW.venue_id = v_venue;
END$$

CREATE TRIGGER ai_reservations_refresh_grade
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
  IF NEW.status IN ('COMPLETED','NO_SHOW') THEN
    CALL sp_recalc_user_grade(NEW.customer_user_id);
  END IF;
END$$

CREATE TRIGGER au_reservations_refresh_grade
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status
     AND (OLD.status IN ('COMPLETED','NO_SHOW') OR NEW.status IN ('COMPLETED','NO_SHOW')) THEN
    CALL sp_recalc_user_grade(NEW.customer_user_id);
  END IF;
END$$

DELIMITER ;
