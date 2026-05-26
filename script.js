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
}

async function seedFoods(){

  const demoFoods = [

    {

      name:"قورمه سبزی",

      category:"ایرانی",

      image:"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop",

      favorites:["مامان"]

    },

    {

      name:"قیمه",

      category:"ایرانی",

      image:"https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",

      favorites:["جواد"]

    },

    {

      name:"ماکارونی",

      category:"خارجی",

      image:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop",

      favorites:["الهه"]

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

      return selectedFavoriteFilters.every(

        (person)=>
        food.favorites.includes(person)

      );

    });

  }

  filteredFoods.forEach((food)=>{

    const card =
    document.createElement("div");

    card.className = "food-card";

    card.innerHTML = `

      <img
        class="food-image"
        src="${food.image}"
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
            food.favorites.length
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

      image,

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

  await deleteDoc(
    doc(db,"foods",id)
  );

  loadFoods();
};

window.editFood =
async function(id){

  const food =
  foods.find(
    (f)=>f.firebaseId === id
  );

  const newName =
  prompt(
    "اسم جدید غذا:",
    food.name
  );

  if(!newName) return;

  const newImage =
  prompt(
    "عکس جدید:",
    food.image
  );

  if(!newImage) return;

  const newCategory =
  prompt(
    "دسته بندی:",
    food.category
  );

  if(!newCategory) return;

  await updateDoc(

    doc(db,"foods",id),

    {

      name:newName,

      image:newImage,

      category:newCategory

    }

  );

  loadFoods();
};

window.openFavoriteModal =
function(id){

  selectedFoodId = id;

  favoriteModal.style.display =
  "flex";
};

document
.querySelectorAll(".member-btn")
.forEach((btn)=>{

  btn.addEventListener("click",()=>{

    addFavorite(btn.textContent);

  });

});

saveCustomName.addEventListener(
"click",
()=>{

  const name =
  document
  .getElementById("customName")
  .value
  .trim();

  if(!name) return;

  addFavorite(name);

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
  [...food.favorites];

  if(!favorites.includes(name)){

    favorites.push(name);
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

favoriteFilterButtons.forEach((button)=>{

  button.addEventListener("click",()=>{

    const name =
    button.dataset.name;

    if(name === "همه"){

      selectedFavoriteFilters = [];

      favoriteFilterButtons.forEach(
        (b)=>
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

    if(
      selectedFavoriteFilters.includes(name)
    ){

      selectedFavoriteFilters =
      selectedFavoriteFilters.filter(
        (n)=>n !== name
      );

    }else{

      selectedFavoriteFilters.push(name);
    }

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
    `repeat(${cols},1fr)`;

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
  `repeat(${cols},1fr)`;

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
    food.image;

    randomFoodName.textContent =
    "😋 " + food.name;

    randomFoodCategory.textContent =
    "دسته بندی: " + food.category;

    loadingSpinner.style.display =
    "none";

    randomFoodResult.classList.remove(
      "hidden"
    );

  },1800);

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

}
);

loadColumns();

loadFoods();
