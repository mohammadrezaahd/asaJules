# API Refactor Documentation

## تغییرات کلی

### 1. ساختار استاندارد پاسخ API ها

تمام API ها حالا یک ساختار استاندارد دارند:

```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo; // برای لیست ها
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  total?: number;
  limit?: number;
}
```

### 2. تغییرات Backend

#### Articles API (`/api/articles`)
- اضافه شدن pagination با پارامترهای `page`, `limit`, و `category`
- پاسخ شامل: `{ articles, totalPages, currentPage, total }`

#### Categories API (`/api/categories`)
- اضافه شدن pagination با پارامترهای `page` و `limit`  
- پاسخ شامل: `{ categories, totalPages, currentPage, total }`

#### Users API (`/api/users`)
- اضافه شدن pagination با پارامترهای `page` و `limit`
- پاسخ شامل: `{ users, totalPages, currentPage, total }`

#### Media API (`/api/media`)
- به‌روزرسانی ساختار پاسخ برای سازگاری
- پاسخ شامل: `{ media, totalPages, currentPage, total }`

#### Projects API (`/api/projects`)
- قبلاً pagination داشت، فقط ساختار استاندارد شد

### 3. تغییرات Frontend

#### apiUtils Helper Functions
```typescript
// برای API های تکی
apiUtils<T>(apiCall: () => Promise<T>): Promise<ApiResponse<T>>

// برای API های لیستی با pagination
apiListUtils<T>(apiCall: () => Promise<...>): Promise<ListApiResponse<T>>
```

#### مثال استفاده:
```typescript
// قبل از refactor
const articles = await articlesApi.getAll();

// بعد از refactor  
const response = await articlesApi.getAll({ page: 1, limit: 10 });
if (response.isSuccess && response.data) {
  setArticles(response.data);
  setPagination(response.pagination);
} else {
  setError(response.error);
}
```

### 4. فایل های تغییر یافته

#### Backend Routes:
- `app/api/articles/route.ts`
- `app/api/categories/route.ts` 
- `app/api/users/route.ts`
- `app/api/media/route.ts`

#### Frontend API Files:
- `components/api/apiUtils.ts` (جدید)
- `components/api/articles.api.ts`
- `components/api/categories.api.ts`
- `components/api/media.api.ts`
- `components/api/projects.api.ts`
- `components/api/users.api.ts`
- `components/api/auth.api.ts`

#### Type Definitions:
- `types/interfaces/api.interfaces.ts` (جدید)
- `types/index.ts`

#### Component Examples:
- `components/Home/ArticlesList.tsx`
- `components/Home/ProjectsGrid.tsx`
- `components/MediaManager/MediaManager.tsx`

### 5. مزایای این refactor

1. **سازگاری یکنواخت**: تمام API ها یک ساختار واحد دارند
2. **مدیریت خطا بهتر**: خطاها به صورت استاندارد مدیریت می‌شوند
3. **Pagination استاندارد**: تمام لیست ها pagination دارند
4. **Type Safety**: با استفاده از جنریک‌ها، type safety بهتری داریم
5. **قابلیت گسترش**: آسان‌تر می‌توان API جدید اضافه کرد

### 6. Migration Guide

برای به‌روزرسانی کامپوننت‌های موجود:

```typescript
// قدیمی
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await someApi.getAll();
      setData(data);
    } catch (error) {
      setError(error);
    }
  };
  fetchData();
}, []);

// جدید
useEffect(() => {
  const fetchData = async () => {
    const response = await someApi.getAll();
    if (response.isSuccess && response.data) {
      setData(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } else {
      setError(response.error || 'Unknown error');
    }
  };
  fetchData();
}, []);
```

### 7. فایل مثال

فایل `docs/api-usage-examples.tsx` شامل مثال‌های کاملی از نحوه استفاده از API های جدید است.