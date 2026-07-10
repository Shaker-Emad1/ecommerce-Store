@echo off
:: Set UTF-8 encoding for Arabic characters support in CMD
chcp 65001 > nul

echo ===================================================
echo     ASBrandStore E-Commerce - تشغيل المشروع كاملًا
echo ===================================================
echo.

echo [+] تشغيل قاعدة البيانات والـ Backend API...
start "ASBrandStore Backend API" cmd /k "cd /d "%~dp0backend\ASBrandStore.Api" && dotnet run"

echo [+] تشغيل الواجهة الأمامية (Frontend UI)...
start "ASBrandStore Frontend UI" cmd /k "cd /d "%~dp0Premium Arabic E-commerce UI_UX" && npm run dev"

echo.
echo ===================================================
echo تم إرسال أوامر التشغيل للمشروع!
echo تم فتح نافذتين سطر أوامر مستقلتين:
echo 1. الـ Backend: يعمل على منفذ الـ API الافتراضي
echo 2. الـ Frontend: يعمل على خادم Vite المحلي
echo.
echo يرجى إبقاء النوافذ المفتوحة قيد التشغيل أثناء استخدام المشروع.
echo ===================================================
echo.
pause
