# Media API Documentation

## پاک کردن Media

این سند نحوه استفاده از API های مربوط به پاک کردن فایل های media را شرح می‌دهد.

## API Endpoints

### 1. حذف یک فایل

**DELETE** `/api/media/[id]`

حذف یک فایل مدیا بر اساس ID

#### Response:
```json
{
  "message": "Media deleted successfully",
  "deletedMedia": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "filename": "example.jpg",
    "filepath": "/uploads/example.jpg"
  }
}
```

### 2. حذف چندین فایل

**DELETE** `/api/media`

#### Request Body:
```json
{
  "ids": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"]
}
```

#### Response:
```json
{
  "message": "Successfully deleted 2 media items",
  "deletedItems": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "filename": "image1.jpg",
      "filepath": "/uploads/image1.jpg"
    },
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2", 
      "filename": "image2.png",
      "filepath": "/uploads/image2.png"
    }
  ],
  "failedDeletions": [],
  "summary": {
    "total": 2,
    "deleted": 2,
    "failed": 0
  }
}
```

## Client API Usage

### حذف یک فایل

```typescript
import { mediaApi } from "@/components/api";

const handleDelete = async (id: string) => {
  const result = await mediaApi.delete(id);
  
  if (result.isSuccess) {
    console.log("File deleted:", result.data.deletedMedia);
  } else {
    console.error("Delete failed:", result.error);
  }
};
```

### حذف چندین فایل

```typescript
import { mediaApi } from "@/components/api";

const handleBulkDelete = async (ids: string[]) => {
  const result = await mediaApi.deleteMultiple(ids);
  
  if (result.isSuccess) {
    const { summary, failedDeletions } = result.data;
    console.log(\`Deleted \${summary.deleted} files\`);
    
    if (failedDeletions.length > 0) {
      console.warn("Some deletions failed:", failedDeletions);
    }
  } else {
    console.error("Bulk delete failed:", result.error);
  }
};
```

## Features

### ✅ امکانات پیاده‌سازی شده:

1. **حذف تک فایل**: حذف یک فایل بر اساس ID
2. **حذف چندین فایل**: حذف چندین فایل به صورت همزمان
3. **حذف فایل فیزیکی**: حذف فایل از دیسک سرور
4. **حذف رکورد دیتابیس**: حذف اطلاعات فایل از دیتابیس
5. **مدیریت خطا**: مدیریت موارد خطا برای فایل‌هایی که قابل حذف نیستند
6. **Auth & Authorization**: فقط Admin ها می‌توانند فایل‌ها را حذف کنند
7. **Bulk Selection UI**: رابط کاربری برای انتخاب و حذف چندین فایل
8. **Visual Feedback**: نمایش وضعیت انتخاب فایل‌ها

### 🔐 امنیت:

- **Authentication Required**: نیاز به login
- **Admin Only**: فقط کاربران با نقش ADMIN
- **File System Safety**: ادامه عملیات حتی در صورت عدم حذف فایل فیزیکی

### 🎨 UI Features:

- **Toggle Selection Mode**: حالت انتخاب چندگانه قابل فعال/غیرفعال
- **Visual Selection Indicators**: نشانگر بصری برای فایل‌های انتخاب شده  
- **Bulk Action Toolbar**: نوار ابزار برای عملیات روی فایل‌های انتخاب شده
- **Select All/None**: انتخاب همه یا هیچ‌کدام از فایل‌ها
- **Progress Feedback**: نمایش تعداد فایل‌های انتخاب شده
