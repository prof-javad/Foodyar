import {
  db,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from "./firebase.js";

import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

// DOM Elements
const foodsContainer = document.getElementById("foodsContainer");
const skeletonContainer = document.getElementById("skeletonContainer");
const foodForm = document.getElementById("foodForm");
const randomBtn = document.getElementById("randomBtn");
const modal = document.getElementById("randomModal");
const closeModal = document.querySelector(".close-modal");
const loadingSpinner = document.getElementById("loadingSpinner");
const randomFoodResult = document.getElementById("randomFoodResult");
const randomFoodImage = document.getElementById("randomFoodImage");
const randomFoodName = document.getElementById("randomFoodName");
const randomFoodCategory = document.getElementById("randomFoodCategory");
const favoriteModal = document.getElementById("favoriteModal");
const closeFavorite = document.querySelector(".close-favorite");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importModal = document.getElementById("importModal");
const closeImport = document.getElementById("closeImport");
const importFile = document.getElementById("importFile");
const confirmImportBtn = document.getElementById("confirmImportBtn");
const statusChip = document.getElementById("statusChip");
const viewColBtns = document.querySelectorAll(".view-col-btn");

// Auth Elements
const guestMode = document.getElementById("guestMode");
const userMode = document.getElementById("userMode");
const userAvatarCompact = document.getElementById("userAvatar");
const userFamilyStatus = document.getElementById("userFamilyStatus");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const foodsRef = collection(db, "foods");
let foods = [];
let selectedFoodId = null;
let currentCategory = "همه";
let selectedFavoriteFilters = [];
let unsubscribe = null;
let isOnline = navigator.onLine;
let isSyncing = false;
let authChecked = false;
let pendingFoods = null;

const ALLOWED_MEMBERS = ["مامان", "الهه", "جواد"];
let currentUser = null;
let isApprovedUser = false;

// ایمیل‌های مجاز
const allowedEmails = [
  "jjwad1817@gmail.com",
  "ashraf.ir.090@gmail.com",
  "family@gmail.com"
];

// ==================== نمایش سریع اسکلتون ====================
function showSkeletonImmediately() {
  if (!skeletonContainer) return;
  const cols = localStorage.getItem("foodColumns") || "2";
  skeletonContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  skeletonContainer.style.display = "grid";
  foodsContainer.style.display = "none";
  
  let skeletons = '';
  for (let i = 0; i < 6; i++) {
    skeletons += `<div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-content"><div class="skeleton-title"></div><div class="skeleton-category"></div><div class="skeleton-actions"></div></div></div>`;
  }
  skeletonContainer.innerHTML = skeletons;
}

// اجرای فوری اسکلتون
showSkeletonImmediately();

// ==================== تبدیل عکس به Base64 ====================
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==================== آپلود عکس ====================
async function uploadImage(inputElement, buttonElement) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast("حجم عکس نباید بیشتر از 5 مگابایت باشد", "error");
      return;
    }
    
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = "⏳ در حال آپلود...";
    buttonElement.disabled = true;
    
    try {
      const base64 = await convertImageToBase64(file);
      inputElement.value = base64;
      showToast("✅ عکس با موفقیت آپلود شد", "success");
      
      const previewImg = document.getElementById("previewImg");
      if (previewImg && inputElement.id === "editImage") {
        previewImg.src = base64;
        previewImg.style.display = "block";
      }
    } catch (error) {
      console.error("خطا در آپلود:", error);
      showToast("❌ خطا در آپلود عکس", "error");
    } finally {
      buttonElement.innerHTML = originalText;
      buttonElement.disabled = false;
    }
  };
  
  fileInput.click();
}

