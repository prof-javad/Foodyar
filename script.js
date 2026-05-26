import {

  db,

  collection,

  addDoc,

  getDocs,

  deleteDoc,

  updateDoc,

  doc

}
from "./firebase.js";

const foodsContainer =
document.getElementById("foodsContainer");

const foodForm =
document.getElementById("foodForm");

const successMessage =
document.getElementById("successMessage");

const categoryButtons =
document.querySelectorAll(".category-btn");

const favoriteFilterButtons =
document.querySelectorAll(".favorite-filter-btn");

const viewButtons =
document.querySelectorAll(".view-btn");

const randomBtn =
document.getElementById("randomBtn");

const modal =
document.getElementById("randomModal");

const closeModal =
document.querySelector(".close-modal");

const loadingSpinner =
document.getElementById("loadingSpinner");

const randomFoodResult =
document.getElementById("randomFoodResult");

const randomFoodImage =
document.getElementById("randomFoodImage");

const randomFoodName =
document.getElementById("randomFoodName");

const randomFoodCategory =
document.getElementById("randomFoodCategory");

const favoriteModal =
document.getElementById("favoriteModal");

const closeFavorite =
document.querySelector(".close-favorite");

const saveCustomName =
document.getElementById("saveCustomName");

const foodsRef =
collection(db, "foods");

let foods = [];

let selectedFoodId = null;

let currentCategory = "همه";

let selectedFavoriteFilters = [];

// تنظیمات اعضای مجاز برای علاقه‌مندی
const ALLOWED_MEMBERS = ["مامان", "الهه", "جواد"];

async function loadFoods(){

  foods = [];

  const snapshot =
  await getDocs(foodsRef);

  snapshot.forEach((item)=>{

    foods.push({

      firebaseId:item.id,

      ...item.data()

    });

  });

  if(foods.length === 0){

    await seedFoods();

    return;
  }

  renderFoods();
  updateFavoriteFilterButtons();
}

async function seedFoods(){

  const demoFoods = [

    {

      name:"قورمه سبزی",

      category:"ایرانی",

      image:"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop",

      favorites:[]

    },

    {

      name:"قیمه",

      category:"ایرانی",

      image:"https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",

      favorites:[]

    },

    {

      name:"ماکارونی",

      category:"خارجی",

      image:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop",

      favorites:[]

    },

    {

      name:"لازانیا",

      category:"خارجی",

      image:"https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=1200&auto=format&fit=crop",

      favorites:[]

    }

  ];

  for(const food of demoFoods){

    await addDoc(
      foodsRef,
      food
    );
  }

  loadFoods();
}

