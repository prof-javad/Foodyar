* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {

  --primary: #ff8a00;
  --secondary: #ff4d6d;
  --light: #fff7f0;
  --text: #3a2e2e;

  --shadow: 0 10px 25px rgba(0,0,0,0.08);

}

body {

  font-family: 'Vazirmatn', sans-serif;

  background:
    linear-gradient(
      to bottom,
      #fff8ef,
      #fff2f2
    );

  color: var(--text);

  min-height: 100vh;

}

.topbar {

  position: sticky;

  top: 0;

  z-index: 1000;

  background: rgba(255,255,255,0.9);

  backdrop-filter: blur(12px);

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 14px 18px;

  box-shadow: var(--shadow);

}

.random-btn {

  border: none;

  background:
    linear-gradient(
      135deg,
      var(--primary),
      var(--secondary)
    );

  color: white;

  padding: 15px 20px;

  border-radius: 18px;

  font-size: 1rem;

  font-family: inherit;

  cursor: pointer;

  transition: 0.3s;

  box-shadow: var(--shadow);

}

.random-btn:hover {

  transform: translateY(-2px);

}

.view-switcher {

  display: flex;

  gap: 8px;

}

.view-btn {

  border: none;

  width: 44px;
  height: 44px;

  border-radius: 14px;

  background: white;

  font-family: inherit;

  cursor: pointer;

  box-shadow: var(--shadow);

  transition: 0.3s;

}

.view-btn.active {

  background:
    linear-gradient(
      135deg,
      var(--primary),
      var(--secondary)
    );

  color: white;

}

.container {

  width: min(1200px, 92%);

  margin: auto;

  padding-bottom: 60px;

}

.hero {

  text-align: center;

  padding: 20px 10px 15px;

}

.hero h1 {

  font-size: 2rem;

  font-weight: 800;

}

.favorite-filter {

  margin-bottom: 20px;

}

.favorite-filter h3 {

  margin-bottom: 14px;

}

.favorite-filter-buttons {

  display: flex;

  gap: 10px;

  flex-wrap: wrap;

}

.favorite-filter-btn {

  border: none;

  background: white;

  padding: 12px 16px;

  border-radius: 100px;

  cursor: pointer;

  font-family: inherit;

  box-shadow: var(--shadow);

}

.favorite-filter-btn.active {

  background:
    linear-gradient(
      135deg,
      #ff7b00,
      #ff4d6d
    );

  color: white;

}

.categories {

  display: flex;

  gap: 10px;

  overflow-x: auto;

  padding-bottom: 10px;

  margin-bottom: 25px;

}

.category-btn {

  border: none;

  background: white;

  padding: 12px 18px;

  border-radius: 100px;

  cursor: pointer;

  font-family: inherit;

  white-space: nowrap;

  box-shadow: var(--shadow);

}

.category-btn.active {

  background:
    linear-gradient(
      135deg,
      var(--primary),
      var(--secondary)
    );

  color: white;

}

.add-food-section {

  background: white;

  padding: 24px;

  border-radius: 28px;

  box-shadow: var(--shadow);

  margin-bottom: 35px;

}

.add-food-section h2 {

  margin-bottom: 20px;

}

#foodForm {

  display: grid;

  gap: 14px;

}

#foodForm input,
#foodForm select {

  border: 2px solid #f1f1f1;

  padding: 15px;

  border-radius: 16px;

  font-family: inherit;

  font-size: 1rem;

}

#foodForm button {

  border: none;

  padding: 15px;

  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      #ffb703,
      #fb8500
    );

  color: white;

  font-size: 1rem;

  font-family: inherit;

  cursor: pointer;

}

.success-message {

  margin-top: 16px;

  background: #d8fdd8;

  color: #157515;

  padding: 14px;

  border-radius: 14px;

  display: none;

}

.foods-grid {

  display: grid;

  gap: 18px;

}

.food-card {

  background: white;

  border-radius: 28px;

  overflow: hidden;

  box-shadow: var(--shadow);

  transition: 0.35s;

  animation: fadeIn 0.5s ease;

}

.food-card:hover {

  transform: translateY(-4px);

}

.food-image {

  width: 100%;

  height: 200px;

  object-fit: cover;

}

.food-content {

  padding: 18px;

}

.food-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

}

.food-title {

  font-size: 1.2rem;

  font-weight: 700;

}

.category-tag {

  display: inline-block;

  margin-top: 12px;

  background: #fff0d6;

  color: #ff8a00;

  padding: 8px 14px;

  border-radius: 100px;

  font-size: 0.9rem;

}

.card-actions {

  display: flex;

  gap: 8px;

  margin-top: 18px;

}

.favorite-btn,
.delete-btn,
.edit-btn {

  flex: 1;

  border: none;

  padding: 11px;

  border-radius: 14px;

  cursor: pointer;

  font-family: inherit;

  transition: 0.3s;

}

.favorite-btn {

  background: #fff4c2;

}

.delete-btn {

  background: #ffe2e2;

}

.edit-btn {

  background: #dff4ff;

}

.favorite-list {

  margin-top: 14px;

  line-height: 1.9;

  color: #666;

}

.modal,
.favorite-modal {

  position: fixed;

  inset: 0;

  background: rgba(0,0,0,0.45);

  display: none;

  justify-content: center;

  align-items: center;

  z-index: 3000;

  padding: 20px;

}

.modal-content,
.favorite-content {

  background: white;

  width: 100%;
  max-width: 420px;

  border-radius: 28px;

  padding: 24px;

  position: relative;

}

.close-modal,
.close-favorite {

  position: absolute;

  top: 15px;
  left: 18px;

  font-size: 1.7rem;

  cursor: pointer;

}

.random-result img {

  width: 100%;

  height: 240px;

  object-fit: cover;

  border-radius: 20px;

  margin-bottom: 18px;

}

.spinner-container {

  text-align: center;

  padding: 40px 0;

}

.spinner {

  width: 60px;
  height: 60px;

  border: 6px solid #ffe1c2;

  border-top: 6px solid #ff7b00;

  border-radius: 50%;

  margin: auto;

  animation: spin 1s linear infinite;

}

.members-list {

  display: flex;

  gap: 10px;

  flex-wrap: wrap;

  margin: 20px 0;

}

.member-btn {

  border: none;

  background: #ffe9c7;

  padding: 12px 16px;

  border-radius: 100px;

  cursor: pointer;

  font-family: inherit;

}

.custom-member {

  display: flex;

  gap: 10px;

}

.custom-member input {

  flex: 1;

  border: 2px solid #eee;

  border-radius: 14px;

  padding: 12px;

  font-family: inherit;

}

.custom-member button {

  border: none;

  background: var(--secondary);

  color: white;

  border-radius: 14px;

  padding: 12px 18px;

  cursor: pointer;

  font-family: inherit;

}

.hidden {

  display: none;

}

@keyframes spin {

  to {
    transform: rotate(360deg);
  }

}

@keyframes fadeIn {

  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }

}

@media(max-width:768px) {

  .food-image {

    height: 150px;

  }

}