// ==================== TOAST NOTIFICATION ====================
let currentToast = null;
let toastTimeout = null;

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  
  if (currentToast) {
    if (toastTimeout) clearTimeout(toastTimeout);
    const icons = { success: "✅", error: "❌", info: "⚠️" };
    currentToast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
    currentToast.className = `toast ${type}`;
    toastTimeout = setTimeout(() => {
      if (currentToast) {
        currentToast.style.animation = "toastSlideIn 0.3s reverse";
        setTimeout(() => { if (currentToast) currentToast.remove(); currentToast = null; }, 300);
      }
      toastTimeout = null;
    }, 2000);
    return;
  }
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "⚠️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);
  currentToast = toast;
  
  toastTimeout = setTimeout(() => {
    if (currentToast) {
      currentToast.style.animation = "toastSlideIn 0.3s reverse";
      setTimeout(() => { if (currentToast) currentToast.remove(); currentToast = null; }, 300);
    }
    toastTimeout = null;
  }, 2000);
}

// ==================== STATUS INDICATOR ====================
function updateStatusUI() {
  if (!isOnline) {
    statusChip.className = "status-chip offline";
    statusChip.innerHTML = '<span class="status-dot"></span><span class="status-text">آفلاین</span>';
  } else if (isSyncing) {
    statusChip.className = "status-chip syncing";
    statusChip.innerHTML = '<span class="status-dot"></span><span class="status-text">در حال همگام‌سازی...</span>';
  } else {
    statusChip.className = "status-chip online";
    statusChip.innerHTML = '<span class="status-dot"></span><span class="status-text">آنلاین</span>';
  }
}

window.addEventListener("online", () => { isOnline = true; updateStatusUI(); showToast("اتصال اینترنت برقرار شد ✅", "success"); });
window.addEventListener("offline", () => { isOnline = false; updateStatusUI(); });

// ==================== FIREBASE REALTIME SYNC ====================
// ==================== FIREBASE REALTIME SYNC (بهینه شده) ====================
let syncInitialized = false;

function startRealtimeSync() {
  // جلوگیری از ایجاد چندین اتصال همزمان
  if (syncInitialized) {
    console.log("Sync already initialized, skipping...");
    return;
  }
  
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  
  syncInitialized = true;
  
  // استفاده از setTimeout برای推迟 اتصال به Firebase
  setTimeout(() => {
    unsubscribe = onSnapshot(foodsRef, 
      (snapshot) => {
        isSyncing = false;
        updateStatusUI();
        foods = [];
        snapshot.forEach((doc) => { 
          foods.push({ firebaseId: doc.id, ...doc.data() }); 
        });
        
        if (authChecked) {
          skeletonContainer.style.display = "none";
          foodsContainer.style.display = "grid";
          updateFavoriteFilterButtons();
          renderFoods();
        } else {
          pendingFoods = foods;
        }
      },
      (error) => { 
        console.error("Firestore error:", error); 
        skeletonContainer.style.display = "none"; 
        foodsContainer.style.display = "grid"; 
        showToast("خطا در همگام‌سازی", "error");
        syncInitialized = false; // اجازه تلاش مجدد
      }
    );
  }, 100);
}

// ==================== UPDATE FAVORITE FILTERS ====================
function updateFavoriteFilterButtons() {
  const allFavoritePeople = new Set();
  foods.forEach(food => {
    if (food.favorites && Array.isArray(food.favorites)) {
      food.favorites.forEach(person => { if (ALLOWED_MEMBERS.includes(person)) allFavoritePeople.add(person); });
    }
  });
  
  const filterContainer = document.getElementById("favoriteFiltersContainer");
  if (!filterContainer) return;
  
  let newHtml = `<button class="chip favorite-filter-btn active" data-name="همه">همه</button>`;
  ALLOWED_MEMBERS.forEach(member => { if (allFavoritePeople.has(member)) newHtml += `<button class="chip favorite-filter-btn" data-name="${member}">${member}</button>`; });
  filterContainer.innerHTML = newHtml;
  
  document.querySelectorAll(".favorite-filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      if (name === "همه") {
        selectedFavoriteFilters = [];
        document.querySelectorAll(".favorite-filter-btn").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        renderFoods();
        return;
      }
      const allButton = document.querySelector('[data-name="همه"]');
      if (allButton) allButton.classList.remove("active");
      if (selectedFavoriteFilters.includes(name)) {
        selectedFavoriteFilters = selectedFavoriteFilters.filter(n => n !== name);
        button.classList.remove("active");
      } else {
        selectedFavoriteFilters.push(name);
        button.classList.add("active");
      }
      renderFoods();
    });
  });
}

