# 🌾 Smart Yield Predictor

An AI-based web app that predicts crop yield using soil, weather, and farming inputs.

---

## 🚀 Overview

* Takes user inputs (crop, soil, temperature, rainfall, NPK, pH)
* Sends data to backend (FastAPI)
* Predicts yield (kg/hectare)
* Works offline with fallback estimation

---

## 🧠 Features

* Modern interactive UI
* AI-based prediction
* Dataset-driven backend
* Offline fallback mode
* History tracking & insights

---

## 🏗️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Python (FastAPI)
* **Dataset:** CSV

---

## ⚙️ Setup

### Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Run Frontend

Open:

```bash
index.html
```

---

## 📊 Inputs

Temperature, Rainfall, Soil pH, NPK, Soil Type, Irrigation, Season, Crop

---

## 📌 Note

Start backend for accurate results. Otherwise, app uses offline prediction.

---

## 👨‍💻 Author

Umagauri Tammewar
