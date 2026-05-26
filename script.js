import {
  db,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

// DOM Elements
const foodsContainer = document.getElementById("foodsContainer");
const skeletonContainer = document.getElementById("skeletonContainer");
const foodForm = document.getElementById("foodForm");
const categoryButtons = document.querySelectorAll(".category-btn");
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
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const viewerMessage = document.getElementById("viewerMessage");
const addFoodSection = document.getElementById("addFoodSection");

const foodsRef = collection(db, "foods");
let foods = [];
let selectedFoodId = null;
let currentCategory = "همه";
let selectedFavoriteFilters = [];
let unsubscribe = null;
let isOnline = navigator.onLine;
let isSyncing = false;
let currentUser = null;
let isApproved = false;

// لیست ایمیل‌های مجاز برای ویرایش
const ALLOWED_EMAILS = [
  "jjwad1817@gmail.com",    // ایمیل خودت رو اینجا بذار
  "eli985143@gmail.com",           // ایمیل مامان
  "ashraf.ir.090@gmail.com"         // ایمیل اعضای خانواده
];

const ALLOWED_MEMBERS = ["مامان", "الهه", "جواد"];

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️"
  };
  
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "toastSlideIn 0.3s reverse";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
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

window.addEventListener("online", () => {
  isOnline = true;
  updateStatusUI();
  showToast("اتصال اینترنت برقرار شد ✅", "success");
});

window.addEventListener("offline", () => {
  isOnline = false;
  updateStatusUI();
});

// ==================== AUTH UI UPDATE ====================
function updateAuthUI() {
  if (!currentUser) {
    // کاربر لاگین نیست
    loginBtn.style.display = "flex";
    userProfile.style.display = "none";
    viewerMessage.style.display = "flex";
    isApproved = false;
    
    // مخفی کردن دکمه‌های ادمین
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });
    
    // رندر مجدد غذاها بدون دکمه‌های ویرایش
    renderFoods();
  } else {
    // کاربر لاگین است
    loginBtn.style.display = "none";
    userProfile.style.display = "flex";
    
    // تنظیم اطلاعات کاربر
    userAvatar.src = currentUser.photoURL || "https://via.placeholder.com/36";
    userName.textContent = currentUser.displayName || currentUser.email?.split('@')[0] || "کاربر";
    
    // بررسی دسترسی
    const userEmail = currentUser.email;
    isApproved = ALLOWED_EMAILS.includes(userEmail);
    
    if (isApproved) {
      viewerMessage.style.display = "none";
      document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = "block";
      });
      if (addFoodSection) addFoodSection.style.display = "block";
      showToast(`✅ خوش آمدی ${currentUser.displayName || "عضو خانواده"}`, "success");
    } else {
      viewerMessage.style.display = "flex";
      viewerMessage.innerHTML = "⛔ شما دسترسی ویرایش ندارید. فقط اعضای خانواده می‌توانند غذا اضافه کنند.";
      document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = "none";
      });
      if (addFoodSection) addFoodSection.style.display = "none";
      showToast("⛔ دسترسی ویرایش ندارید", "warning");
    }
    
    // رندر مجدد غذاها
    renderFoods();
  }
}

// نمایش لودینگ احراز هویت
function showAuthLoading(show) {
  let loadingOverlay = document.getElementById("authLoadingOverlay");
  if (show) {
    if (!loadingOverlay) {
      loadingOverlay = document.createElement("div");
      loadingOverlay.id = "authLoadingOverlay";
      loadingOverlay.className = "auth-loading";
      loadingOverlay.innerHTML = `
        <div class="auth-loading-content">
          <div class="spinner"></div>
          <p>در حال ورود به حساب کاربری...</p>
        </div>
      `;
      document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = "flex";
  } else {
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }
}

// ==================== GOOGLE LOGIN ====================
async function handleGoogleLogin() {
  try {
    showAuthLoading(true);
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    currentUser = result.user;
    updateAuthUI();
    showToast(`🔐 خوش آمدی ${currentUser.displayName || "کاربر"}`, "success");
  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = "خطا در ورود";
    if (error.code === "auth/popup-blocked") {
      errorMessage = "پاپ‌آپ مسدود شده. لطفاً اجازه دهید.";
    } else if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "پنجره ورود بسته شد.";
    }
    showToast(errorMessage, "error");
  } finally {
    showAuthLoading(false);
  }
}