// بروزرسانی دکمه‌های فیلتر علاقه‌مندی بر اساس غذاهای موجود
function updateFavoriteFilterButtons() {
  // جمع‌آوری تمام افرادی که حداقل یک غذا به اونها علاقه دارد
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
  
  // نمایش دکمه‌های فیلتر فقط برای افرادی که در غذاها وجود دارند
  const filterContainer = document.querySelector(".favorite-filter-buttons");
  if (!filterContainer) return;
  
  // حفظ دکمه "همه"
  let newHtml = `<button class="chip favorite-filter-btn active" data-name="همه">همه</button>`;
  
  // اضافه کردن دکمه فقط برای اعضایی که در غذاها وجود دارند
  ALLOWED_MEMBERS.forEach(member => {
    if (allFavoritePeople.has(member)) {
      newHtml += `<button class="chip favorite-filter-btn" data-name="${member}">${member}</button>`;
    }
  });
  
  filterContainer.innerHTML = newHtml;
  
  // ریلود event listenerها
  const newButtons = document.querySelectorAll(".favorite-filter-btn");
  newButtons.forEach((button) => {
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

function renderFoods(){

  foodsContainer.innerHTML = "";

  let filteredFoods = [...foods];

  if(currentCategory !== "همه"){

    filteredFoods =
    filteredFoods.filter(

      (food)=>
      food.category === currentCategory

    );
  }

  if(selectedFavoriteFilters.length > 0){

    filteredFoods =
    filteredFoods.filter((food)=>{
      
      if (!food.favorites || !Array.isArray(food.favorites)) return false;
      
      // بررسی می‌کنیم که آیا غذا به همه افراد انتخاب شده علاقه دارد
      return selectedFavoriteFilters.every(
        (person) => food.favorites.includes(person)
      );

    });

  }

  if (filteredFoods.length === 0) {
    foodsContainer.innerHTML = `<div class="empty-state">🍽️ غذایی یافت نشد</div>`;
    return;
  }

  filteredFoods.forEach((food)=>{

    const card =
    document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `

      ${food.image ? `<img class="food-image" src="${food.image}" alt="${food.name}">` : `<div class="food-image-placeholder">🍲 ${food.name}</div>`}

      <div class="food-content">

        <div class="food-header">

          <h3 class="food-title">
            ${food.name}
          </h3>

          <span>🍴</span>

        </div>

        <div class="category-tag">
          ${food.category}
        </div>

        <div class="card-actions">

          <button
            class="favorite-btn"
            onclick="openFavoriteModal('${food.firebaseId}')"
          >
            ⭐ علاقه‌مندان
          </button>

          <button
            class="edit-btn"
            onclick="openEditModal('${food.firebaseId}')"
          >
            ✏️ ویرایش
          </button>

          <button
            class="delete-btn"
            onclick="deleteFood('${food.firebaseId}')"
          >
            🗑 حذف
          </button>

        </div>

        <div class="favorite-list">

          ${
            food.favorites && food.favorites.length
            ?
            "❤️ " + food.favorites.join(" ، ")
            :
            "هنوز کسی علاقه‌مند نشده 😄"
          }

        </div>

      </div>

    `;

    foodsContainer.appendChild(card);

  });

}

foodForm.addEventListener(
"submit",
async(e)=>{

  e.preventDefault();

  const name =
  document.getElementById("foodName").value;

  const image =
  document.getElementById("foodImage").value;

  const category =
  document.getElementById("foodCategory").value;

  await addDoc(
    foodsRef,
    {

      name,

      image: image || "",

      category,

      favorites:[]

    }
  );

  foodForm.reset();

  successMessage.style.display =
  "block";

  setTimeout(()=>{

    successMessage.style.display =
    "none";

  },2500);

  loadFoods();

});

window.deleteFood =
async function(id){

  if (confirm("آیا از حذف این غذا مطمئن هستید؟")) {
    await deleteDoc(
      doc(db,"foods",id)
    );
    loadFoods();
  }
};

// مدال ویرایش جدید
window.openEditModal = function(id) {
  const food = foods.find(f => f.firebaseId === id);
  if (!food) return;
  
  selectedFoodId = id;
  
  const editModal = document.getElementById("editModal");
  document.getElementById("editName").value = food.name;
  document.getElementById("editImage").value = food.image || "";
  document.getElementById("editCategory").value = food.category;
  
  editModal.style.display = "flex";
};

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  const newName = document.getElementById("editName").value.trim();
  const newImage = document.getElementById("editImage").value.trim();
  const newCategory = document.getElementById("editCategory").value;
  
  if (!newName) {
    alert("لطفاً اسم غذا را وارد کنید");
    return;
  }
  
  await updateDoc(
    doc(db, "foods", selectedFoodId),
    {
      name: newName,
      image: newImage,
      category: newCategory
    }
  );
  
  document.getElementById("editModal").style.display = "none";
  loadFoods();
});

document.getElementById("closeEdit")?.addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

window.openFavoriteModal =
function(id){

  selectedFoodId = id;
  
  // بروزرسانی لیست دکمه‌های علاقه‌مندی در مدال
  const membersList = document.querySelector(".members-list");
  if (membersList) {
    membersList.innerHTML = ALLOWED_MEMBERS.map(member => 
      `<button class="member-btn" data-member="${member}">${member}</button>`
    ).join('');
    
    // اضافه کردن event listener برای دکمه‌های جدید
    document.querySelectorAll(".member-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        addFavorite(btn.dataset.member);
      });
    });
  }
  
  favoriteModal.style.display =
  "flex";
};

