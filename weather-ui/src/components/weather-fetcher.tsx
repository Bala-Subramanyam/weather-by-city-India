import React, { useState, useEffect } from "react";
import { fetchWeatherApi } from "openmeteo";
import { Sun, Cloud, Snowflake } from "lucide-react";

interface WeatherData {
  temperature_2m: number[];
  time: Date[];
}

interface WeatherFetcherProps {
  latitude: number;
  longitude: number;
  section: "now" | "forecast"; // New prop to determine section
}

export const WeatherFetcher: React.FC<WeatherFetcherProps> = ({ latitude, longitude, section }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const params = {
          latitude,
          longitude,
          hourly: "temperature_2m",
        };

        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];

        const hourly = response.hourly();
        if (!hourly) {
          throw new Error("Hourly data is missing");
        }

        const temperatureArray = hourly.variables(0)?.valuesArray();
        const utcOffsetSeconds = response.utcOffsetSeconds();

        if (!temperatureArray) {
          throw new Error("Temperature data not found");
        }

        const start = Number(hourly.time());
        const end = Number(hourly.timeEnd());
        const interval = hourly.interval();

        const timeArray = [...Array((end - start) / interval)].map((_, i) => {
          const timestamp = start + i * interval + utcOffsetSeconds;
          return new Date(timestamp * 1000);
        });

        const weather: WeatherData = {
          temperature_2m: Array.from(temperatureArray),
          time: timeArray,
        };

        setWeatherData(weather);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weather data.");
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (loading) return <div className="text-center text-gray-600">Loading weather data...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  const getWeatherIcon = (temp: number) => {
    if (temp >= 30) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (temp >= 20 && temp < 30) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <Snowflake className="w-6 h-6 text-blue-500" />;
  };

  const now = new Date("2025-08-29T11:59:00+05:30"); // Current time in IST
  const currentIndex = weatherData?.time.findIndex((time) => 
    Math.abs(time.getTime() - now.getTime()) < 30 * 60 * 1000
  ) ?? 0;
  const currentTemp = weatherData?.temperature_2m[currentIndex];

  if (section === "now") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Weather Now</h3>
        {currentTemp && (
          <>
            <p className="text-2xl font-bold text-blue-700">{currentTemp.toFixed(2)}°C</p>
            {getWeatherIcon(currentTemp)}
            <p className="text-sm text-gray-600">As of {weatherData?.time[currentIndex].toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          </>
        )}
      </div>
    );
  }

  if (section === "forecast") {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Forecast</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">Day</th>
                <th className="p-2 border-b">Time</th>
                <th className="p-2 border-b">Temp (°C)</th>
              </tr>
            </thead>
            <tbody>
              {weatherData?.time.map((time, index) => {
                const day = time.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
                const previousDay = index > 0 ? weatherData.time[index - 1].toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }) : null;
                const showDay = !previousDay || day !== previousDay; // Show day only if it changes
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{showDay ? day : ""}</td>
                    <td className="p-2 border-b">{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</td>
                    <td className="p-2 border-b flex items-center gap-2">
                      {weatherData.temperature_2m[index].toFixed(1)}
                      {getWeatherIcon(weatherData.temperature_2m[index])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null; // Fallback
}