# Mô Hình Dữ Liệu Chi Tiết (Data Model & Schema Reference)

> **Cập nhật lần cuối:** 11/11/2026  
> **Nguồn:** Đọc trực tiếp từ file `backend/prisma/schema.prisma` và các migration SQL thực tế, không dựa tài liệu cũ.

---

## 1. Danh Sách Các Enums Trong Hệ Thống

| Tên Enum | Giá trị | Ý nghĩa |
|---|---|---|
| `Role` | `USER`, `ADMIN` | Phân quyền tài khoản người dùng |
| `UserStatus` | `ACTIVE`, `SUSPENDED`, `PENDING` | Trạng thái tài khoản |
| `AuthProvider` | `LOCAL`, `GOOGLE`, `GITHUB` | Phương thức đăng nhập |
| `Currency` | `VND`, `USD`, `EUR`, `GBP`, `JPY`, `CNY`, `KRW`, `AUD`, `CAD`, `CHF`, `SEK`, `NOK`, `DKK`, `NZD`, `SGD`, `HKD`, `TWD` | 17 đơn vị tiền tệ hỗ trợ (mặc định VND) |
| `WalletType` | `CASH`, `BANK`, `E_WALLET`, `CREDIT`, `INVESTMENT` | Phân loại ví lưu trữ tiền |
| `TransactionType` | `INCOME`, `EXPENSE`, `TRANSFER` | Thu nhập, Chi tiêu hoặc Chuyển khoản ví |
| `TransactionStatus`| `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED` | Trạng thái xử lý giao dịch |
| `CategoryType` | `INCOME`, `EXPENSE` | Loại danh mục |
| `BudgetPeriod` | `MONTHLY`, `QUARTERLY`, `YEARLY`, `CUSTOM` | Chu kỳ ngân sách |
| `BudgetType` | `SPENDING`, `INCOME` | Ngân sách chi tiêu hoặc mục tiêu thu |
| `RecurringFrequency`| `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` | Tần suất lặp giao dịch định kỳ |
| `GoalStatus` | `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSED` | Trạng thái mục tiêu tiết kiệm |
| `GoalPriority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` | Mức độ ưu tiên của mục tiêu |
| `DebtType` | `LOAN` (mình vay), `DEBT` (người khác nợ mình) | Phân loại khoản vay/nợ |
| `DebtStatus` | `ACTIVE`, `PAID`, `OVERDUE`, `CANCELLED` | Tình trạng nợ |
| `PaymentMethod` | `CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `E_WALLET`, `OTHER` | Phương thức trả nợ |
| `AttachmentType`| `IMAGE`, `PDF`, `DOCUMENT` | Loại hóa đơn / tài liệu đính kèm |
| `NotificationType`| `BUDGET`, `GOAL`, `DEBT`, `RECURRING`, `SYSTEM` | Phân loại thông báo |
| `AuditAction` | `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `CHANGE_PASSWORD`, `RESET_PASSWORD`, `VERIFY_EMAIL` | Hành động được ghi log kiểm toán |

---

## 2. Chi Tiết Các Thực Thể (Models) & Quan Hệ

### 2.1. Nhóm Người Dùng & Phiên
- **`User`**: Bảng người dùng cốt lõi. Khóa chính `id` (UUID). Lưu thông tin đăng nhập, trạng thái, avatar, múi giờ (`timezone`), `tokenVersion` (dùng để thu hồi token hàng loạt), `verifyToken`, `resetToken`.
  - Quan hệ 1 - N: `UserSession`, `Wallet`, `Category`, `Transaction`, `Budget`, `RecurringTransaction`, `Goal`, `Debt`, `Notification`, `Tag`, `AuditLog`.
  - Quan hệ 1 - 1: `UserPreference`.
- **`UserPreference`**: Lưu cài đặt cá nhân: `language` (mặc định `'vi'`), `currency` (mặc định `VND`), `theme`, `weekStartsOn`, `dateFormat`, `timeFormat`, các cờ thông báo (`budgetNotification`, `goalNotification`, `debtNotification`, `recurringNotification`).
- **`UserSession`**: Quản lý phiên đăng nhập thiết bị. Cột `deviceId` (UUID, Unique), `userAgent`, `ipAddress`, `isRemember`, `lastLoginAt`, `lastActiveAt`.

---