// ==================== FILTER FUNCTION ====================
function getFilteredFoods() {
  let filteredFoods = [...foods];
  if (currentCategory !== "همه") filteredFoods = filteredFoods.filter(food => food.category === currentCategory);
  if (selectedFavoriteFilters.length > 0) {
    filteredFoods = filteredFoods.filter(food => {
      if (!food.favorites || !Array.isArray(food.favorites)) return false;
      return selectedFavoriteFilters.every(person => food.favorites.includes(person));
    });
  }
  return filteredFoods;
}

// ==================== RENDER FOODS ====================
function renderFoods() {
  foodsContainer.innerHTML = "";
  const filteredFoods = getFilteredFoods();
  if (filteredFoods.length === 0) {
    foodsContainer.innerHTML = `<div class="empty-state">🍽️ خوراکی یافت نشد</div>`;
    return;
  }
  filteredFoods.forEach((food) => {
    const card = document.createElement("div");
    card.className = "food-card";
    
    let favoritesHtml = '';
    if (isApprovedUser) {
      favoritesHtml = `<div class="favorite-list">${food.favorites && food.favorites.length ? "❤️ " + food.favorites.join(" ، ") : "هنوز کسی علاقه‌مند نشده"}</div>`;
    } else {
      const favCount = food.favorites && food.favorites.length ? food.favorites.length : 0;
      favoritesHtml = `<div class="favorite-list">❤️ ${favCount} نفر این غذا را دوست دارند</div>`;
    }
    
    card.innerHTML = `
      ${food.image ? `<img class="food-image" src="${food.image}" alt="${food.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=🍲'">` : `<div class="food-image-placeholder">🍲</div>`}
      <div class="food-content">
        <div class="food-header"><h3 class="food-title">${escapeHtml(food.name)}</h3><span>🍴</span></div>
        <div class="category-tag">${food.category}</div>
        ${favoritesHtml}
        <div class="card-actions">
          <button class="favorite-btn" onclick="window.openFavoriteModal('${food.firebaseId}')">⭐ علاقه‌مندان</button>
          <button class="edit-btn" onclick="window.openEditModal('${food.firebaseId}')">✏️ ویرایش</button>
          <button class="delete-btn" onclick="window.deleteFood('${food.firebaseId}')">🗑 حذف</button>
        </div>
      </div>
    `;
    foodsContainer.appendChild(card);
  });
  updateAccessUI();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; });
}

// ==================== PASTE IMAGE FROM CLIPBOARD ====================
async function getImageFromClipboard() {
  try {
    if (!navigator.clipboard || !navigator.clipboard.read) { showToast("مرورگر شما از چسباندن تصویر پشتیبانی نمی‌کند", "error"); return null; }
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      const imageTypes = clipboardItem.types.filter(type => type.startsWith("image/"));
      for (const type of imageTypes) {
        const blob = await clipboardItem.getType(type);
        if (blob) return URL.createObjectURL(blob);
      }
    }
    showToast("تصویری در کلیپ‌بورد یافت نشد", "info");
    return null;
  } catch (err) {
    console.error("Clipboard read failed:", err);
    if (err.name === "NotAllowedError") showToast("لطفاً ابتدا روی صفحه کلیک کنید سپس دوباره تلاش کنید", "error");
    else showToast("خطا در خواندن کلیپ‌بورد", "error");
    return null;
  }
}

const foodImageInput = document.getElementById("foodImage");
if (foodImageInput) {
  foodImageInput.addEventListener("paste", async (e) => {
    e.preventDefault();
    const imageUrl = await getImageFromClipboard();
    if (imageUrl) { foodImageInput.value = imageUrl; showToast("تصویر از کلیپ‌بورد چسبانده شد", "success"); }
  });
}

// ==================== دکمه آپلود عکس ====================
const uploadImageBtn = document.getElementById("uploadImageBtn");
if (uploadImageBtn) {
  uploadImageBtn.addEventListener("click", () => {
    if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند عکس آپلود کنند", "error"); return; }
    uploadImage(foodImageInput, uploadImageBtn);
  });
}

