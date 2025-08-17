# 🚀 Hướng Dẫn Setup Supabase cho Order Tracking

## 🎯 Tại sao chọn Supabase?

✅ **Hoàn toàn miễn phí** (Free tier rất rộng)  
✅ **No CORS issues** - Perfect cho GitHub Pages  
✅ **PostgreSQL thực sự** - Database chuyên nghiệp  
✅ **Real-time updates** - Tự động sync  
✅ **Row Level Security** - Bảo mật tốt  
✅ **Setup siêu dễ** - Chỉ 2 bước  

## 📋 Bước 1: Tạo Supabase Project

### 1.1 Đăng ký tài khoản
1. Vào [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Đăng nhập bằng GitHub (khuyến nghị)

### 1.2 Tạo project mới
1. Click **"New project"**
2. Chọn organization (thường là tên GitHub của bạn)
3. Đặt tên project: `orders-tracking`
4. Tạo database password (lưu lại để sau này)
5. Chọn region gần nhất (Singapore cho VN)
6. Click **"Create new project"**

⏰ **Đợi 2-3 phút** để Supabase setup database...

## 📊 Bước 2: Tạo Table

### 2.1 Vào SQL Editor
1. Sau khi project được tạo, vào **SQL Editor** (thanh bên trái)
2. Click **"New query"**

### 2.2 Tạo bảng orders
Copy và paste đoạn SQL sau:

```sql
-- Tạo bảng orders
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fb_link TEXT NOT NULL,
  tracking_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo index để tìm kiếm nhanh
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX idx_orders_name ON orders(name);

-- Insert một số dữ liệu mẫu (optional)
INSERT INTO orders (name, fb_link, tracking_code) VALUES
('Đạt', 'fb/dat123', '123'),
('Mai', 'fb/mai456', '456'),
('Nam', 'fb/nam789', '789');
```

3. Click **"Run"** để thực thi
4. Kiểm tra kết quả: Sẽ thấy "Success. No rows returned"

### 2.3 Kiểm tra bảng đã tạo
1. Vào **Table Editor** (thanh bên trái)
2. Sẽ thấy bảng `orders` với 3 record mẫu
3. Click vào bảng để xem chi tiết

## 🔑 Bước 3: Lấy API Keys

### 3.1 Vào Settings
1. Click **Settings** (icon gear ở thanh bên trái)
2. Click **API** trong menu

### 3.2 Copy thông tin cần thiết
Bạn sẽ thấy:

**Project URL:**
```
https://abcdefghijklmnop.supabase.co
```

**API Keys:**
- `anon/public` key - ✅ **Dùng cái này** (safe cho frontend)
- `service_role` key - ❌ Không dùng (chỉ dùng cho backend)

⚠️ **Quan trọng:** Chỉ dùng `anon` key cho frontend. Key này được thiết kế để an toàn khi expose công khai.

## ⚙️ Bước 4: Cấu hình App

### 4.1 Mở ứng dụng
1. Chạy app: `npm run dev`
2. Mở browser: `http://localhost:5173`

### 4.2 Nhập thông tin Supabase
1. Click nút **"Cài Đặt"** 
2. Nhập **Supabase URL** (từ bước 3.2)
3. Nhập **Supabase Anon Key** (từ bước 3.2)

### 4.3 Test kết nối
1. Click **"Test kết nối"**
2. Nếu thành công, sẽ thấy: "✅ Kết nối Supabase thành công!"
3. Dữ liệu mẫu sẽ tự động load

## 🎉 Hoàn thành!

Giờ bạn có thể:
- ➕ **Thêm đơn hàng mới**
- 🔍 **Tìm kiếm theo mã vận đơn**
- 🗑️ **Xóa đơn hàng đã về**
- 🔄 **Real-time sync** với database

## 🚀 Deploy lên GitHub Pages

### Bước 1: Chuẩn bị code
```bash
# Build production
npm run build

# Test local
npm run preview
```

### Bước 2: Push lên GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### Bước 3: Enable GitHub Pages
1. Vào GitHub repository
2. Settings → Pages
3. Source: **GitHub Actions**
4. Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/deploy-pages@v1
        with:
          folder: dist
```

### Bước 4: Cập nhật Supabase config trong code
Thay vì nhập manual, bạn có thể hard-code vào source:

```typescript
const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-key-here",
});
```

⚠️ **Lưu ý:** Anon key an toàn để public, không cần giấu.

## 🔧 Troubleshooting

### ❌ "Invalid API key"
- Kiểm tra lại URL và key từ Supabase dashboard
- Đảm bảo dùng `anon` key, không phải `service_role`

### ❌ "table orders does not exist"
- Vào SQL Editor, chạy lại script tạo bảng
- Kiểm tra Table Editor để confirm bảng đã được tạo

### ❌ "Row Level Security"
Nếu gặp lỗi RLS, chạy SQL này để tắt (cho demo):
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

### ❌ CORS errors
- Supabase tự động handle CORS
- Nếu vẫn lỗi, kiểm tra lại URL format

## 📚 Tài liệu thêm

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Tips & Best Practices

### 🔒 Bảo mật
- Luôn dùng `anon` key cho frontend
- Enable RLS khi có authentication
- Không bao giờ expose `service_role` key

### ⚡ Performance
- Tạo index cho các trường tìm kiếm
- Sử dụng pagination cho data lớn
- Cache data khi có thể

### 🚀 Production
- Monitor usage qua Supabase dashboard
- Setup backup database
- Sử dụng environment variables cho keys

---

**🎯 Result:** Bạn giờ có một order tracking system hoàn chỉnh với database thật, không cần backend, perfect cho GitHub Pages!