### 2.2. Nhóm Tài Chính Cốt Lõi (Ví, Danh Mục, Giao Dịch, Thẻ)
- **`Wallet`**: Ví tiền. Hỗ trợ số dư chính xác cao `balance Decimal(18,2)`.
  - Quan hệ: thuộc về `User`. Có các quan hệ đối ứng với `Transaction`:
    - `transactions`: giao dịch phát sinh trên ví.
    - `fromTransactions`: giao dịch chuyển đi (TRANSFER).
    - `toTransactions`: giao dịch chuyển đến (TRANSFER).
    - `goalContributions`: tiền trích ra đóng góp mục tiêu.
- **`Category`**: Danh mục phân loại.
  - Hỗ trợ cấu trúc cây phân cấp tự trỏ (Self-relation `CategoryHierarchy`): `parentId` trỏ về `Category.id`, quan hệ 1 - N với `children`.
  - Cờ `isSystem` đánh dấu danh mục mặc định của hệ thống do admin tạo.
- **`Transaction`**: Giao dịch tài chính.
  - Cột: `amount Decimal(18,2)`, `type` (INCOME/EXPENSE/TRANSFER), `date`, `status`.
  - Hỗ trợ chuyển khoản giữa 2 ví qua `fromWalletId` và `toWalletId`.
  - Quan hệ 1 - N với `TransactionTag` (thẻ gán) và `TransactionAttachment` (hóa đơn, ảnh đính kèm).
- **`Tag` & `TransactionTag`**: Quan hệ N - N giữa giao dịch và thẻ nhãn qua bảng trung gian `TransactionTag` (Composite Key: `@@id([transactionId, tagId])`).
- **`TransactionAttachment`**: Lưu đường dẫn tệp `fileUrl`, tên `fileName`, kích thước, kiểu mime, loại tệp (`IMAGE`, `PDF`, `DOCUMENT`).

---

### 2.3. Nhóm Kế Hoạch & Tự Động Hóa (Ngân Sách, Định Kỳ, Mục Tiêu, Nợ)
- **`Budget`**: Ngân sách chi tiêu theo danh mục.
  - Cột: `amount`, `spent` (trường phi chuẩn hóa), `startDate`, `endDate`, `period`, `alertThreshold`, `isAlertEnabled`.
- **`RecurringTransaction`**: Lịch thu/chi định kỳ.
  - Cột: `amount`, `frequency`, `interval`, `startDate`, `endDate`, `lastRunDate`, `nextRunDate`, `isActive`.
- **`Goal` & `GoalContribution`**: Mục tiêu tiết kiệm và các khoản đóng góp tích lũy.
  - `Goal`: `targetAmount`, `savedAmount` (trường phi chuẩn hóa), `startDate`, `targetDate`, `priority`, `status`.
  - `GoalContribution`: Khoản đóng góp từng lần gắn với `Goal`, có thể trích từ `Wallet` và liên kết với một `Transaction`.
- **`Debt` & `DebtPayment`**: Quản lý vay/nợ và theo dõi thanh toán nợ.
  - `Debt`: `totalAmount`, `paidAmount` (trường phi chuẩn hóa), `interestRate`, `startDate`, `dueDate`, `monthlyPayment`, `contactName`.
  - `DebtPayment`: Các đợt trả nợ gắn với `Debt`, liên kết với `Transaction` tương ứng.

---

### 2.4. Nhóm Giám Sát & Thông Báo
- **`Notification`**: Lưu thông báo trong ứng dụng cho người dùng (`title`, `message`, `type`, `isRead`, `readAt`, `metadata Json`).
- **`AuditLog`**: Nhật ký kiểm toán thao tác hệ thống (`userId`, `action`, `entity`, `entityId`, `ipAddress`, `userAgent`, `metadata Json`).

---

## 3. Các Ràng Buộc Tính Toàn Vẹn & Khóa Duy Nhất (Unique Constraints)