const uploadEditImageBtn = document.getElementById("uploadEditImageBtn");
const editImageInput = document.getElementById("editImage");
if (uploadEditImageBtn && editImageInput) {
  uploadEditImageBtn.addEventListener("click", () => {
    if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند عکس آپلود کنند", "error"); return; }
    uploadImage(editImageInput, uploadEditImageBtn);
  });
}

// ==================== ADD FOOD ====================
if (foodForm) {
  foodForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند خوراک اضافه کنند", "error"); return; }
    const name = document.getElementById("foodName").value.trim();
    const image = document.getElementById("foodImage").value.trim();
    const category = document.getElementById("foodCategory").value;
    if (!name) { showToast("لطفاً اسم خوراک را وارد کنید", "error"); return; }
    if (!category) { showToast("لطفاً دسته بندی را انتخاب کنید", "error"); return; }
    try {
      await addDoc(foodsRef, { name, image: image || "", category, favorites: [] });
      foodForm.reset();
      showToast("✅ خوراک اضافه شد", "success");
    } catch (error) { console.error("Error adding food:", error); showToast("خطا در اضافه کردن خوراک", "error"); }
  });
}

// ==================== DELETE FOOD ====================
window.deleteFood = async function(id) {
  if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند حذف کنند", "error"); return; }
  if (confirm("آیا از حذف این خوراک مطمئن هستید؟")) {
    try { await deleteDoc(doc(db, "foods", id)); showToast("🗑 خوراک حذف شد", "success"); } 
    catch (error) { showToast("خطا در حذف خوراک", "error"); }
  }
};

// ==================== EDIT MODAL ====================
window.openEditModal = function(id) {
  if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند ویرایش کنند", "error"); return; }
  const food = foods.find(f => f.firebaseId === id);
  if (!food) return;
  selectedFoodId = id;
  document.getElementById("editName").value = food.name;
  document.getElementById("editImage").value = food.image || "";
  document.getElementById("editCategory").value = food.category;
  const previewImg = document.getElementById("previewImg");
  if (food.image) { previewImg.src = food.image; previewImg.style.display = "block"; } 
  else { previewImg.style.display = "none"; }
  document.getElementById("editModal").style.display = "flex";
};

document.getElementById("editImage")?.addEventListener("input", (e) => {
  const previewImg = document.getElementById("previewImg");
  if (e.target.value) { previewImg.src = e.target.value; previewImg.style.display = "block"; } 
  else { previewImg.style.display = "none"; }
});

document.getElementById("editImage")?.addEventListener("paste", async (e) => {
  e.preventDefault();
  const imageUrl = await getImageFromClipboard();
  if (imageUrl) {
    document.getElementById("editImage").value = imageUrl;
    const previewImg = document.getElementById("previewImg");
    previewImg.src = imageUrl;
    previewImg.style.display = "block";
    showToast("تصویر از کلیپ‌بورد چسبانده شد", "success");
  }
});

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند ویرایش کنند", "error"); return; }
  const newName = document.getElementById("editName").value.trim();
  const newImage = document.getElementById("editImage").value.trim();
  const newCategory = document.getElementById("editCategory").value;
  if (!newName) { showToast("لطفاً اسم خوراک را وارد کنید", "error"); return; }
  try {
    await updateDoc(doc(db, "foods", selectedFoodId), { name: newName, image: newImage, category: newCategory });
    document.getElementById("editModal").style.display = "none";
    showToast("✏️ خوراک ویرایش شد", "success");
  } catch (error) { showToast("خطا در ویرایش خوراک", "error"); }
});

document.getElementById("cancelEditBtn")?.addEventListener("click", () => { document.getElementById("editModal").style.display = "none"; });
document.getElementById("closeEdit")?.addEventListener("click", () => { document.getElementById("editModal").style.display = "none"; });

