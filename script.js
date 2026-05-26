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

let foods = [];

let selectedFoodId = null;

let currentCategory = "همه";

let selectedFavoriteFilters = [];

const foodsRef =
  collection(db, "foods");

async function loadFoods() {

  foods = [];

  const snapshot =
    await getDocs(foodsRef);

  snapshot.forEach((docItem) => {

    foods.push({

      firebaseId: docItem.id,

      ...docItem.data()

    });

  });

  if (foods.length === 0) {

    await addDefaultFoods();

    return;

  }

  renderFoods();

}

async function addDefaultFoods() {

  const defaultFoods = [

    {
      name: "قورمه سبزی",
      category: "ایرانی",
      image:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop",
      favorites: ["مامان"]
    },

    {
      name: "قیمه",
      category: "ایرانی",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      favorites: ["جواد"]
    },

    {
      name: "ماکارونی",
      category: "خارجی",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop",
      favorites: ["الهه", "مامان"]
    },

    {
      name: "لازانیا",
      category: "خارجی",
      image:
        "https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=1200&auto=format&fit=crop",
      favorites: ["الهه"]
    },

    {
      name: "کتلت",
      category: "ایرانی",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
      favorites: ["جواد"]
    },

    {
      name: "پنکیک",
      category: "صبحانه",
      image:
        "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=1200&auto=format&fit=crop",
      favorites: []
    },

    {
      name: "سالاد سزار",
      category: "رژیمی",
      image:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1200&auto=format&fit=crop",
      favorites: []
    }

  ];

  for (const food of defaultFoods) {

    await addDoc(foodsRef, food);

  }

  loadFoods();

}

function renderFoods() {

  foodsContainer.innerHTML = "";

  let filteredFoods = [...foods];

  if (currentCategory !== "همه") {

    filteredFoods =
      filteredFoods.filter(
        (food) =>
          food.category === currentCategory
      );

  }

  if (
    selectedFavoriteFilters.length > 0
  ) {

    filteredFoods =
      filteredFoods.filter((food) => {

        return selectedFavoriteFilters.every(
          (person) =>
            food.favorites.includes(person)
        );

      });

  }

  if (filteredFoods.length === 0) {

    foodsContainer.innerHTML = `

      <div style="
        text-align:center;
        padding:40px;
        width:100%;
      ">

        😢 غذایی پیدا نشد

      </div>

    `;

    return;

  }

  filteredFoods.forEach((food) => {

    const card =
      document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `

      <img
        class="food-image"
        src="${food.image}"
        alt="${food.name}"
      >

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
            ⭐
          </button>

          <button
            class="edit-btn"
            onclick="editFood('${food.firebaseId}')"
          >
            ✏️
          </button>

          <button
            class="delete-btn"
            onclick="deleteFood('${food.firebaseId}')"
          >
            🗑
          </button>

        </div>

        <div class="favorite-list">

          ${
            food.favorites.length > 0
              ? `❤️ ${food.favorites.join(" ، ")}`
              : "هنوز کسی علاقه‌مند نشده 😄"
          }

        </div>

      </div>

    `;

    foodsContainer.appendChild(card);

  });

}

foodForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name =
    document.getElementById("foodName").value;

  const image =
    document.getElementById("foodImage").value;

  const category =
    document.getElementById("foodCategory").value;

  await addDoc(foodsRef, {

    name,

    image,

    category,

    favorites: []

  });

  foodForm.reset();

  successMessage.style.display =
    "block";

  setTimeout(() => {

    successMessage.style.display =
      "none";

  }, 2500);

  loadFoods();

});

async function deleteFood(id) {

  const confirmDelete =
    confirm("حذف شود؟");

  if (!confirmDelete) return;

  await deleteDoc(
    doc(db, "foods", id)
  );

  loadFoods();

}

window.editFood =
  async function(id) {

    const food =
      foods.find(
        (f) => f.firebaseId === id
      );

    if (!food) return;

    const newName =
      prompt(
        "اسم جدید غذا:",
        food.name
      );

    if (!newName) return;

    const newImage =
      prompt(
        "لینک عکس:",
        food.image
      );

    if (!newImage) return;

    const newCategory =
      prompt(
        "دسته بندی:",
        food.category
      );

    if (!newCategory) return;

    await updateDoc(

      doc(db, "foods", id),

      {

        name: newName,

        image: newImage,

        category: newCategory

      }

    );

    loadFoods();

};

window.deleteFood =
  deleteFood;

