# Movie Ticket Booking System — Claude Code Context

## Tổng Quan Dự Án

Hệ thống đặt vé xem phim trực tuyến (web application).

- **Backend:** Java 21 + Spring Boot 3.x — REST API
- **Frontend:** ReactJS 18.x + Vite — SPA
- **Database:** MySQL 8.x
- **Auth:** JWT Bearer Token + Spring Security + BCrypt

## Cấu Trúc Thư Mục

```
movie-ticket/
├── CLAUDE.md                  ← File này (context cho Claude Code)
├── README.md
├── backend/                   ← Spring Boot project
│   ├── pom.xml
│   └── src/main/java/com/movieticket/
│       ├── MovieTicketApplication.java
│       ├── config/            ← Spring config (CORS, Security, JWT)
│       ├── controller/        ← REST controllers
│       ├── dto/
│       │   ├── request/       ← Request body DTOs
│       │   └── response/      ← Response DTOs
│       ├── entity/            ← JPA entities (map với database)
│       ├── repository/        ← Spring Data JPA repositories
│       ├── service/           ← Business logic interfaces
│       │   └── impl/          ← Service implementations
│       ├── security/
│       │   └── jwt/           ← JWT filter, util, user details
│       └── exception/         ← Global exception handler
└── frontend/                  ← ReactJS + Vite project
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/               ← Axios instances + API calls
        ├── components/
        │   ├── common/        ← Button, Input, Modal, Spinner...
        │   └── layout/        ← Navbar, Sidebar, Footer
        ├── pages/
        │   ├── auth/          ← Login, Register
        │   ├── movies/        ← MovieList, MovieDetail
        │   ├── booking/       ← SeatMap, BookingConfirm, History
        │   └── admin/         ← Dashboard, ManageMovies, Reports
        ├── store/
        │   └── slices/        ← Redux Toolkit slices
        ├── hooks/             ← Custom React hooks
        └── utils/             ← Helpers, formatters, constants
```

## Database Schema (Tóm tắt 12 bảng)

```
users          → id, email, password(BCrypt), full_name, phone, role(ENUM), is_active
movies         → id, title, description, director, cast_members, duration, release_date,
                  poster_url, trailer_url, age_rating(ENUM), status(ENUM)
genres         → id, name
movie_genres   → movie_id(FK), genre_id(FK)  [N-N]
cinemas        → id, name, address, phone, is_active
rooms          → id, cinema_id(FK), name, type(ENUM: 2D/3D/IMAX), total_seats, is_active
seats          → id, room_id(FK), row_label, seat_number, seat_code(A1/B2...), type(ENUM), is_active
showtimes      → id, movie_id(FK), room_id(FK), start_time, end_time, price_standard,
                  price_vip, price_couple, status(ENUM)
bookings       → id, booking_code(UNIQUE), user_id(FK), showtime_id(FK), promotion_id(FK),
                  total_amount, discount_amount, final_amount, status(ENUM), qr_code
booking_seats  → id, booking_id(FK), seat_id(FK), price
payments       → id, booking_id(FK,UNIQUE), method(ENUM), amount, status(ENUM), transaction_id, paid_at
promotions     → id, code(UNIQUE), discount_type(ENUM), discount_value, min_order_amount,
                  max_discount_amount, usage_limit, used_count, start_date, end_date, is_active
```

Chi tiết xem file `../04-thiet-ke-database.md`

## API Endpoints (Tóm tắt)

| Nhóm | Base URL | Phân quyền |
|---|---|---|
| Auth | `/api/auth/*` | Public |
| Movies | `/api/movies/*` | Public (đọc) / Admin (ghi) |
| Genres | `/api/genres` | Public |
| Cinemas & Rooms | `/api/cinemas/*`, `/api/rooms/*` | Public (đọc) / Admin (ghi) |
| Seats | `/api/seats/*`, `/api/rooms/{id}/seats` | Public (đọc) / Admin (ghi) |
| Showtimes | `/api/showtimes/*` | Public (đọc) / Admin (ghi) |
| Bookings | `/api/bookings/*` | Customer+ |
| Payments | `/api/payments/*` | Customer+ |
| Users | `/api/users/*` | Customer+ |
| Admin | `/api/admin/*` | Admin only |

