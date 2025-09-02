import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper to get the current date and time ---
const getCurrentDateTime = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = now.toLocaleDateString("en-IN", options);
  const time = now.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `${date} | ${time}`;
};

// --- Weather video mappings ---
const weatherVideos = {
  clear: "./assets/Generating_Video_of_Skies_and_Birds.mp4",
  clouds: "./assets/Cloudy_Sky_Video_Generation.mp4",
  rain: "./assets/Generating_Rainy_Cloud_Video.mp4",
  snow: "./assets/Snowfall_Video_Generation.mp4",
  thunderstorm: "./assets/Thunderstorm_Video_Generation.mp4",
  mist: "./assets/Generating_Fog_and_Mist_Video.mp4",
  default: "./assets/Generating_Video_of_Skies_and_Birds.mp4",
};

// --- VIDEO BACKGROUND COMPONENT ---
const VideoBackground = ({ weather }) => {
  const [videoSrc, setVideoSrc] = useState(weatherVideos.default);
  const [videoError, setVideoError] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const mainWeather = weather ? weather.toLowerCase() : "default";
    let src = weatherVideos.default;

    if (mainWeather.includes("clear")) src = weatherVideos.clear;
    else if (mainWeather.includes("clouds")) src = weatherVideos.clouds;
    else if (mainWeather.includes("rain") || mainWeather.includes("drizzle"))
      src = weatherVideos.rain;
    else if (mainWeather.includes("snow") || mainWeather.includes("sleet"))
      src = weatherVideos.snow;
    else if (mainWeather.includes("thunderstorm"))
      src = weatherVideos.thunderstorm;
    else if (
      [
        "mist",
        "smoke",
        "haze",
        "dust",
        "fog",
        "sand",
        "ash",
        "squall",
        "tornado",
      ].some((w) => mainWeather.includes(w))
    )
      src = weatherVideos.mist;

    setVideoSrc(src);
  }, [weather]);

  // Using the key attribute forces React to re-mount the video component when the src changes,
  // which ensures the new video loads and plays.
  useEffect(() => {
    if (videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current.load();
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setVideoError(false);
              })
              .catch((error) => {
                console.error("Error playing video:", error);
                setVideoError(true);
              });
          }
        } catch (error) {
          console.error("Error loading video:", error);
          setVideoError(true);
        }
      };

      playVideo();
    }
  }, [videoSrc]);

  const handleVideoError = (e) => {
    console.error("Video error event:", e);
    if (e.target && e.target.error) {
      console.error("Video playback error:", {
        code: e.target.error.code,
        message: e.target.error.message,
        source: videoSrc,
      });
      setVideoError(true);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setVideoError(false);
        })
        .catch((error) => {
          console.error("Error playing video after load:", error);
          setVideoError(true);
        });
    }
  };

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        key={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        onClick={() => videoRef.current?.play()}
        className="video-background"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {videoError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="video-error"
        >
          Error loading video: {videoSrc}
        </motion.div>
      )}

      <div className="video-overlay"></div>
    </div>
  );
};