// ==================== LOGOUT ====================
async function handleLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    isApproved = false;
    updateAuthUI();
    showToast("🚪 از حساب خارج شدید", "info");
  } catch (error) {
    console.error("Logout error:", error);
    showToast("خطا در خروج", "error");
  }
}

// ==================== AUTH STATE LISTENER ====================
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateAuthUI();
});

// Event listeners برای دکمه‌های احراز هویت
loginBtn?.addEventListener("click", handleGoogleLogin);
logoutBtn?.addEventListener("click", handleLogout);

// ==================== FIREBASE REALTIME SYNC ====================
function startRealtimeSync() {
  if (unsubscribe) unsubscribe();
  
  skeletonContainer.style.display = "grid";
  foodsContainer.style.display = "none";
  
  unsubscribe = onSnapshot(foodsRef, 
    (snapshot) => {
      isSyncing = false;
      updateStatusUI();
      
      foods = [];
      snapshot.forEach((doc) => {
        foods.push({
          firebaseId: doc.id,
          ...doc.data()
        });
      });
      
      skeletonContainer.style.display = "none";
      foodsContainer.style.display = "grid";
      
      updateFavoriteFilterButtons();
      renderFoods();
      if (!isSyncing) {
        // فقط وقتی اولین بار نیست تویست نشون بده
        if (foods.length > 0) showToast("همگام‌سازی شد", "success");
      }
    },
    (error) => {
      console.error("Firestore error:", error);
      skeletonContainer.style.display = "none";
      foodsContainer.style.display = "grid";
      showToast("خطا در همگام‌سازی", "error");
    }
  );
}

// ==================== UPDATE FAVORITE FILTERS ====================
function updateFavoriteFilterButtons() {
  const allFavoritePeople = new Set();
  
  foods.forEach(food => {
    if (food.favorites && Array.isArray(food.favorites)) {
      food.favorites.forEach(person => {
        if (ALLOWED_MEMBERS.includes(person)) {
          allFavoritePeople.add(person);
        }
      });
    }
  });
  
  const filterContainer = document.getElementById("favoriteFiltersContainer");
  if (!filterContainer) return;
  
  let newHtml = `<button class="chip favorite-filter-btn active" data-name="همه">همه</button>`;
  
  ALLOWED_MEMBERS.forEach(member => {
    if (allFavoritePeople.has(member)) {
      newHtml += `<button class="chip favorite-filter-btn" data-name="${member}">${member}</button>`;
    }
  });
  
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

  if (currentCategory !== "همه") {
    filteredFoods = filteredFoods.filter(
      (food) => food.category === currentCategory
    );
  }

  if (selectedFavoriteFilters.length > 0) {
    filteredFoods = filteredFoods.filter((food) => {
      if (!food.favorites || !Array.isArray(food.favorites)) return false;
      return selectedFavoriteFilters.every(
        (person) => food.favorites.includes(person)
      );
    });
  }

  return filteredFoods;
}