// ==================== FAVORITE MODAL ====================
window.openFavoriteModal = function(id) {
  if (!isApprovedUser) { showToast("فقط اعضای خانواده می‌توانند علاقه‌مندی ثبت کنند", "error"); return; }
  selectedFoodId = id;
  const membersList = document.getElementById("membersList");
  if (membersList) {
    membersList.innerHTML = ALLOWED_MEMBERS.map(member => `<button class="member-btn" data-member="${member}">${member}</button>`).join('');
    document.querySelectorAll(".member-btn").forEach((btn) => { btn.addEventListener("click", () => { addFavorite(btn.dataset.member); }); });
  }
  favoriteModal.style.display = "flex";
};

async function addFavorite(name) {
  const food = foods.find(f => f.firebaseId === selectedFoodId);
  if (!food) return;
  const favorites = [...(food.favorites || [])];
  if (!favorites.includes(name)) { favorites.push(name); showToast(`⭐ ${name} به علاقه‌مندان اضافه شد`, "success"); } 
  else { const index = favorites.indexOf(name); favorites.splice(index, 1); showToast(`❤️ ${name} از علاقه‌مندان حذف شد`, "info"); }
  try { await updateDoc(doc(db, "foods", selectedFoodId), { favorites }); favoriteModal.style.display = "none"; } 
  catch (error) { showToast("خطا در ثبت علاقه‌مندی", "error"); }
}

closeFavorite.addEventListener("click", () => { favoriteModal.style.display = "none"; });

// ==================== CATEGORY FILTER ====================
document.querySelectorAll(".category-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.category;
    renderFoods();
  });
});

// ==================== VIEW COLUMNS ====================
function loadColumns() {
  const cols = localStorage.getItem("foodColumns") || "2";
  foodsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  if (skeletonContainer) skeletonContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  viewColBtns.forEach(btn => { if (btn.dataset.cols === cols) btn.classList.add("active"); else btn.classList.remove("active"); });
}

viewColBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const cols = btn.dataset.cols;
    foodsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    if (skeletonContainer) skeletonContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    localStorage.setItem("foodColumns", cols);
    viewColBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ==================== RANDOM FOOD ====================
randomBtn.addEventListener("click", () => {
  const visibleFoods = getFilteredFoods();
  if (!visibleFoods.length) { showToast("🍽️ خوراکی پیدا نشد!", "error"); return; }
  modal.style.display = "flex";
  loadingSpinner.style.display = "block";
  randomFoodResult.classList.add("hidden");
  setTimeout(() => {
    const food = visibleFoods[Math.floor(Math.random() * visibleFoods.length)];
    randomFoodImage.src = food.image || "https://via.placeholder.com/400x300?text=🍲";
    randomFoodImage.alt = food.name;
    randomFoodName.textContent = "😋 " + food.name;
    randomFoodCategory.textContent = "دسته بندی: " + food.category;
    loadingSpinner.style.display = "none";
    randomFoodResult.classList.remove("hidden");
  }, 300);
});

closeModal.addEventListener("click", () => { modal.style.display = "none"; });

