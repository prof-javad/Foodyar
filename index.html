<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#ff9800" />
  <link rel="manifest" href="manifest.json" />
  <title>فودیار 🍔</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
  <link rel="apple-touch-icon" href="https://emojicdn.elk.sh/🍔?style=apple">
</head>

<body>

<!-- هدر ترکیبی: دکمه تصادفی سمت راست، بخش کاربری سمت چپ -->
<div class="main-header">
  <button id="randomBtn" class="random-btn">
    🎲 امروز چی میل کنیم؟
  </button>
  
  <div class="user-area" id="userArea">
    <!-- حالت خروج (مهمان) -->
    <div id="guestMode" class="guest-mode">
      <button id="loginBtn" class="login-btn">🔐 ورود</button>
    </div>
    
    <!-- حالت ورود (فقط برای کاربران لاگین شده) -->
    <div id="userMode" class="user-mode hidden">
      <div class="user-info-compact">
        <img id="userAvatar" class="user-avatar-compact" src="https://ui-avatars.com/api/?name=User" />
        <span id="userFamilyStatus" class="family-status-badge">عضو خانواده</span>
      </div>
      <button id="logoutBtn" class="logout-btn-compact">🚪</button>
    </div>
  </div>
</div>

<!-- وضعیت آنلاین/آفلاین -->
<div id="statusChip" class="status-chip online">
  <span class="status-dot"></span>
  <span class="status-text">آنلاین</span>
</div>

<main class="container">
  <section class="hero">
    <h1><span class="hero-emoji">🍔</span> فودیار</h1>
    <p>خوراک‌های مورد علاقه‌ات رو ذخیره کن!</p>
  </section>

  <!-- FILTER BAR - بدون برچسب -->
  <section class="filter-bar">
    <div class="filter-scroll-wrapper">
      <div class="chips categories" id="categoriesContainer">
        <button class="chip active category-btn" data-category="همه">همه</button>
        <button class="chip category-btn" data-category="ایرانی">ایرانی</button>
        <button class="chip category-btn" data-category="خارجی">خارجی</button>
        <button class="chip category-btn" data-category="فست‌فود">فست‌فود</button>
        <button class="chip category-btn" data-category="رژیمی">رژیمی</button>
        <button class="chip category-btn" data-category="صبحانه">صبحانه</button>
        <button class="chip category-btn" data-category="دسر">دسر</button>
      </div>
    </div>
    <div class="filter-scroll-wrapper">
      <div class="chips favorite-filter-buttons" id="favoriteFiltersContainer">
        <button class="chip favorite-filter-btn active" data-name="همه">همه</button>
      </div>
    </div>
  </section>

  <!-- ADD FOOD -->
  <section class="add-food-section">
    <h2>➕ اضافه کردن خوراک</h2>
    <form id="foodForm">
      <input type="text" id="foodName" placeholder="اسم خوراک..." required />
      <div class="image-row">
        <input type="url" id="foodImage" placeholder="لینک عکس (اختیاری)" class="image-url-input">
        <button type="button" id="uploadImageBtn" class="upload-image-btn">📸 آپلود</button>
      </div>
      <select id="foodCategory" required>
        <option value="">انتخاب دسته بندی</option>
        <option value="ایرانی">ایرانی</option>
        <option value="خارجی">خارجی</option>
        <option value="فست‌فود">فست‌فود</option>
        <option value="رژیمی">رژیمی</option>
        <option value="صبحانه">صبحانه</option>
        <option value="دسر">دسر</option>
      </select>
      <button type="submit">✨ ذخیره خوراک</button>
    </form>
  </section>

  <section class="foods-section">
    <div id="skeletonContainer" class="foods-grid skeleton-grid"></div>
    <div id="foodsContainer" class="foods-grid"></div>
  </section>

  <!-- FOOTER با دکمه‌های Import/Export و کنترل ستون‌ها -->
  <div class="footer-actions">
    <div class="footer-buttons-group">
      <button id="exportBtn" class="footer-icon-btn" title="بکاپ گرفتن">💾 بکاپ</button>
      <button id="importBtn" class="footer-icon-btn" title="بازیابی بکاپ">📥 بازیابی</button>
    </div>
    <div class="view-controls">
      <button class="view-col-btn active" data-cols="2">٢</button>
      <button class="view-col-btn" data-cols="3">٣</button>
      <button class="view-col-btn" data-cols="4">۴</button>
    </div>
  </div>
</main>

<!-- RANDOM MODAL -->
<div id="randomModal" class="modal">
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <div id="loadingSpinner" class="spinner-container">
      <div class="spinner"></div>
      <p>داریم انتخاب می‌کنیم 🍟</p>
    </div>
    <div id="randomFoodResult" class="random-result hidden">
      <img id="randomFoodImage" src="" />
      <h2 id="randomFoodName"></h2>
      <p id="randomFoodCategory"></p>
    </div>
  </div>
</div>

<!-- FAVORITE MODAL -->
<div id="favoriteModal" class="favorite-modal">
  <div class="favorite-content">
    <span class="close-favorite">&times;</span>
    <h3>⭐ چه کسی این خوراک را دوست دارد؟</h3>
    <p class="modal-hint">برای ثبت علاقه‌مندی کلیک کنید (کلیک مجدد برای حذف)</p>
    <div class="members-list" id="membersList"></div>
  </div>
</div>

<!-- EDIT MODAL -->
<div id="editModal" class="favorite-modal">
  <div class="favorite-content edit-modal-content">
    <span id="closeEdit" class="close-favorite">&times;</span>
    <h3>✏️ ویرایش خوراک</h3>
    <div class="edit-form">
      <div class="image-preview" id="editImagePreview">
        <span>🖼️ پیش‌نمایش عکس</span>
        <img id="previewImg" src="" style="display: none;" />
      </div>
      <input type="text" id="editName" placeholder="اسم خوراک" />
      <div class="image-row">
        <input type="url" id="editImage" placeholder="لینک عکس (اختیاری)" class="image-url-input" />
        <button type="button" id="uploadEditImageBtn" class="upload-image-btn">📸 آپلود</button>
      </div>
      <select id="editCategory">
        <option value="ایرانی">ایرانی</option>
        <option value="خارجی">خارجی</option>
        <option value="فست‌فود">فست‌فود</option>
        <option value="رژیمی">رژیمی</option>
        <option value="صبحانه">صبحانه</option>
        <option value="دسر">دسر</option>
      </select>
      <div class="edit-actions">
        <button id="saveEditBtn" class="save-btn">💾 ذخیره تغییرات</button>
        <button id="cancelEditBtn" class="cancel-btn">❌ انصراف</button>
      </div>
    </div>
  </div>
</div>

<!-- IMPORT MODAL -->
<div id="importModal" class="favorite-modal">
  <div class="favorite-content">
    <span id="closeImport" class="close-favorite">&times;</span>
    <h3>📥 بازیابی بکاپ</h3>
    <p>فایل JSON بکاپ خود را انتخاب کنید</p>
    <input type="file" id="importFile" accept=".json" />
    <button id="confirmImportBtn" class="save-btn" style="margin-top: 16px;">بازیابی</button>
  </div>
</div>

<!-- TOAST CONTAINER -->
<div id="toastContainer" class="toast-container"></div>

<script type="module" src="script.js"></script>
</body>

</html>