// --- APP COMPONENT ---
function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState("default");
  const [dateTime, setDateTime] = useState(getCurrentDateTime());

  // IMPORTANT: Replace with your actual API key from OpenWeatherMap
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // <-- PASTE YOUR API KEY HERE

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = useCallback(async () => {
    if (!city.trim()) return;

    setWeatherData(null);
    setError(null);
    setLoading(true);

    try {
      if (!API_KEY) {
        throw new Error("Weather API key is missing.");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        const message =
          response.status === 404
            ? "City not found."
            : "Could not fetch weather data.";
        throw new Error(message);
      }

      const data = await response.json();
      setWeatherData(data);
      setCurrentWeather(data.weather[0].main);
    } catch (err) {
      setError(err.message);
      setCurrentWeather("default");
    } finally {
      setLoading(false);
    }
  }, [city, API_KEY]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const renderWeatherDetails = () => {
    if (loading) return <div className="loading">Fetching weather...</div>;
    if (error) return <div className="error">{error}</div>;
    if (weatherData) {
      const {
        name,
        sys: { country },
        main,
        weather,
        wind,
      } = weatherData;
      return (
        <div className="weather-details">
          <h2>
            {name}, {country}
          </h2>
          <p className="date-time">{dateTime}</p>
          <div className="temperature">
            <h3>{Math.round(main.temp)}°C</h3>
            <img
              src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
              alt={weather[0].description}
            />
          </div>
          <div className="weather-info">
            <p>
              <span>Feels Like</span>{" "}
              <span>{Math.round(main.feels_like)}°C</span>
            </p>
            <p>
              <span>Humidity</span> <span>{main.humidity}%</span>
            </p>
            <p>
              <span>Weather</span> <span>{weather[0].description}</span>
            </p>
            <p>
              <span>Wind</span> <span>{wind.speed} m/s</span>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="initial-prompt">Enter a city to see the weather.</div>
    );
  };

  return (
    <>
      <VideoBackground weather={currentWeather} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="app"
      >
        <motion.div
          className="container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
            <button type="submit">Get Weather</button>
          </form>
          {renderWeatherDetails()}
        </motion.div>
      </motion.div>
      <GlobalStyles />
    </>
  );
}

// --- STYLES COMPONENT (MODIFIED) ---
const GlobalStyles = () => {
  // REMOVED the old background-image styles from .app and the .clear, .cloudy, etc. classes
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background: #000;
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.6;
    }

    #root {
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }
    
    .video-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;
        overflow: hidden;
        background: black;
    }

    .video-background {
        position: absolute;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        object-position: center;
        z-index: -1;
        left: 0;
        top: 0;
    }

    .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1;
    }

    .video-error {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 1rem;
        border-radius: 8px;
        z-index: 2;
    }

    .app { 
        min-height: 100vh; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        padding: 1rem; 
        color: #fff;
        position: relative;
        z-index: 2;
    }
    .container { 
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 24px;
        padding: 35px;
        width: 100%;
        max-width: 500px;
        z-index: 2;
        position: relative;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        transform-style: preserve-3d;
        perspective: 1000px;
    }

    .search-form {
        display: flex;
        margin-bottom: 25px;
        gap: 10px;
        padding: 5px;
        position: relative;
        transition: transform 0.3s ease;
    }

    .search-form:hover {
        transform: translateY(-2px);
    }

    .search-form input {
        flex-grow: 1;
        padding: 15px 20px;
        font-size: 16px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .search-form input::placeholder {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 300;
    }

    .search-form input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
    }

    .search-form button {
        padding: 15px 30px;
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-size: 14px;
    }

    .search-form button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .search-form button:active {
        transform: translateY(0);
    }
    .weather-details {
        text-align: center;
        color: white;
        animation: fadeIn 0.5s ease-out;
    }

    .weather-details h2 {
        font-size: 2.5rem;
        margin-bottom: 5px;
        font-weight: 300;
        text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .date-time {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 25px;
        font-weight: 300;
        letter-spacing: 1px;
    }

    .temperature {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 25px 0;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(5px);
    }

    .temperature h3 {
        font-size: 4.5rem;
        font-weight: 200;
        margin-right: 20px;
        text-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
    }

    .temperature img {
        width: 100px;
        height: 100px;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
    }

    .weather-info {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 25px;
        margin-top: 25px;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .weather-info p {
        margin: 15px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .weather-info p:last-child {
        border-bottom: none;
    }

    .weather-info p span:first-child {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 300;
    }

    .weather-info p span:last-child {
        font-weight: 500;
        text-transform: capitalize;
        color: rgba(255, 255, 255, 0.9);
    }

    .loading, .error, .initial-prompt {
        text-align: center;
        font-size: 18px;
        padding: 2rem 0;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 300;
        letter-spacing: 0.5px;
    }

    .error {
        color: rgba(255, 99, 71, 0.9);
        font-weight: 400;
    }

    .initial-prompt {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.7);
    }
    @media (max-width: 600px) {
      .container { padding: 20px; }
      .search-form { flex-direction: column; }
      .search-form input, .search-form button { width: 100%; border-radius: 10px; }
      .search-form input { margin-bottom: 10px; }
      .temperature h3 { font-size: 3rem; }
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [styles]);

  return null;
};

export default App;