saveCustomName?.addEventListener(
"click",
()=>{

  const name =
  document
  .getElementById("customName")
  .value
  .trim();

  if(!name) return;
  
  // فقط اعضای مجاز می‌توانند اضافه شوند
  if (!ALLOWED_MEMBERS.includes(name)) {
    alert("فقط مامان، الهه و جواد می‌توانند علاقه‌مند شوند!");
    return;
  }

  addFavorite(name);
  document.getElementById("customName").value = "";
}
);

async function addFavorite(name){

  const food =
  foods.find(
    (f)=>
    f.firebaseId === selectedFoodId
  );

  if(!food) return;

  const favorites =
  [...(food.favorites || [])];

  if(!favorites.includes(name)){

    favorites.push(name);
  } else {
    // اگر قبلاً علاقه داشته، حذفش کن (toggle)
    const index = favorites.indexOf(name);
    favorites.splice(index, 1);
  }

  await updateDoc(

    doc(
      db,
      "foods",
      selectedFoodId
    ),

    {
      favorites
    }

  );

  favoriteModal.style.display =
  "none";

  loadFoods();
}

categoryButtons.forEach((button)=>{

  button.addEventListener("click",()=>{

    categoryButtons.forEach(
      (btn)=>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    currentCategory =
    button.dataset.category;

    renderFoods();

  });

});

viewButtons.forEach((btn)=>{

  btn.addEventListener("click",()=>{

    viewButtons.forEach(
      (b)=>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    const cols =
    btn.dataset.cols;

    foodsContainer.style.gridTemplateColumns =
    `repeat(${cols},minmax(0,1fr))`;

    localStorage.setItem(
      "foodColumns",
      cols
    );

  });

});

function loadColumns(){

  const cols =
  localStorage.getItem("foodColumns")
  || 2;

  foodsContainer.style.gridTemplateColumns =
  `repeat(${cols},minmax(0,1fr))`;

}

randomBtn.addEventListener("click",()=>{

  let visibleFoods =
  [...foods];

  if(currentCategory !== "همه"){

    visibleFoods =
    visibleFoods.filter(
      (food)=>
      food.category === currentCategory
    );

  }

  if(!visibleFoods.length){

    alert("غذایی پیدا نشد 😢");

    return;
  }

  modal.style.display =
  "flex";

  loadingSpinner.style.display =
  "block";

  randomFoodResult.classList.add(
    "hidden"
  );

  setTimeout(()=>{

    const food =
    visibleFoods[
      Math.floor(
        Math.random() *
        visibleFoods.length
      )
    ];

    randomFoodImage.src =
    food.image || "https://via.placeholder.com/400x300?text=غذا";

    randomFoodName.textContent =
    "😋 " + food.name;

    randomFoodCategory.textContent =
    "دسته بندی: " + food.category;

    loadingSpinner.style.display =
    "none";

    randomFoodResult.classList.remove(
      "hidden"
    );

  },500);

});

closeModal.addEventListener(
"click",
()=>{

  modal.style.display =
  "none";

}
);

closeFavorite.addEventListener(
"click",
()=>{

  favoriteModal.style.display =
  "none";

}
);

window.addEventListener(
"click",
(e)=>{

  if(e.target === modal){

    modal.style.display =
    "none";
  }

  if(e.target === favoriteModal){

    favoriteModal.style.display =
    "none";
  }
  
  const editModal = document.getElementById("editModal");
  if(e.target === editModal){
    editModal.style.display = "none";
  }

}
);

loadColumns();

loadFoods();