| Model | Ràng buộc Unique | Mục đích nghiệp vụ |
|---|---|---|
| `User` | `email` | Không cho phép trùng email đăng ký |
| `User` | `resetToken` | Khóa duy nhất cho mã reset mật khẩu |
| `User` | `@@unique([provider, providerId])` | Mỗi tài khoản mạng xã hội chỉ liên kết với 1 user |
| `UserPreference` | `userId` | Mỗi người dùng chỉ có 1 bản ghi cấu hình cài đặt |
| `UserSession` | `deviceId` | Mã thiết bị là duy nhất trên toàn hệ thống |
| `UserSession` | `@@unique([userId, deviceId])` | Mỗi cặp user - device chỉ có một session hoạt động |
| `Category` | `@@unique([userId, name, type])` | Một người dùng không được tạo trùng tên danh mục trong cùng một loại (Thu/Chi) |
| `Wallet` | `@@unique([userId, name])` | Người dùng không được đặt trùng tên hai ví tiền |
| `Tag` | `@@unique([userId, name])` | Người dùng không được tạo thẻ trùng tên |
| `Budget` | `@@unique([userId, categoryId, startDate, endDate])` | Không được lập trùng 2 ngân sách cho cùng 1 danh mục trong cùng một khoảng thời gian |
| `TransactionTag` | `@@id([transactionId, tagId])` | Khóa chính phức hợp ngăn gán trùng lặp 1 thẻ cho 1 giao dịch |

---

## 4. Cơ Chế Xóa Mềm (Soft-Delete) & Khóa Ngoại

### 4.1. Các bảng áp dụng Soft-Delete (`deletedAt DateTime?`)
1. `User`
2. `Category`
3. `Wallet`
4. `Transaction`
5. `Budget`
6. `RecurringTransaction`
7. `Goal`
8. `Debt`

> **Lưu ý triển khai:** Mọi truy vấn đọc nghiệp vụ cần bổ sung điều kiện `where: { deletedAt: null }`. Khi người dùng thực hiện thao tác xóa, service sẽ cập nhật `deletedAt: new Date()` thay vì gọi Prisma `$executeRaw` hoặc `delete()`.

### 4.2. Chính Sách Khóa Ngoại (Cascade vs SetNull)
- **`onDelete: Cascade`** áp dụng cho dữ liệu phụ thuộc sống theo cha:
  - Xóa `User` -> xóa cascade `UserSession`, `UserPreference`, `Tag`, `Notification`,...
  - Xóa `Goal` -> xóa cascade `GoalContribution`.
  - Xóa `Debt` -> xóa cascade `DebtPayment`.
  - Xóa `Transaction` -> xóa cascade `TransactionTag`, `TransactionAttachment`.
- **`onDelete: SetNull`** áp dụng cho quan hệ tài chính để bảo toàn lịch sử:
  - Khi xóa `Category`, trường `categoryId` trong `Transaction` được set `null` (không xóa mất giao dịch tiền tệ).
  - Khi xóa `Wallet`, trường `walletId` trong `Transaction` được set `null`.

---

## 5. Các Trường Dữ Liệu Phi Chuẩn Hóa (Denormalized Fields)

Hệ thống duy trì một số trường tính toán sẵn (Cache trường) để tối ưu hiệu năng đọc (Read-heavy):

1. **`Wallet.balance`**:
   - Được cập nhật tức thì mỗi khi có `Transaction` thêm mới, sửa số tiền hoặc xóa.
   - *Lưu ý:* Khi phát sinh giao dịch lỗi hoặc roll-back, cần đảm bảo tính nhất quán (ACID transaction trong Prisma `$transaction`).
2. **`Budget.spent`**:
   - Tổng số tiền đã chi trong khoảng `startDate` - `endDate` của danh mục.
   - Được cộng/trừ khi có giao dịch `EXPENSE` thuộc danh mục đó.
3. **`Goal.savedAmount`**:
   - Số tiền đã gom được cho mục tiêu. Tăng khi `deposit` hoặc tạo `GoalContribution`, giảm khi `withdraw`.
4. **`Debt.paidAmount`**:
   - Tổng số tiền đã trả cho khoản nợ. Được cộng dồn từ các bản ghi `DebtPayment`.

---

## 6. Điểm Cần Lưu Ý / TODO Cho Data Model

1. **Đồng bộ số dư (Balance Consistency Check):**
   - Do có các trường phi chuẩn hóa (`Wallet.balance`, `Budget.spent`, `Debt.paidAmount`), nên bổ sung một cronjob bảo trì định kỳ tính toán lại số dư thực tế từ bảng `Transaction` để đối chiếu và tự động sửa sai lệch nếu có.
2. **Kiểu dữ liệu tiền tệ:**
   - Đã sử dụng đúng chuẩn `Decimal(18,2)` trên PostgreSQL, tránh triệt để lỗi làm tròn dấu phẩy động của kiểu `float`/`double`.
3. **Chỉ mục tìm kiếm (Indexes):**
   - Schema đã đánh index rất tốt trên các trường lọc phổ biến (`userId, date`, `userId, type`, `status`, `deletedAt`).