Chi tiết xem file `../05-danh-sach-api.md`

## Actors & Roles

| Role | Mô tả |
|---|---|
| `CUSTOMER` | Khách hàng đã đăng ký — đặt vé, xem lịch sử |
| `STAFF` | Nhân viên rạp — xác nhận vé, hỗ trợ đặt tại quầy |
| `ADMIN` | Quản trị viên — toàn quyền hệ thống |

## Quy Tắc Coding

### Backend (Java / Spring Boot)

- **Package:** `com.movieticket`
- **Naming:** camelCase cho method/variable, PascalCase cho class, UPPER_SNAKE cho constant
- **DTO pattern:** Dùng DTO cho request/response — KHÔNG trả về entity trực tiếp
- **Response wrapper:** Dùng `ApiResponse<T>` cho tất cả response (có `success`, `message`, `data`)
- **Validation:** Dùng `@Valid` + Bean Validation annotations (`@NotNull`, `@Email`, `@Size`...)
- **Exception:** Global handler qua `@RestControllerAdvice` trong `exception/GlobalExceptionHandler.java`
- **Security:** Tất cả endpoint cần auth phải được config trong `SecurityConfig.java`
- **JWT:** Token lưu trong header `Authorization: Bearer <token>`

### Frontend (React / Vite)

- **Naming:** PascalCase cho component, camelCase cho function/variable
- **State management:** Redux Toolkit cho global state, `useState` cho local state
- **API calls:** Tập trung trong `src/api/` — dùng Axios instance đã cấu hình baseURL và interceptor
- **Routing:** React Router DOM v6 — định nghĩa routes trong `App.jsx`
- **Styling:** Tailwind CSS utility classes — KHÔNG viết CSS inline
- **Auth guard:** HOC `PrivateRoute` bọc các trang cần đăng nhập

## Lệnh Thường Dùng

### Backend

```bash
# Chạy backend (từ thư mục backend/)
./mvnw spring-boot:run

# Build JAR
./mvnw clean package -DskipTests

# Chạy tests
./mvnw test
```

### Frontend

```bash
# Cài dependencies (từ thư mục frontend/)
npm install

# Dev server (port 5173)
npm run dev

# Build production
npm run build
```

### Database

```sql
-- Tạo database
CREATE DATABASE movie_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'movieticket'@'localhost' IDENTIFIED BY 'movieticket123';
GRANT ALL PRIVILEGES ON movie_ticket.* TO 'movieticket'@'localhost';
```

## Biến Môi Trường

### Backend — `backend/src/main/resources/application-dev.yml`

```yaml
spring.datasource.url: jdbc:mysql://localhost:3306/movie_ticket
spring.datasource.username: movieticket
spring.datasource.password: movieticket123
jwt.secret: <your-256-bit-secret>
jwt.expiration: 86400000
```

### Frontend — `frontend/.env`

```
VITE_API_BASE_URL=http://localhost:8080
```

## Luồng Nghiệp Vụ Quan Trọng

### Đặt vé

```
POST /api/bookings
  → kiểm tra ghế còn trống (status AVAILABLE trong showtime)
  → giữ ghế 10 phút (HELD)
  → tạo booking (PENDING)
  → trả về bookingId

POST /api/payments/initiate
  → mock thanh toán

POST /api/payments/callback
  → nếu SUCCESS: booking → CONFIRMED, ghế → BOOKED, tạo QR code
  → nếu FAILED/timeout: booking → EXPIRED, ghế → AVAILABLE lại
```

### Hủy vé

```
PUT /api/bookings/{id}/cancel
  → kiểm tra start_time - now() >= 2 giờ
  → booking → CANCELLED
  → ghế → AVAILABLE
  → payment → REFUNDED (mock)
```

## Tài Liệu BA (trong thư mục cha)

- `../yeu-cau-du-an.txt` — Tài liệu yêu cầu gốc
- `../01-mo-ta-he-thong.md` — Tổng quan, actors, môi trường
- `../04-thiet-ke-database.md` — Schema 12 bảng, ERD, index
- `../05-danh-sach-api.md` — 52 REST endpoints đầy đủ
