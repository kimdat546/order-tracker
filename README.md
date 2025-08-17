# 📦 Quản Lý Đơn Hàng - Order Tracking System

Hệ thống quản lý đơn hàng với tích hợp Supabase, hỗ trợ tìm kiếm và xóa hàng loạt mã vận đơn.

## ✨ Tính Năng

### 🔍 Tìm Kiếm Thông Minh
- **Tìm kiếm đơn lẻ**: Nhập tên khách hàng hoặc mã vận đơn
- **Tìm kiếm hàng loạt**: Paste nhiều mã vận đơn cùng lúc (mỗi mã một dòng)
- **Tự động loại bỏ prefix**: Hỗ trợ format như "PThanh\nVD31278895037551\n464567738706059"
- **Hiển thị tất cả kết quả**: Xem tất cả đơn hàng khớp với danh sách mã vận đơn

### 📱 Giao Diện Responsive
- **Mobile-first design**: Tối ưu cho điện thoại
- **Desktop layout**: Bảng dữ liệu đầy đủ cho màn hình lớn
- **Paste from clipboard**: Nút paste nhanh từ clipboard

### 🗄️ Tích Hợp Supabase
- **Real-time sync**: Đồng bộ dữ liệu thời gian thực
- **Auto-connect**: Tự động kết nối khi có config
- **Error handling**: Xử lý lỗi và hiển thị trạng thái kết nối
- **Local storage**: Lưu config tự động

### ⚡ Quản Lý Đơn Hàng
- **Thêm đơn hàng**: Tên, Facebook link, mã vận đơn
- **Xóa nhanh**: Xóa từng đơn hàng sau khi nhận được hàng
- **Batch delete**: Xóa nhiều đơn từ kết quả tìm kiếm

## 🚀 Cài Đặt và Sử Dụng

### 1. Clone Repository
```bash
git clone <repository-url>
cd orders-tracking
npm install
```

### 2. Development
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm run preview
```

### 4. Setup Supabase

#### 4.1 Tạo Database Table
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fb_link TEXT NOT NULL,
  tracking_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public access (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
```

#### 4.2 Cấu Hình trong App
1. Nhấn nút **"Cài Đặt"**
2. Nhập **Supabase URL**: `https://xxxxx.supabase.co`
3. Nhập **Anon Key**: Lấy từ Supabase Dashboard > Settings > API
4. Nhấn **"Test kết nối"**

## 📋 Quy Trình Sử Dụng

### Workflow Cơ Bản
1. **🔧 Setup Supabase một lần** - Cấu hình database connection
2. **📥 Tải dữ liệu** - Sync từ Supabase
3. **➕ Thêm đơn hàng mới** - Nhập thông tin khách hàng
4. **🔍 Tìm kiếm và xóa** - Paste mã vận đơn → Xóa hàng đã về

### Tìm Kiếm Hàng Loạt
```
PThanh
VD31278895037551
464567738706059
VD31278895037551
78521853481051
YT8780602332716
```

Paste đoạn text trên vào ô tìm kiếm → Hệ thống sẽ:
- Loại bỏ "PThanh" 
- Tìm tất cả đơn hàng có mã vận đơn trong danh sách
- Hiển thị từng đơn hàng với nút xóa riêng

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Deployment**: GitHub Pages ready

## 📁 Cấu Trúc Project

```
orders-tracking/
├── src/
│   ├── App.tsx          # Main component
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind styles
├── public/              # Static assets
├── dist/                # Build output
└── README.md           # Documentation
```

## 🔧 Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "type-check": "tsc --noEmit"
}
```

## 🌐 Deployment

### GitHub Pages
1. Build project: `npm run build`
2. Upload `dist/` folder to GitHub Pages
3. Set base path trong `vite.config.ts` nếu cần

### Vercel/Netlify
- Connect repository
- Build command: `npm run build`
- Publish directory: `dist`

## 🔒 Bảo Mật

- Sử dụng Supabase Anon Key (an toàn cho frontend)
- Row Level Security policies trong Supabase
- Local storage cho config (không sensitive data)

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - Xem [LICENSE](LICENSE) file để biết thêm chi tiết.

---

**🎯 Perfect cho GitHub Pages và deployment dễ dàng!**