window.openFavoriteModal =
  function(id) {

    selectedFoodId = id;

    favoriteModal.style.display =
      "flex";

};

document
  .querySelectorAll(".member-btn")
  .forEach((btn) => {

    btn.addEventListener("click", () => {

      addFavorite(btn.textContent);

    });

  });

saveCustomName.addEventListener("click", () => {

  const customName =
    document
      .getElementById("customName")
      .value
      .trim();

  if (!customName) return;

  addFavorite(customName);

  document.getElementById(
    "customName"
  ).value = "";

});

async function addFavorite(name) {

  const food =
    foods.find(
      (f) =>
        f.firebaseId === selectedFoodId
    );

  if (!food) return;

  let favorites =
    [...food.favorites];

  if (
    !favorites.includes(name)
  ) {

    favorites.push(name);

  }

  await updateDoc(

    doc(db, "foods", selectedFoodId),

    {

      favorites

    }

  );

  favoriteModal.style.display =
    "none";

  loadFoods();

}

categoryButtons.forEach((button) => {

  button.addEventListener("click", () => {

    categoryButtons.forEach((btn) =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    currentCategory =
      button.dataset.category;

    renderFoods();

  });

});

favoriteFilterButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const name =
      button.dataset.name;

    if (name === "همه") {

      selectedFavoriteFilters = [];

      favoriteFilterButtons.forEach((b) =>
        b.classList.remove("active")
      );

      button.classList.add("active");

      renderFoods();

      return;

    }

    document
      .querySelector(
        '[data-name="همه"]'
      )
      .classList.remove("active");

    button.classList.toggle("active");

    if (
      selectedFavoriteFilters.includes(name)
    ) {

      selectedFavoriteFilters =
        selectedFavoriteFilters.filter(
          (n) => n !== name
        );

    } else {

      selectedFavoriteFilters.push(name);

    }

    if (
      selectedFavoriteFilters.length === 0
    ) {

      document
        .querySelector(
          '[data-name="همه"]'
        )
        .classList.add("active");

    }

    renderFoods();

  });

});

viewButtons.forEach((btn) => {

  btn.addEventListener("click", () => {

    viewButtons.forEach((b) =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    const cols =
      btn.dataset.cols;

    foodsContainer.style.gridTemplateColumns =
      `repeat(${cols}, 1fr)`;

    localStorage.setItem(
      "foodColumns",
      cols
    );

  });

});

function loadColumns() {

  const savedColumns =
    localStorage.getItem(
      "foodColumns"
    ) || 2;

  foodsContainer.style.gridTemplateColumns =
    `repeat(${savedColumns}, 1fr)`;

  viewButtons.forEach((btn) => {

    btn.classList.remove("active");

    if (
      btn.dataset.cols ==
      savedColumns
    ) {

      btn.classList.add("active");

    }

  });

}

randomBtn.addEventListener("click", () => {

  let visibleFoods =
    [...foods];

  if (currentCategory !== "همه") {

    visibleFoods =
      visibleFoods.filter(
        (food) =>
          food.category === currentCategory
      );

  }

  if (
    selectedFavoriteFilters.length > 0
  ) {

    visibleFoods =
      visibleFoods.filter((food) => {

        return selectedFavoriteFilters.every(
          (person) =>
            food.favorites.includes(person)
        );

      });

  }

  if (visibleFoods.length === 0) {

    alert("غذایی پیدا نشد 😢");

    return;

  }

  modal.style.display = "flex";

  loadingSpinner.style.display =
    "block";

  randomFoodResult.classList.add(
    "hidden"
  );

  setTimeout(() => {

    const randomFood =
      visibleFoods[
        Math.floor(
          Math.random() *
          visibleFoods.length
        )
      ];

    randomFoodImage.src =
      randomFood.image;

    randomFoodName.textContent =
      `😋 ${randomFood.name}`;

    randomFoodCategory.textContent =
      `دسته بندی: ${randomFood.category}`;

    loadingSpinner.style.display =
      "none";

    randomFoodResult.classList.remove(
      "hidden"
    );

  }, 1800);

});

closeModal.addEventListener("click", () => {

  modal.style.display = "none";

});

closeFavorite.addEventListener("click", () => {

  favoriteModal.style.display =
    "none";

});

window.addEventListener("click", (e) => {

  if (e.target === modal) {

    modal.style.display = "none";

  }

  if (e.target === favoriteModal) {

    favoriteModal.style.display =
      "none";

  }

});

loadColumns();

loadFoods();
