# 05 - DANH SÁCH REST API
## Hệ Thống Đặt Vé Xem Phim Trực Tuyến

> **Backend:** Java Spring Boot 3.x | **Auth:** JWT Bearer Token | **Format:** JSON | **Phiên bản:** 1.0 | **Ngày:** 26/03/2026

----

## QUY ƯỚC CHUNG

### Phân Quyền Truy Cập

| Ký hiệu | Ý nghĩa |
|---|---|
| 🌐 **Public** | Không cần đăng nhập |
| 👤 **Customer** | Cần JWT token — role: CUSTOMER trở lên |
| 🔧 **Staff** | Cần JWT token — role: STAFF trở lên |
| 🔑 **Admin** | Cần JWT token — role: ADMIN |

### HTTP Header Xác Thực

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Cấu Trúc Response Chuẩn

```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... },
  "timestamp": "2026-03-26T10:00:00"
}
```

### Cấu Trúc Response Lỗi

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": ["Chi tiết lỗi 1", "Chi tiết lỗi 2"],
  "timestamp": "2026-03-26T10:00:00"
}
```

### HTTP Status Code Sử Dụng

| Code | Ý nghĩa |
|---|---|
| `200` | OK — Thành công |
| `201` | Created — Tạo mới thành công |
| `400` | Bad Request — Dữ liệu đầu vào không hợp lệ |
| `401` | Unauthorized — Chưa đăng nhập |
| `403` | Forbidden — Không đủ quyền |
| `404` | Not Found — Không tìm thấy |
| `409` | Conflict — Xung đột dữ liệu (trùng lịch, trùng ghế) |
| `500` | Internal Server Error |

---

## TỔNG HỢP ENDPOINTS

| # | Method | Endpoint | Quyền | Chức năng |
|:---:|:---:|---|:---:|---|
| 1 | POST | `/api/auth/register` | 🌐 | Đăng ký tài khoản |
| 2 | POST | `/api/auth/login` | 🌐 | Đăng nhập |
| 3 | POST | `/api/auth/logout` | 👤 | Đăng xuất |
| 4 | POST | `/api/auth/change-password` | 👤 | Đổi mật khẩu |
| 5 | GET | `/api/movies` | 🌐 | Danh sách phim (có lọc) |
| 6 | GET | `/api/movies/now-showing` | 🌐 | Phim đang chiếu |
| 7 | GET | `/api/movies/coming-soon` | 🌐 | Phim sắp chiếu |
| 8 | GET | `/api/movies/{id}` | 🌐 | Chi tiết phim |
| 9 | GET | `/api/movies/{id}/showtimes` | 🌐 | Lịch chiếu của phim |
| 10 | POST | `/api/movies` | 🔑 | Thêm phim mới |
| 11 | PUT | `/api/movies/{id}` | 🔑 | Cập nhật phim |
| 12 | DELETE | `/api/movies/{id}` | 🔑 | Ẩn / xóa phim |
| 13 | GET | `/api/genres` | 🌐 | Danh sách thể loại |
| 14 | GET | `/api/cinemas` | 🌐 | Danh sách rạp phim |
| 15 | GET | `/api/cinemas/{id}` | 🌐 | Chi tiết rạp phim |
| 16 | GET | `/api/cinemas/{id}/rooms` | 🌐 | Phòng chiếu của rạp |
| 17 | POST | `/api/cinemas` | 🔑 | Thêm rạp mới |
| 18 | PUT | `/api/cinemas/{id}` | 🔑 | Cập nhật rạp |
| 19 | GET | `/api/rooms/{id}` | 🌐 | Chi tiết phòng chiếu |
| 20 | POST | `/api/rooms` | 🔑 | Thêm phòng chiếu |
| 21 | PUT | `/api/rooms/{id}` | 🔑 | Cập nhật phòng chiếu |
| 22 | GET | `/api/rooms/{roomId}/seats` | 🌐 | Sơ đồ ghế của phòng |
| 23 | GET | `/api/showtimes/{showtimeId}/seats` | 🌐 | Trạng thái ghế theo suất chiếu |
| 24 | POST | `/api/seats/batch` | 🔑 | Tạo hàng loạt ghế |
| 25 | PUT | `/api/seats/{id}` | 🔑 | Cập nhật ghế |
| 26 | GET | `/api/showtimes` | 🌐 | Danh sách suất chiếu (có lọc) |
| 27 | GET | `/api/showtimes/{id}` | 🌐 | Chi tiết suất chiếu |
| 28 | POST | `/api/showtimes` | 🔑 | Tạo suất chiếu |
| 29 | PUT | `/api/showtimes/{id}` | 🔑 | Cập nhật suất chiếu |
| 30 | DELETE | `/api/showtimes/{id}` | 🔑 | Xóa suất chiếu |
| 31 | POST | `/api/bookings` | 👤 | Tạo đơn đặt vé |
| 32 | GET | `/api/bookings/my` | 👤 | Lịch sử đặt vé của tôi |
| 33 | GET | `/api/bookings/{id}` | 👤 | Chi tiết đơn đặt vé |
| 34 | PUT | `/api/bookings/{id}/cancel` | 👤 | Hủy vé |
| 35 | GET | `/api/bookings/verify/{code}` | 🔧 | Xác nhận vé tại quầy |
| 36 | GET | `/api/bookings?showtimeId=` | 🔧 | Danh sách booking theo suất |
| 37 | POST | `/api/payments/initiate` | 👤 | Khởi tạo thanh toán |
| 38 | POST | `/api/payments/callback` | 🌐 | Callback từ cổng thanh toán |
| 39 | GET | `/api/payments/{bookingId}` | 👤 | Thông tin thanh toán |
| 40 | POST | `/api/promotions/validate` | 👤 | Kiểm tra mã khuyến mãi |
| 41 | GET | `/api/users/me` | 👤 | Xem thông tin cá nhân |
| 42 | PUT | `/api/users/me` | 👤 | Cập nhật thông tin cá nhân |
| 43 | GET | `/api/admin/users` | 🔑 | Danh sách người dùng |
| 44 | PUT | `/api/admin/users/{id}/role` | 🔑 | Phân quyền người dùng |
| 45 | PUT | `/api/admin/users/{id}/status` | 🔑 | Khóa / mở tài khoản |
| 46 | GET | `/api/admin/promotions` | 🔑 | Danh sách mã khuyến mãi |
| 47 | POST | `/api/admin/promotions` | 🔑 | Tạo mã khuyến mãi |
| 48 | PUT | `/api/admin/promotions/{id}` | 🔑 | Cập nhật mã khuyến mãi |
| 49 | DELETE | `/api/admin/promotions/{id}` | 🔑 | Xóa mã khuyến mãi |
| 50 | GET | `/api/admin/reports/revenue` | 🔑 | Báo cáo doanh thu |
| 51 | GET | `/api/admin/reports/top-movies` | 🔑 | Phim doanh thu cao nhất |
| 52 | GET | `/api/admin/reports/occupancy` | 🔑 | Tỷ lệ lấp đầy suất chiếu |

---

## 1. AUTH API — `/api/auth/*`

---

#### `POST /api/auth/register` — 🌐 Public

**Mô tả:** Đăng ký tài khoản khách hàng mới.

**Request Body:**
```json
{
  "email": "khachhang@gmail.com",
  "password": "Abc@12345",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": 1,
    "email": "khachhang@gmail.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Email đã được sử dụng",
  "errors": ["khachhang@gmail.com đã tồn tại trong hệ thống"]
}
```

---

#### `POST /api/auth/login` — 🌐 Public

**Mô tả:** Đăng nhập và nhận JWT token để xác thực các request tiếp theo.

**Request Body:**
```json
{
  "email": "khachhang@gmail.com",
  "password": "Abc@12345"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "email": "khachhang@gmail.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER"
    }
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

#### `POST /api/auth/logout` — 👤 Customer

**Mô tả:** Đăng xuất — vô hiệu hóa JWT token hiện tại (server-side blacklist).

**Request Body:** _(không có)_

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

#### `POST /api/auth/change-password` — 👤 Customer

**Mô tả:** Đổi mật khẩu tài khoản hiện tại.

**Request Body:**
```json
{
  "currentPassword": "Abc@12345",
  "newPassword": "NewPass@678",
  "confirmPassword": "NewPass@678"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

**Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Mật khẩu hiện tại không đúng"
}
```

---

## 2. MOVIE API — `/api/movies/*`

---

#### `GET /api/movies` — 🌐 Public

**Mô tả:** Lấy danh sách phim có hỗ trợ lọc và phân trang.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `NOW_SHOWING` / `COMING_SOON` / `STOPPED` |
| `genreId` | integer | Lọc theo thể loại |
| `keyword` | string | Tìm kiếm theo tên phim |
| `page` | integer | Trang hiện tại (mặc định: 0) |
| `size` | integer | Số phần tử mỗi trang (mặc định: 10) |

**Ví dụ:** `GET /api/movies?status=NOW_SHOWING&genreId=1&page=0&size=10`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Avengers: Doomsday",
        "duration": 150,
        "releaseDate": "2026-03-20",
        "posterUrl": "https://example.com/posters/avengers.jpg",
        "ageRating": "C13",
        "status": "NOW_SHOWING",
        "genres": ["Hành động", "Khoa học viễn tưởng"]
      }
    ],
    "totalElements": 25,
    "totalPages": 3,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

---

#### `GET /api/movies/now-showing` — 🌐 Public

**Mô tả:** Lấy danh sách phim đang chiếu (shortcut, không cần truyền `status`).

**Response `200 OK`:** _(cấu trúc tương tự `/api/movies`)_

---

#### `GET /api/movies/coming-soon` — 🌐 Public

**Mô tả:** Lấy danh sách phim sắp chiếu.

**Response `200 OK`:** _(cấu trúc tương tự `/api/movies`)_

---

#### `GET /api/movies/{id}` — 🌐 Public

**Mô tả:** Lấy toàn bộ thông tin chi tiết của một bộ phim.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Avengers: Doomsday",
    "description": "Các siêu anh hùng tập hợp để đối đầu với mối đe dọa mới nhất...",
    "director": "Joe Russo",
    "castMembers": "Robert Downey Jr., Chris Evans, Scarlett Johansson",
    "duration": 150,
    "releaseDate": "2026-03-20",
    "posterUrl": "https://example.com/posters/avengers.jpg",
    "trailerUrl": "https://youtube.com/watch?v=abc123",
    "ageRating": "C13",
    "status": "NOW_SHOWING",
    "genres": [
      { "id": 1, "name": "Hành động" },
      { "id": 5, "name": "Khoa học viễn tưởng" }
    ]
  }
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Không tìm thấy phim với id: 999"
}
```

---

#### `GET /api/movies/{id}/showtimes` — 🌐 Public

**Mô tả:** Lấy danh sách suất chiếu của một phim, có thể lọc theo ngày.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `date` | string | Lọc theo ngày chiếu (`yyyy-MM-dd`) |
| `cinemaId` | integer | Lọc theo rạp |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "startTime": "2026-03-27T14:00:00",
      "endTime": "2026-03-27T16:30:00",
      "priceStandard": 90000,
      "priceVip": 120000,
      "priceCouple": 200000,
      "status": "SCHEDULED",
      "room": {
        "id": 2,
        "name": "Phòng 2",
        "type": "3D"
      },
      "cinema": {
        "id": 1,
        "name": "CGV Vincom Center",
        "address": "72 Lê Thánh Tôn, Q.1, TP.HCM"
      }
    }
  ]
}
```

---

#### `POST /api/movies` — 🔑 Admin

**Mô tả:** Thêm phim mới vào hệ thống.

**Request Body:**
```json
{
  "title": "Avengers: Doomsday",
  "description": "Các siêu anh hùng tập hợp...",
  "director": "Joe Russo",
  "castMembers": "Robert Downey Jr., Chris Evans",
  "duration": 150,
  "releaseDate": "2026-03-20",
  "posterUrl": "https://example.com/posters/avengers.jpg",
  "trailerUrl": "https://youtube.com/watch?v=abc123",
  "ageRating": "C13",
  "status": "COMING_SOON",
  "genreIds": [1, 5]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm phim thành công",
  "data": {
    "id": 1,
    "title": "Avengers: Doomsday",
    "status": "COMING_SOON"
  }
}
```

---

#### `PUT /api/movies/{id}` — 🔑 Admin

**Mô tả:** Cập nhật thông tin phim (các field muốn thay đổi).

**Request Body:** _(các field cần cập nhật)_
```json
{
  "status": "NOW_SHOWING",
  "description": "Nội dung mô tả cập nhật mới nhất...",
  "genreIds": [1, 5, 7]
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật phim thành công",
  "data": { "id": 1, "title": "Avengers: Doomsday", "status": "NOW_SHOWING" }
}
```

---

#### `DELETE /api/movies/{id}` — 🔑 Admin

**Mô tả:** Ẩn phim khỏi danh sách (set `status = STOPPED`, không xóa vật lý).

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đã ẩn phim thành công"
}
```

---

#### `GET /api/genres` — 🌐 Public

**Mô tả:** Lấy danh sách tất cả thể loại phim.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Hành động", "description": "Phim hành động, võ thuật" },
    { "id": 2, "name": "Hài",       "description": "Phim hài hước" },
    { "id": 3, "name": "Tình cảm",  "description": "Phim tình cảm lãng mạn" },
    { "id": 4, "name": "Kinh dị",   "description": "Phim kinh dị, hồi hộp" },
    { "id": 5, "name": "Hoạt hình", "description": "Phim hoạt hình" }
  ]
}
```

---

## 3. CINEMA & ROOM API — `/api/cinemas/*`, `/api/rooms/*`

---

#### `GET /api/cinemas` — 🌐 Public

**Mô tả:** Lấy danh sách tất cả rạp phim đang hoạt động.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "CGV Vincom Center",
      "address": "72 Lê Thánh Tôn, Phường Bến Nghé, Q.1, TP.HCM",
      "phone": "028-3636-3636",
      "isActive": true
    }
  ]
}
```

---

#### `GET /api/cinemas/{id}` — 🌐 Public

**Mô tả:** Chi tiết thông tin một rạp phim.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "CGV Vincom Center",
    "address": "72 Lê Thánh Tôn, Phường Bến Nghé, Q.1, TP.HCM",
    "phone": "028-3636-3636",
    "isActive": true,
    "totalRooms": 8
  }
}
```

---

#### `GET /api/cinemas/{id}/rooms` — 🌐 Public

**Mô tả:** Danh sách phòng chiếu của một rạp.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Phòng 1", "type": "2D", "totalSeats": 120, "isActive": true },
    { "id": 2, "name": "Phòng 2", "type": "3D", "totalSeats": 100, "isActive": true },
    { "id": 3, "name": "Phòng IMAX", "type": "IMAX", "totalSeats": 200, "isActive": true }
  ]
}
```

---

#### `POST /api/cinemas` — 🔑 Admin

**Mô tả:** Thêm rạp phim mới.

**Request Body:**
```json
{
  "name": "CGV Vincom Center",
  "address": "72 Lê Thánh Tôn, Phường Bến Nghé, Q.1, TP.HCM",
  "phone": "028-3636-3636"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm rạp phim thành công",
  "data": { "id": 1, "name": "CGV Vincom Center" }
}
```

---

#### `PUT /api/cinemas/{id}` — 🔑 Admin

**Mô tả:** Cập nhật thông tin rạp phim.

**Request Body:**
```json
{
  "phone": "028-9999-8888",
  "isActive": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật rạp phim thành công"
}
```

---

#### `GET /api/rooms/{id}` — 🌐 Public

**Mô tả:** Chi tiết thông tin một phòng chiếu.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Phòng 2",
    "type": "3D",
    "totalSeats": 100,
    "isActive": true,
    "cinema": { "id": 1, "name": "CGV Vincom Center" }
  }
}
```

---

#### `POST /api/rooms` — 🔑 Admin

**Mô tả:** Thêm phòng chiếu mới vào một rạp.

**Request Body:**
```json
{
  "cinemaId": 1,
  "name": "Phòng IMAX",
  "type": "IMAX",
  "totalSeats": 200
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm phòng chiếu thành công",
  "data": { "id": 3, "name": "Phòng IMAX", "type": "IMAX" }
}
```

---

#### `PUT /api/rooms/{id}` — 🔑 Admin

**Mô tả:** Cập nhật thông tin phòng chiếu.

**Request Body:**
```json
{
  "name": "Phòng 2 - PREMIUM",
  "isActive": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật phòng chiếu thành công"
}
```

---

## 4. SEAT API — `/api/seats/*`

---

#### `GET /api/rooms/{roomId}/seats` — 🌐 Public

**Mô tả:** Lấy toàn bộ sơ đồ ghế của một phòng chiếu (không kèm trạng thái đặt chỗ).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "roomId": 2,
    "roomName": "Phòng 2",
    "rows": [
      {
        "rowLabel": "A",
        "seats": [
          { "id": 1, "seatCode": "A1", "type": "STANDARD", "isActive": true },
          { "id": 2, "seatCode": "A2", "type": "STANDARD", "isActive": true },
          { "id": 3, "seatCode": "A3", "type": "VIP",      "isActive": true }
        ]
      },
      {
        "rowLabel": "B",
        "seats": [
          { "id": 11, "seatCode": "B1", "type": "VIP",    "isActive": true },
          { "id": 12, "seatCode": "B2", "type": "COUPLE", "isActive": true }
        ]
      }
    ]
  }
}
```

---

#### `GET /api/showtimes/{showtimeId}/seats` — 🌐 Public

**Mô tả:** Lấy sơ đồ ghế kèm **trạng thái realtime** cho một suất chiếu cụ thể. Dùng để hiển thị màu ghế trên giao diện đặt vé.

**Trạng thái ghế:**

| `seatStatus` | Màu UI | Ý nghĩa |
|---|:---:|---|
| `AVAILABLE` | 🟢 Xanh | Ghế trống, có thể chọn |
| `BOOKED` | 🔴 Đỏ | Đã đặt (confirmed) |
| `HELD` | 🟡 Vàng | Đang được giữ tạm (≤ 10 phút) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "showtimeId": 10,
    "roomId": 2,
    "roomName": "Phòng 2",
    "rows": [
      {
        "rowLabel": "A",
        "seats": [
          { "id": 1, "seatCode": "A1", "type": "STANDARD", "seatStatus": "AVAILABLE", "price": 90000 },
          { "id": 2, "seatCode": "A2", "type": "STANDARD", "seatStatus": "BOOKED",    "price": 90000 },
          { "id": 3, "seatCode": "A3", "type": "VIP",      "seatStatus": "HELD",      "price": 120000 }
        ]
      }
    ]
  }
}
```

---

#### `POST /api/seats/batch` — 🔑 Admin

**Mô tả:** Tạo hàng loạt ghế cho một phòng chiếu theo cấu hình hàng.

**Request Body:**
```json
{
  "roomId": 2,
  "rows": [
    { "rowLabel": "A", "seatCount": 10, "type": "STANDARD" },
    { "rowLabel": "B", "seatCount": 10, "type": "STANDARD" },
    { "rowLabel": "C", "seatCount": 8,  "type": "VIP" },
    { "rowLabel": "D", "seatCount": 4,  "type": "COUPLE" }
  ]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Đã tạo 32 ghế thành công cho phòng 2",
  "data": { "roomId": 2, "totalSeatsCreated": 32 }
}
```

---

#### `PUT /api/seats/{id}` — 🔑 Admin

**Mô tả:** Cập nhật loại ghế hoặc trạng thái hoạt động của một ghế.

**Request Body:**
```json
{
  "type": "VIP",
  "isActive": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật ghế thành công"
}
```

---

## 5. SHOWTIME API — `/api/showtimes/*`

---

#### `GET /api/showtimes` — 🌐 Public

**Mô tả:** Danh sách suất chiếu có hỗ trợ lọc theo phim, rạp, ngày.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `movieId` | long | Lọc theo phim |
| `cinemaId` | integer | Lọc theo rạp |
| `roomId` | integer | Lọc theo phòng |
| `date` | string | Lọc theo ngày (`yyyy-MM-dd`) |
| `status` | string | `SCHEDULED` / `ONGOING` / `FINISHED` |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "movie": { "id": 1, "title": "Avengers: Doomsday", "duration": 150 },
      "room": { "id": 2, "name": "Phòng 2", "type": "3D" },
      "cinema": { "id": 1, "name": "CGV Vincom Center" },
      "startTime": "2026-03-27T14:00:00",
      "endTime": "2026-03-27T16:30:00",
      "priceStandard": 90000,
      "priceVip": 120000,
      "priceCouple": 200000,
      "status": "SCHEDULED",
      "availableSeats": 85,
      "totalSeats": 100
    }
  ]
}
```

---

#### `GET /api/showtimes/{id}` — 🌐 Public

**Mô tả:** Chi tiết đầy đủ của một suất chiếu.

**Response `200 OK`:** _(cấu trúc tương tự một phần tử trong list trên)_

---

#### `POST /api/showtimes` — 🔑 Admin

**Mô tả:** Tạo suất chiếu mới. Hệ thống tự kiểm tra xung đột phòng chiếu theo giờ.

**Request Body:**
```json
{
  "movieId": 1,
  "roomId": 2,
  "startTime": "2026-03-27T14:00:00",
  "priceStandard": 90000,
  "priceVip": 120000,
  "priceCouple": 200000
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Tạo suất chiếu thành công",
  "data": {
    "id": 10,
    "startTime": "2026-03-27T14:00:00",
    "endTime": "2026-03-27T16:30:00"
  }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Phòng chiếu đã có suất chiếu khác trong khung giờ này",
  "errors": ["Phòng 2 đã có suất từ 13:00 đến 15:30 ngày 27/03/2026"]
}
```

---

#### `PUT /api/showtimes/{id}` — 🔑 Admin

**Mô tả:** Cập nhật thông tin suất chiếu (chỉ khi chưa có booking).

**Request Body:**
```json
{
  "startTime": "2026-03-27T15:00:00",
  "priceStandard": 95000,
  "status": "CANCELLED"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật suất chiếu thành công"
}
```

---

#### `DELETE /api/showtimes/{id}` — 🔑 Admin

**Mô tả:** Xóa suất chiếu (chỉ xóa được nếu chưa có booking xác nhận).

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa suất chiếu thành công"
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Không thể xóa suất chiếu đã có vé được đặt"
}
```

---

## 6. BOOKING API — `/api/bookings/*`

---

#### `POST /api/bookings` — 👤 Customer

**Mô tả:** Tạo đơn đặt vé mới. Hệ thống giữ ghế tạm thời 10 phút chờ thanh toán.

**Request Body:**
```json
{
  "showtimeId": 10,
  "seatIds": [1, 2, 5],
  "promotionCode": "SUMMER20"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Đặt vé thành công, vui lòng thanh toán trong 10 phút",
  "data": {
    "id": 100,
    "bookingCode": "BK20260326001",
    "showtimeId": 10,
    "movieTitle": "Avengers: Doomsday",
    "startTime": "2026-03-27T14:00:00",
    "cinemaName": "CGV Vincom Center",
    "roomName": "Phòng 2",
    "seats": [
      { "seatCode": "A1", "type": "STANDARD", "price": 90000 },
      { "seatCode": "A2", "type": "STANDARD", "price": 90000 },
      { "seatCode": "B1", "type": "VIP",      "price": 120000 }
    ],
    "totalAmount": 300000,
    "discountAmount": 60000,
    "finalAmount": 240000,
    "promotionApplied": "SUMMER20 (-20%)",
    "status": "PENDING",
    "expiredAt": "2026-03-26T10:10:00"
  }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Một số ghế đã được đặt hoặc đang được giữ",
  "errors": ["Ghế A2 không còn trống", "Ghế B1 đang được giữ bởi người dùng khác"]
}
```

---

#### `GET /api/bookings/my` — 👤 Customer

**Mô tả:** Lấy lịch sử đặt vé của người dùng hiện tại.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | Lọc: `PENDING` / `CONFIRMED` / `CANCELLED` |
| `page` | integer | Trang (mặc định: 0) |
| `size` | integer | Kích thước trang (mặc định: 10) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 100,
        "bookingCode": "BK20260326001",
        "movieTitle": "Avengers: Doomsday",
        "posterUrl": "https://example.com/posters/avengers.jpg",
        "startTime": "2026-03-27T14:00:00",
        "cinemaName": "CGV Vincom Center",
        "seatCodes": ["A1", "A2", "B1"],
        "finalAmount": 240000,
        "status": "CONFIRMED",
        "createdAt": "2026-03-26T10:00:00"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

#### `GET /api/bookings/{id}` — 👤 Customer

**Mô tả:** Chi tiết đầy đủ một đơn đặt vé (chỉ xem được đơn của chính mình; Staff/Admin xem được tất cả).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "bookingCode": "BK20260326001",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "user": { "id": 1, "fullName": "Nguyễn Văn A", "email": "khachhang@gmail.com" },
    "showtime": {
      "id": 10,
      "movieTitle": "Avengers: Doomsday",
      "startTime": "2026-03-27T14:00:00",
      "roomName": "Phòng 2",
      "cinemaName": "CGV Vincom Center"
    },
    "seats": [
      { "seatCode": "A1", "type": "STANDARD", "price": 90000 },
      { "seatCode": "A2", "type": "STANDARD", "price": 90000 },
      { "seatCode": "B1", "type": "VIP",      "price": 120000 }
    ],
    "totalAmount": 300000,
    "discountAmount": 60000,
    "finalAmount": 240000,
    "status": "CONFIRMED",
    "payment": {
      "method": "MOMO",
      "status": "SUCCESS",
      "paidAt": "2026-03-26T10:05:00"
    },
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

---

#### `PUT /api/bookings/{id}/cancel` — 👤 Customer

**Mô tả:** Hủy đơn đặt vé. Chỉ được hủy khi suất chiếu còn cách ít nhất **2 giờ**.

**Request Body:** _(không có)_

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Hủy vé thành công. Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc."
}
```

**Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Không thể hủy vé. Suất chiếu chỉ còn 1 giờ 30 phút nữa."
}
```

---

#### `GET /api/bookings/verify/{code}` — 🔧 Staff

**Mô tả:** Tra cứu và xác nhận vé tại quầy bằng mã vé hoặc dữ liệu quét QR.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "bookingCode": "BK20260326001",
    "isValid": true,
    "customerName": "Nguyễn Văn A",
    "movieTitle": "Avengers: Doomsday",
    "startTime": "2026-03-27T14:00:00",
    "roomName": "Phòng 2",
    "seatCodes": ["A1", "A2", "B1"],
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "SUCCESS"
  }
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Mã vé không hợp lệ hoặc không tồn tại"
}
```

---

#### `GET /api/bookings?showtimeId={id}` — 🔧 Staff

**Mô tả:** Danh sách tất cả khách hàng đã đặt vé cho một suất chiếu cụ thể.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "showtimeId": 10,
    "movieTitle": "Avengers: Doomsday",
    "startTime": "2026-03-27T14:00:00",
    "totalBooked": 15,
    "bookings": [
      {
        "bookingCode": "BK20260326001",
        "customerName": "Nguyễn Văn A",
        "seatCodes": ["A1", "A2", "B1"],
        "finalAmount": 240000,
        "status": "CONFIRMED"
      }
    ]
  }
}
```

---

## 7. PAYMENT API — `/api/payments/*`

---

#### `POST /api/payments/initiate` — 👤 Customer

**Mô tả:** Khởi tạo giao dịch thanh toán cho đơn đặt vé đang ở trạng thái PENDING.

**Request Body:**
```json
{
  "bookingId": 100,
  "method": "MOMO"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Khởi tạo thanh toán thành công",
  "data": {
    "paymentId": 50,
    "bookingId": 100,
    "amount": 240000,
    "method": "MOMO",
    "status": "PENDING",
    "paymentUrl": "https://payment.example.com/mock?token=xyz123",
    "expiredAt": "2026-03-26T10:10:00"
  }
}
```

---

#### `POST /api/payments/callback` — 🌐 Public _(Mock gateway callback)_

**Mô tả:** Nhận kết quả thanh toán từ cổng thanh toán (giả lập). Endpoint này được cổng thanh toán gọi sau khi xử lý.

**Request Body:**
```json
{
  "paymentId": 50,
  "bookingId": 100,
  "transactionId": "MOMO_TXN_20260326_001",
  "status": "SUCCESS",
  "amount": 240000,
  "signature": "abc123hash"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xác nhận thanh toán thành công",
  "data": {
    "bookingCode": "BK20260326001",
    "bookingStatus": "CONFIRMED",
    "qrCode": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

---

#### `GET /api/payments/{bookingId}` — 👤 Customer

**Mô tả:** Xem thông tin thanh toán của một đơn đặt vé.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "bookingId": 100,
    "bookingCode": "BK20260326001",
    "method": "MOMO",
    "amount": 240000,
    "status": "SUCCESS",
    "transactionId": "MOMO_TXN_20260326_001",
    "paidAt": "2026-03-26T10:05:00",
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

---

#### `POST /api/promotions/validate` — 👤 Customer

**Mô tả:** Kiểm tra mã khuyến mãi có hợp lệ và tính số tiền được giảm.

**Request Body:**
```json
{
  "code": "SUMMER20",
  "orderAmount": 300000
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "code": "SUMMER20",
    "isValid": true,
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "discountAmount": 60000,
    "finalAmount": 240000,
    "description": "Giảm 20% cho tất cả đơn hàng trong mùa hè"
  }
}
```

**Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Mã khuyến mãi không hợp lệ",
  "errors": ["Mã SUMMER20 đã hết hạn sử dụng"]
}
```

---

## 8. USER API — `/api/users/*`

---

#### `GET /api/users/me` — 👤 Customer

**Mô tả:** Lấy thông tin cá nhân của người dùng đang đăng nhập.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "khachhang@gmail.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2026-01-15T08:00:00"
  }
}
```

---

#### `PUT /api/users/me` — 👤 Customer

**Mô tả:** Cập nhật thông tin cá nhân (không thể thay đổi email hoặc role).

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "phone": "0987654321"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn An",
    "phone": "0987654321"
  }
}
```

---

## 9. ADMIN API — `/api/admin/*`

---

#### `GET /api/admin/users` — 🔑 Admin

**Mô tả:** Danh sách tất cả tài khoản người dùng trong hệ thống, có tìm kiếm và lọc.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `keyword` | string | Tìm theo email hoặc tên |
| `role` | string | `CUSTOMER` / `STAFF` / `ADMIN` |
| `isActive` | boolean | Lọc theo trạng thái tài khoản |
| `page` | integer | Trang (mặc định: 0) |
| `size` | integer | Kích thước trang (mặc định: 20) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "email": "khachhang@gmail.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0901234567",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-01-15T08:00:00"
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0
  }
}
```

---

#### `PUT /api/admin/users/{id}/role` — 🔑 Admin

**Mô tả:** Thay đổi vai trò (phân quyền) của một tài khoản.

**Request Body:**
```json
{
  "role": "STAFF"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật vai trò thành công",
  "data": { "id": 5, "email": "nhanvien@gmail.com", "role": "STAFF" }
}
```

---

#### `PUT /api/admin/users/{id}/status` — 🔑 Admin

**Mô tả:** Khóa hoặc mở khóa tài khoản người dùng.

**Request Body:**
```json
{
  "isActive": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đã khóa tài khoản thành công"
}
```

---

#### `GET /api/admin/promotions` — 🔑 Admin

**Mô tả:** Danh sách tất cả mã khuyến mãi.

**Query Parameters:** `isActive` (boolean), `page`, `size`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "SUMMER20",
        "description": "Giảm 20% mùa hè",
        "discountType": "PERCENTAGE",
        "discountValue": 20,
        "minOrderAmount": 100000,
        "maxDiscountAmount": 100000,
        "usageLimit": 500,
        "usedCount": 128,
        "startDate": "2026-06-01",
        "endDate": "2026-08-31",
        "isActive": true
      }
    ],
    "totalElements": 12
  }
}
```

---

#### `POST /api/admin/promotions` — 🔑 Admin

**Mô tả:** Tạo mã khuyến mãi mới.

**Request Body:**
```json
{
  "code": "SUMMER20",
  "description": "Giảm 20% cho tất cả đơn hàng trong mùa hè",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderAmount": 100000,
  "maxDiscountAmount": 100000,
  "usageLimit": 500,
  "startDate": "2026-06-01",
  "endDate": "2026-08-31"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Tạo mã khuyến mãi thành công",
  "data": { "id": 1, "code": "SUMMER20" }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Mã khuyến mãi SUMMER20 đã tồn tại trong hệ thống"
}
```

---

#### `PUT /api/admin/promotions/{id}` — 🔑 Admin

**Mô tả:** Cập nhật thông tin mã khuyến mãi.

**Request Body:**
```json
{
  "endDate": "2026-09-30",
  "usageLimit": 1000,
  "isActive": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật mã khuyến mãi thành công"
}
```

---

#### `DELETE /api/admin/promotions/{id}` — 🔑 Admin

**Mô tả:** Xóa mã khuyến mãi (chỉ xóa được mã chưa được sử dụng lần nào).

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa mã khuyến mãi thành công"
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Không thể xóa mã đã được sử dụng. Hãy vô hiệu hóa thay thế."
}
```

---

#### `GET /api/admin/reports/revenue` — 🔑 Admin

**Mô tả:** Báo cáo doanh thu theo ngày / tháng / năm.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `type` | string | `DAILY` / `MONTHLY` / `YEARLY` |
| `from` | string | Ngày bắt đầu (`yyyy-MM-dd`) |
| `to` | string | Ngày kết thúc (`yyyy-MM-dd`) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "type": "MONTHLY",
    "from": "2026-01-01",
    "to": "2026-03-31",
    "totalRevenue": 125000000,
    "totalBookings": 1250,
    "breakdown": [
      { "period": "2026-01", "revenue": 38000000, "bookings": 380 },
      { "period": "2026-02", "revenue": 42000000, "bookings": 420 },
      { "period": "2026-03", "revenue": 45000000, "bookings": 450 }
    ]
  }
}
```

---

#### `GET /api/admin/reports/top-movies` — 🔑 Admin

**Mô tả:** Danh sách phim có doanh thu cao nhất trong khoảng thời gian.

**Query Parameters:** `from` (date), `to` (date), `limit` (integer, mặc định: 10)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "movieId": 1,
      "movieTitle": "Avengers: Doomsday",
      "posterUrl": "https://example.com/posters/avengers.jpg",
      "totalRevenue": 35000000,
      "totalTicketsSold": 350,
      "totalShowtimes": 45
    },
    {
      "rank": 2,
      "movieId": 3,
      "movieTitle": "Kung Fu Panda 5",
      "posterUrl": "https://example.com/posters/kfp5.jpg",
      "totalRevenue": 28000000,
      "totalTicketsSold": 280,
      "totalShowtimes": 38
    }
  ]
}
```

---

#### `GET /api/admin/reports/occupancy` — 🔑 Admin

**Mô tả:** Báo cáo tỷ lệ lấp đầy ghế theo suất chiếu trong khoảng thời gian.

**Query Parameters:** `from` (date), `to` (date), `cinemaId` (integer, tuỳ chọn)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "averageOccupancyRate": 72.5,
    "totalShowtimes": 120,
    "topShowtimes": [
      {
        "showtimeId": 10,
        "movieTitle": "Avengers: Doomsday",
        "startTime": "2026-03-27T19:00:00",
        "roomName": "Phòng IMAX",
        "totalSeats": 200,
        "bookedSeats": 198,
        "occupancyRate": 99.0
      }
    ]
  }
}
```

---

*Tài liệu REST API — Hệ thống Movie Ticket Booking — Phiên bản 1.0 ngày 26/03/2026*
