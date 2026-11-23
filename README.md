# Shalizar Store

## راه‌اندازی MongoDB Atlas

1. چون رمز قبلی در گفتگو ارسال شده، ابتدا آن را در Atlas عوض کنید و دسترسی
   **Network Access** را فقط به IP خودتان محدود کنید.
2. اگر `.env` ندارید، فایل نمونه را کپی کنید؛ سپس آن را محلی ویرایش کنید:

   ```powershell
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   notepad .env
   ```

3. در `.env` مقدار `MONGODB_URI` را با URI کلاستر و رمز جدید وارد کنید. اگر رمز
   شامل نویسه‌هایی مانند `@`, `:`, `/`, `?`, `#` یا `%` است، آن‌ها را در URI
   به‌شکل URL-encoded بنویسید. مقدار `SEED_SECRET` باید حداقل ۳۲ نویسه باشد؛
   می‌توانید آن را با این دستور بسازید:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   برای پنل مدیریت، `ADMIN_USERNAME` را به یک نام غیرقابل‌حدس و
   `ADMIN_PASSWORD` را به یک رمز یکتای حداقل ۶ نویسه‌ای تنظیم کنید. رمز ۶ نویسه‌ای
   ضعیف‌تر است؛ برای محیط عمومی از رمز طولانی و یکتا استفاده کنید.
   `ADMIN_SESSION_SECRET` نیز باید حداقل ۳۲ نویسه باشد؛ می‌توانید برای آن هم
   از دستور تولید secret بالا استفاده کنید. نشست مدیر پس از ۸ ساعت منقضی
   می‌شود و در production فقط از طریق HTTPS ارسال می‌شود.

   هیچ‌کدام از این مقادیر را در گفتگو یا Git قرار ندهید.
4. نصب و اجرا:

   ```powershell
   npm install
   npm run dev
   ```

### ورود محصولات نمونه

درخواست `POST /api/seed` فقط با `Authorization: Bearer <SEED_SECRET>` مجاز است.
این مسیر فقط سه محصول نمونهٔ خودش را جایگزین می‌کند و محصولات دیگری را که در
Atlas وارد کرده‌اید حذف نمی‌کند. برای فراخوانی از PowerShell، پس از تنظیم `.env`:

```powershell
$secret = (Get-Content .env | Where-Object { $_ -match '^SEED_SECRET=' }) -replace '^SEED_SECRET=', '' -replace '"', ''
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/seed -Headers @{ Authorization = "Bearer $secret" }
```

`.env` در Git نادیده گرفته می‌شود؛ هرگز اطلاعات اتصال یا کلید seed را commit
نکنید.

### پنل مدیریت

پس از تنظیم مقادیر بالا، سرور را مجدداً اجرا کنید و به `/admin/login` بروید.
مدیریت سفارش‌ها و انبار در `/admin/orders` و `/admin/products` قرار دارد.
هر Server Action پیش از تغییر MongoDB نشست مدیر را بررسی و داده‌های فرم را
اعتبارسنجی می‌کند.

برای نمایش تلفن بازرگانی و نشانی بارانداز در سربرگ/پاورقی، در صورت تمایل
`NEXT_PUBLIC_BUSINESS_PHONE` و `NEXT_PUBLIC_WAREHOUSE_ADDRESS` را تنظیم کنید.
این دو مقدار عمومی هستند و در رابط کاربری بازدیدکنندگان نمایش داده می‌شوند.

### ورود دستی محصول

صفحهٔ اصلی شش محصول جدیدتر را از مجموعهٔ `products` می‌خواند. در MongoDB Atlas
از بخش **Browse Collections** یک سند با این ساختار در پایگاه `shalizar` و
مجموعهٔ `products` اضافه کنید؛ MongoDB برای سند `_id` می‌سازد:

```json
{
  "title": "لوبیا چیتی درجه یک",
  "slug": "pinto-beans-grade-1",
  "origin": "خمین، ایران",
  "caliber": "۹ دستچین",
  "packaging": "کیسه ۳۰ کیلویی",
  "packageWeightKg": 30,
  "moqKg": 300,
  "stockKg": 12000,
  "tiers": [
    { "minKg": 300, "maxKg": 999, "pricePerKg": 145000 },
    { "minKg": 1000, "maxKg": 2999, "pricePerKg": 139000 },
    { "minKg": 3000, "pricePerKg": 132000 }
  ]
}
```

پس از ذخیرهٔ سند، صفحه را تازه‌سازی کنید تا محصول نمایش داده شود.