// ==================== EXPORT BACKUP ====================
exportBtn.addEventListener("click", () => {
  const exportData = foods.map(food => ({ name: food.name, category: food.category, image: food.image || "", favorites: food.favorites || [], exportedAt: new Date().toISOString() }));
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `foods-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`💾 بکاپ گرفته شد (${exportData.length} خوراک)`, "success");
});

// ==================== IMPORT BACKUP ====================
importBtn.addEventListener("click", () => { importModal.style.display = "flex"; importFile.value = ""; });
closeImport.addEventListener("click", () => { importModal.style.display = "none"; });
confirmImportBtn.addEventListener("click", async () => {
  if (!importFile.files || !importFile.files[0]) { showToast("لطفاً فایل بکاپ را انتخاب کنید", "error"); return; }
  try {
    const file = importFile.files[0];
    const text = await file.text();
    const importedFoods = JSON.parse(text);
    if (!Array.isArray(importedFoods)) throw new Error("فرمت فایل نامعتبر است");
    let successCount = 0;
    for (const food of importedFoods) {
      if (food.name && food.category) {
        await addDoc(foodsRef, { name: food.name, category: food.category, image: food.image || "", favorites: food.favorites || [] });
        successCount++;
      }
    }
    importModal.style.display = "none";
    showToast(`📥 ${successCount} خوراک با موفقیت بازیابی شد`, "success");
  } catch (error) { console.error("Import error:", error); showToast("خطا در بازیابی فایل بکاپ", "error"); }
});

// ==================== MODAL CLOSE ON OUTSIDE CLICK ====================
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === favoriteModal) favoriteModal.style.display = "none";
  if (e.target === importModal) importModal.style.display = "none";
  const editModalElem = document.getElementById("editModal");
  if (e.target === editModalElem) editModalElem.style.display = "none";
});

// ==================== AUTH SYSTEM ====================
async function loginWithGoogle() {
  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = "⏳ ...";
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    showToast("🔒 ورود انجام شد", "success");
  } catch (error) { 
    console.error(error); 
    showToast("❌ خطا در ورود", "error"); 
  } finally { 
    loginBtn.disabled = false; 
    loginBtn.innerHTML = "🔐 ورود"; 
  }
}

async function logoutUser() {
  const isConfirmed = confirm("آیا مطمئنی می‌خوای خارج بشی؟");
  if (!isConfirmed) return;
  try { 
    await signOut(auth); 
    showToast("🚪 خارج شدی", "info"); 
  } catch (error) { 
    console.error(error); 
    showToast("❌ خطا در خروج", "error"); 
  }
}

function updateAccessUI() {
  document.querySelectorAll(".edit-btn, .delete-btn, .favorite-btn").forEach(el => {
    if (!isApprovedUser) { 
      el.classList.add("hidden"); 
      if (el.classList.contains("favorite-btn")) el.disabled = true; 
    } else { 
      el.classList.remove("hidden"); 
      if (el.classList.contains("favorite-btn")) el.disabled = false; 
    }
  });
  
  const form = document.getElementById("foodForm");
  if (form) { 
    form.style.display = isApprovedUser ? "grid" : "none"; 
  }
  
  const addSection = document.querySelector(".add-food-section");
  if (addSection) {
    if (isApprovedUser) { 
      addSection.style.opacity = "1"; 
      addSection.style.pointerEvents = "auto"; 
    } else { 
      addSection.style.opacity = "0.6"; 
      addSection.style.pointerEvents = "none"; 
    }
  }
}

let authTimeout = null;

onAuthStateChanged(auth, (user) => {
  if (authTimeout) clearTimeout(authTimeout);
  
  authTimeout = setTimeout(() => {
    currentUser = user;
    console.log("Auth state changed:", user ? user.email : "No user");
    
    if (user) {
      isApprovedUser = allowedEmails.includes(user.email);
      
      guestMode.classList.add("hidden");
      userMode.classList.remove("hidden");
      
      if (user.photoURL) {
        userAvatarCompact.src = user.photoURL;
      } else {
        userAvatarCompact.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=ff9800&color=fff&length=1`;
      }
      
      if (isApprovedUser) {
        userFamilyStatus.innerHTML = "🟢 عضو خانواده";
        userFamilyStatus.style.background = "#e8f5e9";
        userFamilyStatus.style.color = "#16a34a";
        if (!authChecked) showToast(`✅ خوش آمدی`, "success");
      } else {
        userFamilyStatus.innerHTML = "👀 حالت مشاهده";
        userFamilyStatus.style.background = "#fff3e0";
        userFamilyStatus.style.color = "#f97316";
        if (!authChecked) showToast("⛔ دسترسی ویرایش نداری", "error");
      }
    } else {
      isApprovedUser = false;
      guestMode.classList.remove("hidden");
      userMode.classList.add("hidden");
    }
    
    authChecked = true;
    updateAccessUI();
    
    if (pendingFoods && pendingFoods.length > 0) {
      foods = pendingFoods;
      skeletonContainer.style.display = "none";
      foodsContainer.style.display = "grid";
      updateFavoriteFilterButtons();
      renderFoods();
      pendingFoods = null;
    }
  }, 10);
});

if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

// ==================== INIT ====================
// اطمینان از اجرای یکبار
if (!window._initDone) {
  window._initDone = true;
  loadColumns();
  startRealtimeSync();
}
