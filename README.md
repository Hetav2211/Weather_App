# ⛅ Weather App

A fast and responsive frontend weather application that fetches real-time weather data from a public Weather API. Built with React and Vite, it supports searching by city, geolocation-based weather, unit toggling (°C).

<div align="center">
  
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=000&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=fff&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=000&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff&style=for-the-badge)
![OpenWeather](https://img.shields.io/badge/API-OpenWeatherMap-ef6c00?style=for-the-badge)
  
</div>

**🔗 Live Demo:** [Weather-App](https://weatherapp-hkp.netlify.app/)

---

## 🌟 Features

- 🔍 City search with debounced input
- 📍 Use current location (Geolocation API)
- 🖼️ Dynamic weather icons and background states
---

## 🧰 Tech Stack

- React 18 + Vite
- CSS Modules or plain CSS
- Fetch API or Axios
- OpenWeatherMap API (Current + Forecast)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 8+ (or pnpm/yarn)
- An API Key from OpenWeatherMap (free): create at https://home.openweathermap.org/users/sign_up

### 1) Clone and install
```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
npm install
```

### 2) Environment variables
Create a `.env` file in the project root:

```env
# Vite requires variables to start with VITE_
VITE_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
```

### 3) Run the app
```bash
npm run dev
```
Open the local URL printed in your terminal (usually http://localhost:5173).

### 4) Build for production
```bash
npm run build
npm run preview
```

---

---

## 🖼️ Screenshots

<p align="center">
  <img src="./assets/image1.png" alt="Homepage" width="85%" />
</p>

<p align="center">
  <img src="./assets/image2.png" alt="Homepage" width="85%" />
</p>

---
