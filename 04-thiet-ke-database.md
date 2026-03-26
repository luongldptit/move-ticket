# 04 - THIẾT KẾ DATABASE
## Hệ Thống Đặt Vé Xem Phim Trực Tuyến

> **Database:** MySQL 8.x | **ORM:** Spring Data JPA + Hibernate | **Phiên bản:** 1.0 | **Ngày:** 26/03/2026

---

## 1. DANH SÁCH BẢNG

| STT | Tên bảng | Mục đích |
|:---:|---|---|
| 1 | `users` | Lưu thông tin tài khoản người dùng và phân quyền (CUSTOMER / STAFF / ADMIN) |
| 2 | `movies` | Lưu thông tin phim (tên, mô tả, đạo diễn, thời lượng, trạng thái) |
| 3 | `genres` | Danh mục thể loại phim (Hành động, Hài, Tình cảm, Kinh dị...) |
| 4 | `movie_genres` | Bảng trung gian quan hệ N-N giữa phim và thể loại |
| 5 | `cinemas` | Thông tin các rạp phim (tên, địa chỉ, liên hệ) |
| 6 | `rooms` | Phòng chiếu thuộc rạp (loại phòng: 2D / 3D / IMAX) |
| 7 | `seats` | Ghế ngồi trong từng phòng chiếu (STANDARD / VIP / COUPLE) |
| 8 | `showtimes` | Suất chiếu: liên kết phim + phòng + thời gian + giá vé |
| 9 | `bookings` | Đơn đặt vé của khách hàng, lưu tổng tiền và trạng thái |
| 10 | `booking_seats` | Chi tiết ghế được chọn trong từng đơn đặt vé |
| 11 | `payments` | Thông tin thanh toán tương ứng với mỗi đơn đặt vé |
| 12 | `promotions` | Mã khuyến mãi / mã giảm giá và điều kiện áp dụng |

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG BẢNG

---

### 2.1 Bảng `users`

> Lưu thông tin đăng ký tài khoản và vai trò hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa BCrypt |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên đầy đủ |
| `phone` | VARCHAR(15) | NULL | Số điện thoại |
| `role` | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | Vai trò: `CUSTOMER` / `STAFF` / `ADMIN` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Trạng thái tài khoản (khóa / hoạt động) |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm tạo tài khoản |
| `updated_at` | DATETIME | NULL, ON UPDATE NOW() | Thời điểm cập nhật gần nhất |

```sql
CREATE TABLE users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    full_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(15),
    role       ENUM('CUSTOMER','STAFF','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
);
```

---

### 2.2 Bảng `movies`

> Lưu thông tin chi tiết của từng bộ phim.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `title` | VARCHAR(255) | NOT NULL | Tên phim |
| `description` | TEXT | NULL | Nội dung / tóm tắt phim |
| `director` | VARCHAR(100) | NULL | Tên đạo diễn |
| `cast_members` | TEXT | NULL | Danh sách diễn viên (phân tách bằng dấu phẩy) |
| `duration` | INT | NOT NULL | Thời lượng phim (phút) |
| `release_date` | DATE | NULL | Ngày khởi chiếu chính thức |
| `poster_url` | VARCHAR(500) | NULL | Đường dẫn ảnh poster |
| `trailer_url` | VARCHAR(500) | NULL | Đường dẫn URL trailer (YouTube...) |
| `age_rating` | ENUM | NOT NULL, DEFAULT 'P' | Xếp hạng độ tuổi: `P` / `C13` / `C16` / `C18` |
| `status` | ENUM | NOT NULL, DEFAULT 'COMING_SOON' | Trạng thái: `NOW_SHOWING` / `COMING_SOON` / `STOPPED` |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm thêm phim |
| `updated_at` | DATETIME | NULL, ON UPDATE NOW() | Thời điểm cập nhật gần nhất |