// ==================== RENDER FOODS (با در نظر گرفتن دسترسی) ====================
function renderFoods() {
  foodsContainer.innerHTML = "";
  const filteredFoods = getFilteredFoods();

  if (filteredFoods.length === 0) {
    foodsContainer.innerHTML = `<div class="empty-state">🍽️ غذایی یافت نشد</div>`;
    return;
  }

  filteredFoods.forEach((food) => {
    const card = document.createElement("div");
    card.className = "food-card";

    // نمایش دکمه‌های ویرایش فقط برای کاربران تأیید شده
    const showEditButtons = isApproved;
    
    const actionButtons = showEditButtons ? `
      <div class="card-actions">
        <button class="favorite-btn" onclick="window.openFavoriteModal('${food.firebaseId}')">⭐ علاقه‌مندان</button>
        <button class="edit-btn" onclick="window.openEditModal('${food.firebaseId}')">✏️ ویرایش</button>
        <button class="delete-btn" onclick="window.deleteFood('${food.firebaseId}')">🗑 حذف</button>
      </div>
    ` : `
      <div class="card-actions viewer-actions">
        <button class="favorite-view-btn" disabled style="opacity:0.6; cursor:default;">⭐ مشاهده علاقه‌مندان</button>
      </div>
    `;

    card.innerHTML = `
      ${food.image ? 
        `<img class="food-image" src="${food.image}" alt="${food.name}" onerror="this.src='https://via.placeholder.com/400x300?text=🍲'">` : 
        `<div class="food-image-placeholder">🍲</div>`
      }
      <div class="food-content">
        <div class="food-header">
          <h3 class="food-title">${escapeHtml(food.name)}</h3>
          <span>🍴</span>
        </div>
        <div class="category-tag">${food.category}</div>
        <div class="favorite-list">
          ${food.favorites && food.favorites.length ?
            "❤️ " + food.favorites.join(" ، ") :
            "هنوز کسی علاقه‌مند نشده"}
        </div>
        ${actionButtons}
      </div>
    `;
    foodsContainer.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ==================== ADD FOOD (فقط برای ادمین‌ها) ====================
foodForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!isApproved) {
    showToast("⛔ شما دسترسی ویرایش ندارید", "error");
    return;
  }
  
  const name = document.getElementById("foodName").value.trim();
  const image = document.getElementById("foodImage").value.trim();
  const category = document.getElementById("foodCategory").value;
  
  if (!name) {
    showToast("لطفاً اسم غذا را وارد کنید", "error");
    return;
  }
  
  if (!category) {
    showToast("لطفاً دسته بندی را انتخاب کنید", "error");
    return;
  }
  
  try {
    await addDoc(foodsRef, {
      name,
      image: image || "",
      category,
      favorites: []
    });
    
    foodForm.reset();
    showToast("✅ غذا اضافه شد", "success");
  } catch (error) {
    console.error("Error adding food:", error);
    showToast("خطا در اضافه کردن غذا", "error");
  }
});

// ==================== DELETE FOOD (فقط برای ادمین‌ها) ====================
window.deleteFood = async function(id) {
  if (!isApproved) {
    showToast("⛔ شما دسترسی ویرایش ندارید", "error");
    return;
  }
  
  if (confirm("آیا از حذف این غذا مطمئن هستید؟")) {
    try {
      await deleteDoc(doc(db, "foods", id));
      showToast("🗑 غذا حذف شد", "success");
    } catch (error) {
      showToast("خطا در حذف غذا", "error");
    }
  }
};

// ==================== EDIT MODAL (فقط برای ادمین‌ها) ====================
window.openEditModal = function(id) {
  if (!isApproved) {
    showToast("⛔ شما دسترسی ویرایش ندارید", "error");
    return;
  }
  
  const food = foods.find(f => f.firebaseId === id);
  if (!food) return;
  
  selectedFoodId = id;
  const editModal = document.getElementById("editModal");
  
  document.getElementById("editName").value = food.name;
  document.getElementById("editImage").value = food.image || "";
  document.getElementById("editCategory").value = food.category;
  
  const previewImg = document.getElementById("previewImg");
  if (food.image) {
    previewImg.src = food.image;
    previewImg.style.display = "block";
  } else {
    previewImg.style.display = "none";
  }
  
  editModal.style.display = "flex";
};

document.getElementById("editImage")?.addEventListener("input", (e) => {
  const previewImg = document.getElementById("previewImg");
  if (e.target.value) {
    previewImg.src = e.target.value;
    previewImg.style.display = "block";
  } else {
    previewImg.style.display = "none";
  }
});

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  if (!isApproved) {
    showToast("⛔ شما دسترسی ویرایش ندارید", "error");
    return;
  }
  
  const newName = document.getElementById("editName").value.trim();
  const newImage = document.getElementById("editImage").value.trim();
  const newCategory = document.getElementById("editCategory").value;
  
  if (!newName) {
    showToast("لطفاً اسم غذا را وارد کنید", "error");
    return;
  }
  
  try {
    await updateDoc(doc(db, "foods", selectedFoodId), {
      name: newName,
      image: newImage,
      category: newCategory
    });
    
    document.getElementById("editModal").style.display = "none";
    showToast("✏️ غذا ویرایش شد", "success");
  } catch (error) {
    showToast("خطا در ویرایش غذا", "error");
  }
});

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

document.getElementById("closeEdit")?.addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

