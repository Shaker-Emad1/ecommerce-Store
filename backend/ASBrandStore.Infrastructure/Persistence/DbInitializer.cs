using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IConfiguration configuration)
    {
        // 1. Ensure database is created and migrations are applied
        await context.Database.MigrateAsync();

        // 2. Seed Default Settings if empty
        if (!await context.Settings.AnyAsync())
        {
            var setting = new Setting
            {
                StoreName = "A.S Brand Store",
                ContactPhone = "01234567890",
                ContactEmail = "info@asbrand.com",
                Address = "القاهرة، مصر",
                WhatsappUrl = "https://wa.me/201234567890",
                InstagramUrl = "@asbrand_store"
            };
            context.Settings.Add(setting);
            await context.SaveChangesAsync();
        }

        // 3. Seed Banners if empty
        if (!await context.Banners.AnyAsync())
        {
            var banners = new List<Banner>
            {
                new Banner
                {
                    Title = "عروض حصرية على السماعات",
                    Subtitle = "خصم يصل إلى 40% على أفضل الماركات",
                    CtaText = "تسوق الآن",
                    ImageUrl = "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1400&h=600&fit=crop&auto=format",
                    Badge = "عرض محدود",
                    OrderIndex = 0
                },
                new Banner
                {
                    Title = "شواحن سريعة وقوية",
                    Subtitle = "شحن ذكي لجميع أجهزتك في وقت قياسي",
                    CtaText = "اكتشف المزيد",
                    ImageUrl = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1400&h=600&fit=crop&auto=format",
                    Badge = "جديد",
                    OrderIndex = 1
                },
                new Banner
                {
                    Title = "إكسسوارات تقنية فاخرة",
                    Subtitle = "اختر من بين أفضل المنتجات التقنية",
                    CtaText = "تصفح الكتالوج",
                    ImageUrl = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1400&h=600&fit=crop&auto=format",
                    Badge = "كولكشن جديد",
                    OrderIndex = 2
                }
            };
            context.Banners.AddRange(banners);
            await context.SaveChangesAsync();
        }

        // 4. Seed Categories if empty
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new Category { Name = "سماعات", Icon = "Headphones", ImageUrl = "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=260&fit=crop&auto=format" },
                new Category { Name = "شواحن", Icon = "Zap", ImageUrl = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=260&fit=crop&auto=format" },
                new Category { Name = "كابلات", Icon = "Tag", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop&auto=format" },
                new Category { Name = "بطاريات", Icon = "Battery", ImageUrl = "https://images.unsplash.com/photo-1609592806596-b8f0e5e45994?w=400&h=260&fit=crop&auto=format" },
                new Category { Name = "حافظات", Icon = "Smartphone", ImageUrl = "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400&h=260&fit=crop&auto=format" },
                new Category { Name = "إكسسوارات", Icon = "Award", ImageUrl = "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=260&fit=crop&auto=format" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // 5. Seed Products if empty
        if (!await context.Products.AnyAsync())
        {
            var categoryMap = await context.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);

            var products = new List<Product>
            {
                new Product
                {
                    Name = "سماعات لاسلكية برو",
                    Price = 299,
                    OriginalPrice = 450,
                    Rating = 4.8,
                    ReviewsCount = 234,
                    Image = "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["سماعات"],
                    Badge = "الأكثر مبيعاً",
                    Description = "سماعات لاسلكية احترافية مع خاصية إلغاء الضوضاء النشط وجودة صوت عالية الدقة. تدوم البطارية 30 ساعة مع علبة الشحن.",
                    Stock = 50,
                    IsFeatured = true,
                    IsBestSeller = true,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#FFFFFF" },
                        new ProductColor { ColorCode = "#1a1a2e" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "التوصيل", Value = "بلوتوث 5.3" },
                        new ProductSpecification { Label = "البطارية", Value = "30 ساعة" },
                        new ProductSpecification { Label = "مقاومة الماء", Value = "IPX5" },
                        new ProductSpecification { Label = "الوزن", Value = "5.4 جرام" }
                    }
                },
                new Product
                {
                    Name = "شاحن سريع 65 واط",
                    Price = 149,
                    OriginalPrice = 220,
                    Rating = 4.7,
                    ReviewsCount = 189,
                    Image = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["شواحن"],
                    Badge = "عرض",
                    Description = "شاحن سريع 65 واط يدعم بروتوكولات الشحن السريع المتعددة. مثالي للهواتف والأجهزة اللوحية والحواسيب المحمولة.",
                    Stock = 80,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#FFFFFF" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "القدرة", Value = "65 واط" },
                        new ProductSpecification { Label = "البروتوكولات", Value = "PD 3.0, QC 4.0" },
                        new ProductSpecification { Label = "المنافذ", Value = "USB-C + USB-A" },
                        new ProductSpecification { Label = "الوزن", Value = "120 جرام" }
                    }
                },
                new Product
                {
                    Name = "كابل USB-C مضفر 2 متر",
                    Price = 79,
                    OriginalPrice = 120,
                    Rating = 4.6,
                    ReviewsCount = 312,
                    Image = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["كابلات"],
                    Description = "كابل USB-C مضفر بالنايلون عالي الجودة، يدعم الشحن السريع بقدرة 100 واط ونقل البيانات بسرعة 10 جيجابت في الثانية.",
                    Stock = 200,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#1A1A1A" },
                        new ProductColor { ColorCode = "#D4AF37" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "الطول", Value = "2 متر" },
                        new ProductSpecification { Label = "الشحن", Value = "100 واط" },
                        new ProductSpecification { Label = "نقل البيانات", Value = "10 Gbps" },
                        new ProductSpecification { Label = "متانة الطي", Value = "10,000 مرة" }
                    }
                },
                new Product
                {
                    Name = "بطارية محمولة 20000 mAh",
                    Price = 249,
                    OriginalPrice = 380,
                    Rating = 4.9,
                    ReviewsCount = 156,
                    Image = "https://images.unsplash.com/photo-1609592806596-b8f0e5e45994?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["بطاريات"],
                    Badge = "جديد",
                    Description = "بطارية محمولة بسعة هائلة 20000 مللي أمبير تكفي لشحن هاتفك أكثر من 5 مرات، مع شاشة LED لعرض مستوى الشحن.",
                    Stock = 40,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#1a1a2e" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "السعة", Value = "20,000 mAh" },
                        new ProductSpecification { Label = "الشحن الداخلي", Value = "22.5 واط" },
                        new ProductSpecification { Label = "المنافذ", Value = "2× USB-A + USB-C" },
                        new ProductSpecification { Label = "الوزن", Value = "420 جرام" }
                    }
                },
                new Product
                {
                    Name = "كفر مغناطيسي ماغسيف",
                    Price = 129,
                    OriginalPrice = 180,
                    Rating = 4.5,
                    ReviewsCount = 98,
                    Image = "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["حافظات"],
                    Description = "كفر حماية ممتاز متوافق مع تقنية MagSafe للشحن اللاسلكي، مصنوع من مواد عالية الجودة توفر حماية فائقة.",
                    Stock = 120,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#1a1a2e" },
                        new ProductColor { ColorCode = "#D4AF37" },
                        new ProductColor { ColorCode = "#8B4513" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "المادة", Value = "بولي كربونات + TPU" },
                        new ProductSpecification { Label = "التوافق", Value = "iPhone 15 Pro Max" },
                        new ProductSpecification { Label = "الخاصية", Value = "MagSafe متوافق" },
                        new ProductSpecification { Label = "السماكة", Value = "1.5 مم" }
                    }
                },
                new Product
                {
                    Name = "إكسسوارات آيربودز",
                    Price = 189,
                    OriginalPrice = 260,
                    Rating = 4.8,
                    ReviewsCount = 445,
                    Image = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["سماعات"],
                    Badge = "الأكثر مبيعاً",
                    Description = "إكسسوارات آيربودز فاخرة تشمل علبة حماية من الجلد الطبيعي وحلقة تثبيت وكابل شحن.",
                    Stock = 75,
                    IsFeatured = true,
                    IsBestSeller = true,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#FFFFFF" },
                        new ProductColor { ColorCode = "#000000" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "المادة", Value = "جلد طبيعي" },
                        new ProductSpecification { Label = "التوافق", Value = "AirPods Pro 1/2" },
                        new ProductSpecification { Label = "الحماية", Value = "مقاوم للخدش" },
                        new ProductSpecification { Label = "الإغلاق", Value = "مغناطيسي" }
                    }
                },
                new Product
                {
                    Name = "شاحن لاسلكي ماغسيف",
                    Price = 199,
                    OriginalPrice = 280,
                    Rating = 4.7,
                    ReviewsCount = 167,
                    Image = "https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["شواحن"],
                    Badge = "جديد",
                    Description = "شاحن لاسلكي ماغسيف بقدرة 15 واط للأجهزة المتوافقة، تصميم رفيع وأنيق مع مؤشر LED للشحن.",
                    Stock = 60,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#FFFFFF" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "القدرة", Value = "15 واط" },
                        new ProductSpecification { Label = "التوافق", Value = "MagSafe + Qi" },
                        new ProductSpecification { Label = "الطول", Value = "1 متر" },
                        new ProductSpecification { Label = "الواجهة", Value = "USB-C" }
                    }
                },
                new Product
                {
                    Name = "حامل هاتف للسيارة",
                    Price = 99,
                    OriginalPrice = 150,
                    Rating = 4.4,
                    ReviewsCount = 289,
                    Image = "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&h=500&fit=crop&auto=format",
                    CategoryId = categoryMap["إكسسوارات"],
                    Description = "حامل هاتف مغناطيسي للسيارة بتثبيت قوي على فتحة التهوية، يدعم الدوران 360 درجة.",
                    Stock = 150,
                    IsFeatured = false,
                    IsBestSeller = false,
                    Colors = new List<ProductColor>
                    {
                        new ProductColor { ColorCode = "#000000" },
                        new ProductColor { ColorCode = "#C0C0C0" }
                    },
                    Specs = new List<ProductSpecification>
                    {
                        new ProductSpecification { Label = "التثبيت", Value = "فتحة التهوية" },
                        new ProductSpecification { Label = "الدوران", Value = "360 درجة" },
                        new ProductSpecification { Label = "الحمل الأقصى", Value = "500 جرام" },
                        new ProductSpecification { Label = "التوافق", Value = "جميع الهواتف" }
                    }
                }
            };
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        // 6. Seed default Admin if empty
        if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
        {
            var adminEmail = configuration["AdminBootstrap:Email"];
            if (string.IsNullOrWhiteSpace(adminEmail))
            {
                adminEmail = Environment.GetEnvironmentVariable("ADMIN_BOOTSTRAP_EMAIL");
            }

            var adminPassword = configuration["AdminBootstrap:Password"];
            if (string.IsNullOrWhiteSpace(adminPassword))
            {
                adminPassword = Environment.GetEnvironmentVariable("ADMIN_BOOTSTRAP_PASSWORD");
            }

            if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
            {
                return;
            }

            var adminUser = new User
            {
                FullName = "Admin Store",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "Admin",
                Phone = "01234567890",
                Governorate = "القاهرة",
                Address = "القاهرة، مصر"
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}