```sql
CREATE TABLE movies (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    director      VARCHAR(100),
    cast_members  TEXT,
    duration      INT          NOT NULL COMMENT 'minutes',
    release_date  DATE,
    poster_url    VARCHAR(500),
    trailer_url   VARCHAR(500),
    age_rating    ENUM('P','C13','C16','C18') NOT NULL DEFAULT 'P',
    status        ENUM('NOW_SHOWING','COMING_SOON','STOPPED') NOT NULL DEFAULT 'COMING_SOON',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

---

### 2.3 Bảng `genres`

> Danh mục thể loại phim.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Tên thể loại (Hành động, Hài, Tình cảm...) |
| `description` | VARCHAR(255) | NULL | Mô tả ngắn về thể loại |

```sql
CREATE TABLE genres (
    id          INT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uq_genres_name (name)
);
```

---

### 2.4 Bảng `movie_genres`

> Bảng trung gian thể hiện quan hệ **N-N** giữa phim và thể loại (1 phim có nhiều thể loại, 1 thể loại có nhiều phim).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `movie_id` | BIGINT | FK → `movies.id`, NOT NULL | ID phim |
| `genre_id` | INT | FK → `genres.id`, NOT NULL | ID thể loại |

```sql
CREATE TABLE movie_genres (
    movie_id  BIGINT NOT NULL,
    genre_id  INT    NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_mg_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);
