const foodsContainer = document.getElementById("foodsContainer");
const foodForm = document.getElementById("foodForm");
const successMessage = document.getElementById("successMessage");

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

const saveCustomName = document.getElementById("saveCustomName");

let selectedFoodId = null;

let currentCategory = "همه";

const defaultFoods = [
  {
    id: Date.now() + 1,
    name: "قورمه سبزی",
    category: "ایرانی",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 2,
    name: "قیمه",
    category: "ایرانی",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 3,
    name: "ماکارونی",
    category: "خارجی",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 4,
    name: "لازانیا",
    category: "خارجی",
    image:
      "https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 5,
    name: "کتلت",
    category: "ایرانی",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 6,
    name: "پنکیک",
    category: "صبحانه",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },

  {
    id: Date.now() + 7,
    name: "سالاد سزار",
    category: "رژیمی",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1200&auto=format&fit=crop",
    favorites: [],
  },
];

function getFoods() {
  const storedFoods = localStorage.getItem("foods");

  if (storedFoods) {
    return JSON.parse(storedFoods);
  }

  localStorage.setItem("foods", JSON.stringify(defaultFoods));

  return defaultFoods;
}

let foods = getFoods();

function saveFoods() {
  localStorage.setItem("foods", JSON.stringify(foods));
}

function renderFoods() {

  foodsContainer.innerHTML = "";

  let filteredFoods = foods;

  if (currentCategory !== "همه") {
    filteredFoods = foods.filter(
      (food) => food.category === currentCategory
    );
  }

  if (filteredFoods.length === 0) {
    foodsContainer.innerHTML = `
      <div style="text-align:center;width:100%;padding:40px;">
        😢 غذایی در این دسته بندی وجود ندارد
      </div>
    `;
    return;
  }

  filteredFoods.forEach((food) => {

    const card = document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `
      <img class="food-image" src="${food.image}" alt="${food.name}">

      <div class="food-content">

        <div class="food-header">
          <h3 class="food-title">${food.name}</h3>
          <span>🍴</span>
        </div>

        <div class="category-tag">
          ${food.category}
        </div>

        <div class="card-actions">

          <button class="favorite-btn" onclick="openFavoriteModal(${food.id})">
            ⭐ علاقه‌مندی
          </button>

          <button class="delete-btn" onclick="deleteFood(${food.id})">
            🗑 حذف
          </button>

        </div>

        <div class="favorite-list">
          ${
            food.favorites.length > 0
              ? `❤️ دوست دارند: ${food.favorites.join(" ، ")}`
              : "هنوز کسی علاقه‌مند نشده 😄"
          }
        </div>

      </div>
    `;

    foodsContainer.appendChild(card);

  });
}

foodForm.addEventListener("submit", (e) => {

  e.preventDefault();

  const name = document.getElementById("foodName").value;

  const image = document.getElementById("foodImage").value;

  const category = document.getElementById("foodCategory").value;

  const newFood = {
    id: Date.now(),
    name,
    image,
    category,
    favorites: [],
  };

  foods.unshift(newFood);

  saveFoods();

  renderFoods();

  foodForm.reset();

  successMessage.style.display = "block";

  setTimeout(() => {
    successMessage.style.display = "none";
  }, 2500);

});

function deleteFood(id) {

  const confirmDelete = confirm("آیا مطمئن هستید؟");

  if (!confirmDelete) return;

  foods = foods.filter((food) => food.id !== id);

  saveFoods();

  renderFoods();

}

categoryButtons.forEach((button) => {

  button.addEventListener("click", () => {

    categoryButtons.forEach((btn) =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    currentCategory = button.dataset.category;

    renderFoods();

  });

});

randomBtn.addEventListener("click", () => {

  let filteredFoods = foods;

  if (currentCategory !== "همه") {
    filteredFoods = foods.filter(
      (food) => food.category === currentCategory
    );
  }

  if (filteredFoods.length === 0) {
    alert("غذایی پیدا نشد 😢");
    return;
  }

  modal.style.display = "flex";

  loadingSpinner.style.display = "block";

  randomFoodResult.classList.add("hidden");

  setTimeout(() => {

    const randomFood =
      filteredFoods[
        Math.floor(Math.random() * filteredFoods.length)
      ];

    randomFoodImage.src = randomFood.image;

    randomFoodName.textContent = `😋 ${randomFood.name}`;

    randomFoodCategory.textContent =
      `دسته بندی: ${randomFood.category}`;

    loadingSpinner.style.display = "none";

    randomFoodResult.classList.remove("hidden");

  }, 1800);

});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {

  if (e.target === modal) {
    modal.style.display = "none";
  }

  if (e.target === favoriteModal) {
    favoriteModal.style.display = "none";
  }

});

function openFavoriteModal(id) {

  selectedFoodId = id;

  favoriteModal.style.display = "flex";

}

closeFavorite.addEventListener("click", () => {
  favoriteModal.style.display = "none";
});

document.querySelectorAll(".member-btn").forEach((btn) => {

  btn.addEventListener("click", () => {

    addFavorite(btn.textContent);

  });

});

saveCustomName.addEventListener("click", () => {

  const customName =
    document.getElementById("customName").value.trim();

  if (!customName) return;

  addFavorite(customName);

  document.getElementById("customName").value = "";

});

function addFavorite(name) {

  const food = foods.find((f) => f.id === selectedFoodId);

  if (!food) return;

  if (!food.favorites.includes(name)) {
    food.favorites.push(name);
  }

  saveFoods();

  renderFoods();

  favoriteModal.style.display = "none";

}

renderFoods();
