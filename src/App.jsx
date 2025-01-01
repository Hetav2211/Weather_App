import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './weather-backgrounds.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundClass, setBackgroundClass] = useState('default');
  const [loading, setLoading] = useState(false);

  // Use import.meta.env for Vite environment variables
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Memoized background class determination function
  const getBackgroundClass = useCallback((weatherMain, weatherDescription) => {
    // Convert to lowercase for more flexible matching
    const main = weatherMain.toLowerCase();
    const description = weatherDescription.toLowerCase();

    const weatherConditions = {
      'clear': {
        conditions: ['clear sky', 'sky is clear'],
        class: 'clear'
      },
      'clouds': {
        conditions: [
          'few clouds', 
          'scattered clouds', 
          'broken clouds', 
          'overcast clouds'
        ],
        class: 'cloudy'
      },
      'rain': {
        conditions: [
          'light rain', 
          'moderate rain', 
          'heavy rain', 
          'very heavy rain', 
          'extreme rain'
        ],
        class: 'rainy'
      },
      'drizzle': {
        conditions: [
          'light intensity drizzle', 
          'drizzle', 
          'heavy intensity drizzle'
        ],
        class: 'rainy'
      },
      'snow': {
        conditions: [
          'light snow', 
          'snow', 
          'heavy snow', 
          'sleet', 
          'light shower sleet', 
          'shower sleet'
        ],
        class: 'snowy'
      },
      'thunderstorm': {
        conditions: [
          'thunderstorm', 
          'thunderstorm with light rain', 
          'thunderstorm with rain', 
          'thunderstorm with heavy rain'
        ],
        class: 'thunderstorm'
      },
      'mist': {
        conditions: ['mist', 'fog', 'haze', 'smoke', 'sand'],
        class: 'misty'
      }
    };

    // Find matching condition
    const weatherType = weatherConditions[main];
    if (weatherType) {
      const matchedCondition = weatherType.conditions.find(
        condition => description.includes(condition)
      );

      if (matchedCondition) {
        return weatherType.class;
      }
    }

    return 'default';
  }, []);

  // Memoized weather data fetching function
  const fetchWeatherData = useCallback(async () => {
    if (!city.trim()) return;

    setWeatherData(null);
    setError(null);
    setLoading(true);

    try {
      // Add error handling for missing API key
      if (!API_KEY) {
        throw new Error('Weather API key is missing');
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`, 
        {
          params: {
            q: city,
            appid: API_KEY,
            units: 'metric'
          }
        }
      );

      const { main: weatherMain, description: weatherDescription } = response.data.weather[0];

      setWeatherData(response.data);
      
      const bgClass = getBackgroundClass(weatherMain, weatherDescription);
      setBackgroundClass(bgClass);
      
      setLoading(false);
    } catch (err) {
      console.error('Weather Fetch Error:', err);
      setError(
        err.response 
          ? 'Unable to fetch weather data. Please check the city name.' 
          : err.message
      );
      setLoading(false);
      setBackgroundClass('default');
    }
  }, [city, API_KEY, getBackgroundClass]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  // Render weather details
  const renderWeatherDetails = () => {
    if (loading) {
      return <div className="loading">Loading weather data...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (weatherData) {
      const { 
        name, 
        sys: { country }, 
        main, 
        weather, 
        wind 
      } = weatherData;

      return (
        <div className="weather-details">
          <h2>{name}, {country}</h2>
          
          <div className="temperature">
            <h3>{Math.round(main.temp)}°C</h3>
            <img 
              src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`} 
              alt="Weather Icon" 
            />
          </div>
          
          <div className="weather-info">
            <p>Weather: <span>{weather[0].main}</span></p>
            <p>Description: <span>{weather[0].description}</span></p>
            <p>Feels Like: <span>{Math.round(main.feels_like)}°C</span></p>
            <p>Humidity: <span>{main.humidity}%</span></p>
            <p>Wind Speed: <span>{wind.speed} m/s</span></p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`app ${backgroundClass}`}>
      <div className="container">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            required
          />
          <button type="submit">Get Weather</button>
        </form>

        {renderWeatherDetails()}
      </div>
    </div>
  );
}

export default App;