// ==================== FAVORITE MODAL (فقط برای ادمین‌ها) ====================
window.openFavoriteModal = function(id) {
  if (!isApproved) {
    showToast("⛔ فقط اعضای خانواده می‌توانند علاقه‌مندی ثبت کنند", "error");
    return;
  }
  
  selectedFoodId = id;
  const membersList = document.getElementById("membersList");
  
  if (membersList) {
    membersList.innerHTML = ALLOWED_MEMBERS.map(member => 
      `<button class="member-btn" data-member="${member}">${member}</button>`
    ).join('');
    
    document.querySelectorAll(".member-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        addFavorite(btn.dataset.member);
      });
    });
  }
  
  favoriteModal.style.display = "flex";
};

async function addFavorite(name) {
  if (!isApproved) {
    showToast("⛔ فقط اعضای خانواده می‌توانند علاقه‌مندی ثبت کنند", "error");
    return;
  }
  
  const food = foods.find(f => f.firebaseId === selectedFoodId);
  if (!food) return;

  const favorites = [...(food.favorites || [])];
  
  if (!favorites.includes(name)) {
    favorites.push(name);
    showToast(`⭐ ${name} به علاقه‌مندان اضافه شد`, "success");
  } else {
    const index = favorites.indexOf(name);
    favorites.splice(index, 1);
    showToast(`❤️ ${name} از علاقه‌مندان حذف شد`, "info");
  }

  try {
    await updateDoc(doc(db, "foods", selectedFoodId), { favorites });
    favoriteModal.style.display = "none";
  } catch (error) {
    showToast("خطا در ثبت علاقه‌مندی", "error");
  }
}

closeFavorite.addEventListener("click", () => {
  favoriteModal.style.display = "none";
});

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
  
  viewColBtns.forEach(btn => {
    if (btn.dataset.cols === cols) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
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

  if (!visibleFoods.length) {
    showToast("🍽️ غذایی پیدا نشد!", "error");
    return;
  }

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

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// ==================== EXPORT BACKUP (فقط برای ادمین‌ها) ====================
exportBtn?.addEventListener("click", () => {
  if (!isApproved) {
    showToast("⛔ فقط اعضای خانواده می‌توانند بکاپ بگیرند", "error");
    return;
  }
  
  const exportData = foods.map(food => ({
    name: food.name,
    category: food.category,
    image: food.image || "",
    favorites: food.favorites || [],
    exportedAt: new Date().toISOString()
  }));
  
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
  
  showToast(`💾 بکاپ گرفته شد (${exportData.length} غذا)`, "success");
});

// ==================== IMPORT BACKUP (فقط برای ادمین‌ها) ====================
importBtn?.addEventListener("click", () => {
  if (!isApproved) {
    showToast("⛔ فقط اعضای خانواده می‌توانند بکاپ بازیابی کنند", "error");
    return;
  }
  importModal.style.display = "flex";
  importFile.value = "";
});

closeImport?.addEventListener("click", () => {
  importModal.style.display = "none";
});

confirmImportBtn?.addEventListener("click", async () => {
  if (!isApproved) {
    showToast("⛔ فقط اعضای خانواده می‌توانند بکاپ بازیابی کنند", "error");
    return;
  }
  
  if (!importFile.files || !importFile.files[0]) {
    showToast("لطفاً فایل بکاپ را انتخاب کنید", "error");
    return;
  }
  
  try {
    const file = importFile.files[0];
    const text = await file.text();
    const importedFoods = JSON.parse(text);
    
    if (!Array.isArray(importedFoods)) {
      throw new Error("فرمت فایل نامعتبر است");
    }
    
    let successCount = 0;
    for (const food of importedFoods) {
      if (food.name && food.category) {
        await addDoc(foodsRef, {
          name: food.name,
          category: food.category,
          image: food.image || "",
          favorites: food.favorites || []
        });
        successCount++;
      }
    }
    
    importModal.style.display = "none";
    showToast(`📥 ${successCount} غذا با موفقیت بازیابی شد`, "success");
  } catch (error) {
    console.error("Import error:", error);
    showToast("خطا در بازیابی فایل بکاپ", "error");
  }
});

// ==================== MODAL CLOSE ON OUTSIDE CLICK ====================
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === favoriteModal) favoriteModal.style.display = "none";
  if (e.target === importModal) importModal.style.display = "none";
  const editModalElem = document.getElementById("editModal");
  if (e.target === editModalElem) editModalElem.style.display = "none";
});

// ==================== INIT ====================
loadColumns();
startRealtimeSync();
