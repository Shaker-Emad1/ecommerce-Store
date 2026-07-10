# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    ASBrandStore E-Commerce - تشغيل المشروع كاملًا" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

Write-Host "[+] تشغيل قاعدة البيانات والـ Backend API..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\backend\ASBrandStore.Api`" && dotnet run" -WindowStyle Normal

Write-Host "[+] تشغيل الواجهة الأمامية (Frontend UI)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\Premium Arabic E-commerce UI_UX`" && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "تم إرسال أوامر التشغيل للمشروع!" -ForegroundColor Yellow
Write-Host "تم فتح نافذتين سطر أوامر مستقلتين للـ Backend والـ Frontend." -ForegroundColor Yellow
Write-Host "يرجى إبقاء النوافذ المفتوحة قيد التشغيل أثناء استخدام المشروع." -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