```

---

### 2.5 Bảng `cinemas`

> Thông tin các rạp phim trong hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `name` | VARCHAR(100) | NOT NULL | Tên rạp phim |
| `address` | TEXT | NOT NULL | Địa chỉ đầy đủ |
| `phone` | VARCHAR(15) | NULL | Số điện thoại liên hệ |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Trạng thái hoạt động của rạp |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm tạo |

```sql
CREATE TABLE cinemas (
    id         INT          NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    address    TEXT         NOT NULL,
    phone      VARCHAR(15),
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

---

### 2.6 Bảng `rooms`

> Phòng chiếu thuộc về một rạp phim.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `cinema_id` | INT | FK → `cinemas.id`, NOT NULL | Rạp phim chứa phòng này |
| `name` | VARCHAR(50) | NOT NULL | Tên phòng (Phòng 1, Phòng IMAX...) |
| `type` | ENUM | NOT NULL, DEFAULT '2D' | Loại phòng: `2D` / `3D` / `IMAX` |
| `total_seats` | INT | NOT NULL, DEFAULT 0 | Tổng số ghế (tính tự động hoặc nhập) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Phòng đang hoạt động hay đóng cửa |

```sql
CREATE TABLE rooms (
    id          INT         NOT NULL AUTO_INCREMENT,
    cinema_id   INT         NOT NULL,
    name        VARCHAR(50) NOT NULL,
    type        ENUM('2D','3D','IMAX') NOT NULL DEFAULT '2D',
    total_seats INT         NOT NULL DEFAULT 0,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_name_per_cinema (cinema_id, name),
    CONSTRAINT fk_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
);
```

---

### 2.7 Bảng `seats`

> Từng ghế ngồi trong một phòng chiếu, được đánh số theo hàng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `room_id` | INT | FK → `rooms.id`, NOT NULL | Phòng chiếu chứa ghế này |
| `row_label` | CHAR(1) | NOT NULL | Ký hiệu hàng: A, B, C... |
| `seat_number` | INT | NOT NULL | Số ghế trong hàng: 1, 2, 3... |
| `seat_code` | VARCHAR(10) | NOT NULL | Mã ghế tổng hợp: A1, A2, B3... |
| `type` | ENUM | NOT NULL, DEFAULT 'STANDARD' | Loại ghế: `STANDARD` / `VIP` / `COUPLE` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Ghế còn sử dụng được không |

```sql
CREATE TABLE seats (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    room_id     INT         NOT NULL,
    row_label   CHAR(1)     NOT NULL,
    seat_number INT         NOT NULL,
    seat_code   VARCHAR(10) NOT NULL,
    type        ENUM('STANDARD','VIP','COUPLE') NOT NULL DEFAULT 'STANDARD',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seat_per_room (room_id, seat_code),
    CONSTRAINT fk_seats_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```

---

### 2.8 Bảng `showtimes`

> Suất chiếu: kết nối phim với phòng chiếu tại một thời điểm cụ thể, kèm giá vé.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `movie_id` | BIGINT | FK → `movies.id`, NOT NULL | Phim được chiếu |
| `room_id` | INT | FK → `rooms.id`, NOT NULL | Phòng chiếu |
| `start_time` | DATETIME | NOT NULL | Thời gian bắt đầu chiếu |
| `end_time` | DATETIME | NOT NULL | Thời gian kết thúc (= start + duration) |
| `price_standard` | DECIMAL(10,2) | NOT NULL | Giá vé ghế thường (VND) |
| `price_vip` | DECIMAL(10,2) | NOT NULL | Giá vé ghế VIP (VND) |
| `price_couple` | DECIMAL(10,2) | NOT NULL | Giá vé ghế đôi Couple (VND) |
| `status` | ENUM | NOT NULL, DEFAULT 'SCHEDULED' | `SCHEDULED` / `ONGOING` / `FINISHED` / `CANCELLED` |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm tạo suất chiếu |

> ⚠️ **Ràng buộc nghiệp vụ:** Không cho phép 2 suất chiếu cùng `room_id` có khoảng thời gian `[start_time, end_time]` chồng lên nhau — kiểm tra ở tầng Service.

```sql
CREATE TABLE showtimes (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    movie_id       BIGINT         NOT NULL,
    room_id        INT            NOT NULL,
    start_time     DATETIME       NOT NULL,
    end_time       DATETIME       NOT NULL,
    price_standard DECIMAL(10,2)  NOT NULL,
    price_vip      DECIMAL(10,2)  NOT NULL,
    price_couple   DECIMAL(10,2)  NOT NULL,
    status         ENUM('SCHEDULED','ONGOING','FINISHED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_st_movie FOREIGN KEY (movie_id) REFERENCES movies(id),
    CONSTRAINT fk_st_room  FOREIGN KEY (room_id)  REFERENCES rooms(id)
);
```

---

### 2.9 Bảng `bookings`

> Đơn đặt vé của khách hàng, tổng hợp thông tin đặt chỗ và thanh toán.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `booking_code` | VARCHAR(20) | UNIQUE, NOT NULL | Mã đặt vé duy nhất (dùng in QR) |
| `user_id` | BIGINT | FK → `users.id`, NOT NULL | Khách hàng thực hiện đặt vé |
| `showtime_id` | BIGINT | FK → `showtimes.id`, NOT NULL | Suất chiếu được đặt |
| `promotion_id` | INT | FK → `promotions.id`, NULL | Mã khuyến mãi được áp dụng (nếu có) |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Tổng tiền trước giảm giá |
| `discount_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Số tiền được giảm |
| `final_amount` | DECIMAL(10,2) | NOT NULL | Số tiền thực tế phải trả |
| `status` | ENUM | NOT NULL, DEFAULT 'PENDING' | `PENDING` / `CONFIRMED` / `CANCELLED` / `EXPIRED` |
| `qr_code` | VARCHAR(500) | NULL | Dữ liệu hoặc URL ảnh QR code vé |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm tạo đơn |
| `updated_at` | DATETIME | NULL, ON UPDATE NOW() | Thời điểm cập nhật gần nhất |

```sql
CREATE TABLE bookings (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    booking_code    VARCHAR(20)   NOT NULL,
    user_id         BIGINT        NOT NULL,
    showtime_id     BIGINT        NOT NULL,
    promotion_id    INT           NULL,
    total_amount    DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    final_amount    DECIMAL(10,2) NOT NULL,
    status          ENUM('PENDING','CONFIRMED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
    qr_code         VARCHAR(500),
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_booking_code (booking_code),
    CONSTRAINT fk_bk_user      FOREIGN KEY (user_id)      REFERENCES users(id),
    CONSTRAINT fk_bk_showtime  FOREIGN KEY (showtime_id)  REFERENCES showtimes(id),
    CONSTRAINT fk_bk_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);
```

---

### 2.10 Bảng `booking_seats`

> Chi tiết từng ghế được chọn trong một đơn đặt vé.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `booking_id` | BIGINT | FK → `bookings.id`, NOT NULL | Đơn đặt vé |
| `seat_id` | BIGINT | FK → `seats.id`, NOT NULL | Ghế được chọn |
| `price` | DECIMAL(10,2) | NOT NULL | Giá ghế tại thời điểm đặt |

> ⚠️ **Ràng buộc nghiệp vụ:** Một ghế (`seat_id`) không được đặt hai lần trong cùng một suất chiếu (`showtime_id` từ `bookings`). Kiểm tra ở tầng Service khi trạng thái booking là `PENDING` hoặc `CONFIRMED`.

```sql
CREATE TABLE booking_seats (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    booking_id BIGINT        NOT NULL,
    seat_id    BIGINT        NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_booking_seat (booking_id, seat_id),
    CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_bs_seat    FOREIGN KEY (seat_id)    REFERENCES seats(id)
);
```

---

### 2.11 Bảng `payments`

> Thông tin giao dịch thanh toán tương ứng 1-1 với mỗi đơn đặt vé.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `booking_id` | BIGINT | FK → `bookings.id`, UNIQUE, NOT NULL | Đơn đặt vé (1 booking = 1 payment) |
| `method` | ENUM | NOT NULL | Phương thức: `VNPAY` / `MOMO` / `BANK_TRANSFER` |
| `amount` | DECIMAL(10,2) | NOT NULL | Số tiền thanh toán |
| `status` | ENUM | NOT NULL, DEFAULT 'PENDING' | `PENDING` / `SUCCESS` / `FAILED` / `REFUNDED` |
| `transaction_id` | VARCHAR(100) | NULL | Mã giao dịch từ cổng thanh toán (mock) |
| `paid_at` | DATETIME | NULL | Thời điểm thanh toán thành công |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm khởi tạo giao dịch |

```sql
CREATE TABLE payments (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    booking_id     BIGINT        NOT NULL,
    method         ENUM('VNPAY','MOMO','BANK_TRANSFER') NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    status         ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    paid_at        DATETIME,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_booking (booking_id),
    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

---

### 2.12 Bảng `promotions`

> Mã khuyến mãi và điều kiện áp dụng khi thanh toán.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT, NOT NULL | Khóa chính |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Mã khuyến mãi (SUMMER20, FLASH50...) |
| `description` | VARCHAR(255) | NULL | Mô tả ngắn chương trình khuyến mãi |
| `discount_type` | ENUM | NOT NULL | Loại giảm: `PERCENTAGE` (%) / `FIXED` (số tiền cố định) |
| `discount_value` | DECIMAL(10,2) | NOT NULL | Giá trị giảm (20 = 20% hoặc 50000 = 50.000đ) |
| `min_order_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Giá trị đơn hàng tối thiểu để áp dụng |
| `max_discount_amount` | DECIMAL(10,2) | NULL | Mức giảm tối đa (áp dụng khi PERCENTAGE) |
| `usage_limit` | INT | NULL | Giới hạn tổng số lần sử dụng (NULL = không giới hạn) |
| `used_count` | INT | NOT NULL, DEFAULT 0 | Số lần đã được sử dụng |
| `start_date` | DATE | NOT NULL | Ngày bắt đầu hiệu lực |
| `end_date` | DATE | NOT NULL | Ngày hết hiệu lực |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Mã còn kích hoạt không |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW() | Thời điểm tạo khuyến mãi |

```sql
CREATE TABLE promotions (
    id                  INT           NOT NULL AUTO_INCREMENT,
    code                VARCHAR(50)   NOT NULL,
    description         VARCHAR(255),
    discount_type       ENUM('PERCENTAGE','FIXED') NOT NULL,
    discount_value      DECIMAL(10,2) NOT NULL,
    min_order_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2),
    usage_limit         INT,
    used_count          INT           NOT NULL DEFAULT 0,
    start_date          DATE          NOT NULL,
    end_date            DATE          NOT NULL,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_promotions_code (code)
);
```

---

## 3. SƠ ĐỒ QUAN HỆ (ERD — Dạng Text)

### 3.1 Sơ Đồ Tổng Quan

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────┐
│   cinemas   │ 1──────N│     rooms       │ 1──────N │    seats     │
│─────────────│         │─────────────────│         │──────────────│
│ id (PK)     │         │ id (PK)         │         │ id (PK)      │
│ name        │         │ cinema_id (FK)  │         │ room_id (FK) │
│ address     │         │ name            │         │ row_label    │
│ phone       │         │ type            │         │ seat_number  │
│ is_active   │         │ total_seats     │         │ seat_code    │
└─────────────┘         └────────┬────────┘         │ type         │
                                 │                   └──────┬───────┘
                                 │ 1                        │ N
                                 │                          │
                        ┌────────▼────────┐       ┌────────▼────────┐
                        │   showtimes     │       │  booking_seats  │
                        │─────────────────│       │─────────────────│
                        │ id (PK)         │       │ id (PK)         │
                        │ movie_id (FK)   │       │ booking_id (FK) │
                        │ room_id (FK)    │       │ seat_id (FK)    │
                        │ start_time      │       │ price           │
                        │ end_time        │       └────────┬────────┘
                        │ price_standard  │                │ N
                        │ price_vip       │                │
                        │ price_couple    │       ┌────────▼────────┐
                        │ status          │       │    bookings     │
                        └────────┬────────┘       │─────────────────│
                                 │ 1              │ id (PK)         │
                                 │                │ booking_code    │
┌─────────────┐         ┌────────▼────────┐       │ user_id (FK)    │
│   movies    │ 1──────N│   showtimes     │ 1──N  │ showtime_id (FK)│
│─────────────│         │ (liên kết)      │       │ promotion_id    │
│ id (PK)     │                           ◄───────│ total_amount    │
│ title       │                                   │ final_amount    │
│ duration    │                                   │ status          │
│ status      │                                   └────────┬────────┘
└──────┬──────┘                                            │ 1
       │ N                                                 │
       │                                         ┌────────▼────────┐
┌──────▼──────┐     ┌────────────┐               │    payments     │
│movie_genres │ N───│   genres   │               │─────────────────│
│─────────────│     │────────────│               │ id (PK)         │
│ movie_id    │     │ id (PK)    │               │ booking_id (FK) │
│ genre_id    │     │ name       │               │ method          │
└─────────────┘     └────────────┘               │ amount          │
                                                 │ status          │
┌─────────────┐                                  └─────────────────┘
│    users    │ 1──────N bookings
│─────────────│
│ id (PK)     │     ┌──────────────┐
│ email       │     │  promotions  │
│ role        │     │──────────────│
└─────────────┘     │ id (PK)      │
                    │ code         │
                    │ discount_type│
                    │ end_date     │
                    └──────────────┘
```

### 3.2 Bảng Mô Tả Quan Hệ

| Bảng A | Quan hệ | Bảng B | Mô tả |
|---|:---:|---|---|
| `cinemas` | 1 ── N | `rooms` | Một rạp có nhiều phòng chiếu |
| `rooms` | 1 ── N | `seats` | Một phòng có nhiều ghế ngồi |
| `rooms` | 1 ── N | `showtimes` | Một phòng có nhiều suất chiếu |
| `movies` | 1 ── N | `showtimes` | Một phim có nhiều suất chiếu |
| `movies` | N ── N | `genres` | Một phim thuộc nhiều thể loại (qua `movie_genres`) |
| `users` | 1 ── N | `bookings` | Một người dùng có nhiều đơn đặt vé |
| `showtimes` | 1 ── N | `bookings` | Một suất chiếu có nhiều đơn đặt vé |
| `bookings` | 1 ── N | `booking_seats` | Một đơn đặt vé chứa nhiều ghế |
| `seats` | 1 ── N | `booking_seats` | Một ghế xuất hiện trong nhiều đơn (qua nhiều suất) |
| `bookings` | 1 ── 1 | `payments` | Một đơn đặt vé có đúng một giao dịch thanh toán |
| `promotions` | 1 ── N | `bookings` | Một mã khuyến mãi được dùng trong nhiều đơn hàng |

---

## 4. INDEX GỢI Ý

### 4.1 Index Theo Bảng

```sql
-- ============================================================
-- BẢNG: users
-- ============================================================
-- email đã có UNIQUE INDEX (uq_users_email) — không cần thêm

-- ============================================================
-- BẢNG: movies
-- ============================================================
CREATE INDEX idx_movies_status       ON movies(status);
CREATE INDEX idx_movies_release_date ON movies(release_date);
-- Dùng cho: lọc phim đang chiếu, sắp chiếu; sắp xếp theo ngày ra mắt

-- ============================================================
-- BẢNG: showtimes
-- ============================================================
CREATE INDEX idx_st_movie_id    ON showtimes(movie_id);
CREATE INDEX idx_st_room_id     ON showtimes(room_id);
CREATE INDEX idx_st_start_time  ON showtimes(start_time);
CREATE INDEX idx_st_status      ON showtimes(status);
-- Composite: tra cứu lịch chiếu theo phim + ngày
CREATE INDEX idx_st_movie_date  ON showtimes(movie_id, start_time);
-- Composite: kiểm tra xung đột phòng chiếu theo giờ
CREATE INDEX idx_st_room_time   ON showtimes(room_id, start_time, end_time);

-- ============================================================
-- BẢNG: seats
-- ============================================================
CREATE INDEX idx_seats_room_id ON seats(room_id);
CREATE INDEX idx_seats_type    ON seats(room_id, type);
-- Dùng cho: lấy sơ đồ ghế của phòng, lọc ghế VIP / STANDARD

-- ============================================================
-- BẢNG: bookings
-- ============================================================
CREATE INDEX idx_bk_user_id     ON bookings(user_id);
CREATE INDEX idx_bk_showtime_id ON bookings(showtime_id);
CREATE INDEX idx_bk_status      ON bookings(status);
CREATE INDEX idx_bk_created_at  ON bookings(created_at);
-- booking_code đã có UNIQUE INDEX — không cần thêm
-- Composite: xem lịch sử đặt vé của user theo thời gian
CREATE INDEX idx_bk_user_date   ON bookings(user_id, created_at);

-- ============================================================
-- BẢNG: booking_seats
-- ============================================================
CREATE INDEX idx_bs_booking_id ON booking_seats(booking_id);
CREATE INDEX idx_bs_seat_id    ON booking_seats(seat_id);
-- Composite: kiểm tra ghế đã đặt trong suất chiếu (qua JOIN với bookings)
CREATE INDEX idx_bs_seat_booking ON booking_seats(seat_id, booking_id);

-- ============================================================
-- BẢNG: payments
-- ============================================================
CREATE INDEX idx_pay_status ON payments(status);
-- booking_id đã có UNIQUE INDEX — không cần thêm

-- ============================================================
-- BẢNG: promotions
-- ============================================================
CREATE INDEX idx_promo_active_date ON promotions(is_active, start_date, end_date);
-- Dùng cho: kiểm tra mã còn hiệu lực khi áp dụng
-- code đã có UNIQUE INDEX — không cần thêm

-- ============================================================
-- BẢNG: movie_genres
-- ============================================================
CREATE INDEX idx_mg_genre_id ON movie_genres(genre_id);
-- Dùng cho: lấy danh sách phim theo thể loại
```

### 4.2 Bảng Tổng Hợp Index

| Bảng | Index | Cột | Mục đích |
|---|---|---|---|
| `movies` | `idx_movies_status` | `status` | Lọc phim NOW_SHOWING / COMING_SOON |
| `movies` | `idx_movies_release_date` | `release_date` | Sắp xếp theo ngày ra mắt |
| `showtimes` | `idx_st_movie_date` | `movie_id, start_time` | Lịch chiếu theo phim + ngày |
| `showtimes` | `idx_st_room_time` | `room_id, start_time, end_time` | Kiểm tra xung đột suất chiếu |
| `showtimes` | `idx_st_status` | `status` | Lọc suất đang/sắp chiếu |
| `seats` | `idx_seats_type` | `room_id, type` | Lọc ghế theo loại trong phòng |
| `bookings` | `idx_bk_user_date` | `user_id, created_at` | Lịch sử đặt vé của người dùng |
| `bookings` | `idx_bk_showtime_id` | `showtime_id` | Danh sách booking theo suất chiếu |
| `booking_seats` | `idx_bs_seat_booking` | `seat_id, booking_id` | Kiểm tra ghế đã đặt |
| `promotions` | `idx_promo_active_date` | `is_active, start_date, end_date` | Validate mã khuyến mãi còn hiệu lực |
| `movie_genres` | `idx_mg_genre_id` | `genre_id` | Lấy phim theo thể loại |

---

*Tài liệu thiết kế database — Hệ thống Movie Ticket Booking — Phiên bản 1.0 ngày 26/03/2026*
