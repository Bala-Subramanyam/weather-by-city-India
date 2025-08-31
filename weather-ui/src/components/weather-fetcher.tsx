import React, { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  ThermometerSun,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherData {
  temperature_2m: number[];
  weathercode: number[];
  time: Date[];
}

interface WeatherFetcherProps {
  latitude: number;
  longitude: number;
}

interface HourData {
  time: Date;
  temp: number;
  weathercode: number;
}

interface DayGroup {
  dayName: string;
  date: string;
  hours: HourData[];
}

export const WeatherFetcher: React.FC<WeatherFetcherProps> = ({
  latitude,
  longitude,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [currentWeatherCode, setCurrentWeatherCode] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&current_weather=true&timezone=Asia/Kolkata`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data.hourly?.temperature_2m ||
          !data.hourly?.weathercode ||
          !data.hourly?.time
        ) {
          throw new Error("Incomplete weather data received from API.");
        }

        if (
          data.hourly.temperature_2m.length !==
            data.hourly.weathercode.length ||
          data.hourly.temperature_2m.length !== data.hourly.time.length
        ) {
          throw new Error("Mismatch in weather data array lengths.");
        }

        const weather: WeatherData = {
          temperature_2m: data.hourly.temperature_2m,
          weathercode: data.hourly.weathercode,
          time: data.hourly.time.map((t: string) => new Date(t)),
        };

        setWeatherData(weather);
        setCurrentTemp(data.current_weather?.temperature ?? null);
        setCurrentWeatherCode(data.current_weather?.weathercode ?? null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Weather fetch error:", err);
          setError("Failed to fetch weather data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [latitude, longitude]);

  const getWeatherDetails = (weathercode: number, temp?: number) => {
    const isHot = temp !== undefined && temp >= 35;
    if (isHot && [0, 1, 2, 3].includes(weathercode)) {
      return {
        condition: "Hot",
        icon: <ThermometerSun className="w-8 h-8 text-red-600" />,
      };
    }

    switch (weathercode) {
      case 0:
        return {
          condition: "Clear Sky",
          icon: <Sun className="w-8 h-8 text-yellow-500" />,
        };
      case 1:
        return {
          condition: "Mainly Clear",
          icon: <Sun className="w-8 h-8 text-yellow-400" />,
        };
      case 2:
        return {
          condition: "Partly Cloudy",
          icon: <Cloud className="w-8 h-8 text-gray-500" />,
        };
      case 3:
        return {
          condition: "Overcast",
          icon: <Cloud className="w-8 h-8 text-gray-600" />,
        };
      case 45:
      case 48:
        return {
          condition: "Fog",
          icon: <Cloud className="w-8 h-8 text-gray-400" />,
        };
      case 51:
      case 53:
      case 55:
        return {
          condition: "Drizzle",
          icon: <CloudRain className="w-8 h-8 text-blue-400" />,
        };
      case 61:
      case 63:
        return {
          condition: "Rain",
          icon: <CloudRain className="w-8 h-8 text-blue-600" />,
        };
      case 65:
        return {
          condition: "Monsoon Rain",
          icon: <CloudRain className="w-8 h-8 text-blue-800" />,
        };
      case 71:
      case 73:
      case 75:
        return {
          condition: "Snow",
          icon: <Snowflake className="w-8 h-8 text-blue-500" />,
        };
      case 80:
        return {
          condition: "Rain Showers",
          icon: <CloudRain className="w-8 h-8 text-blue-500" />,
        };
      case 95:
        return {
          condition: "Thunderstorm",
          icon: <CloudLightning className="w-8 h-8 text-purple-500" />,
        };
      default:
        return {
          condition: `Unknown (Code ${weathercode})`,
          icon: <Cloud className="w-8 h-8 text-gray-500" />,
        };
    }
  };

  const formatTime = (date: Date) =>
    isNaN(date.getTime())
      ? "--:--"
      : date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        });

  const dayGroups = useMemo(() => {
    if (!weatherData) return [];

    const groups: DayGroup[] = [];
    const now = new Date();

    const todayDate = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    let currentGroup: DayGroup | null = null;

    weatherData.time.forEach((time, index) => {
      const date = time.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      const weekday = time.toLocaleDateString("en-IN", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      });
      const dayName = date === todayDate ? `Today (${weekday})` : weekday;

      if (!currentGroup || currentGroup.date !== date) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { dayName, date, hours: [] };
      }

      currentGroup.hours.push({
        time,
        temp: weatherData.temperature_2m[index],
        weathercode: weatherData.weathercode[index],
      });
    });

    if (currentGroup) groups.push(currentGroup);

    return groups.slice(0, 7); // Limit to 7 days
  }, [weatherData]);

  // Logging Monday's weather codes (optional debug info)
  useEffect(() => {
    if (!weatherData) return;

    const mondayCodes: number[] = [];

    weatherData.time.forEach((time, index) => {
      const weekday = time.toLocaleDateString("en-IN", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      });
      if (weekday === "Monday") {
        mondayCodes.push(weatherData.weathercode[index]);
      }
    });

    if (mondayCodes.length > 0) {
      console.log("Monday weather codes:", mondayCodes);
    }
  }, [weatherData]);

  if (loading)
    return (
      <div className="text-center text-gray-600">Loading weather data...</div>
    );

  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="mt-6 mx-auto max-w-4xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Current Weather
      </h3>
      <Card className="mb-6">
        <CardContent className="p-4 text-center">
          <p className="text-lg font-medium text-gray-600">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}{" "}
            –{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Kolkata",
            })}
          </p>
          <div className="flex justify-center my-2 min-h-[32px]">
            {currentWeatherCode !== null && currentTemp !== null ? (
              getWeatherDetails(currentWeatherCode, currentTemp).icon
            ) : (
              <Cloud className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <p className="text-lg font-medium text-blue-700">
            {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "--"}
          </p>
          <p className="text-sm font-medium text-gray-600">
            {currentWeatherCode !== null && currentTemp !== null
              ? getWeatherDetails(currentWeatherCode, currentTemp).condition
              : "--"}
          </p>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-gray-500 italic mt-1">
        *Note: Current weather is the latest observed condition, while hourly
        forecasts are predicted values updated hourly. Small differences can
        occur between them.
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Weather Forecast
      </h3>
      <div className="space-y-6">
        {dayGroups.length === 0 ? (
          <div className="text-center text-gray-600">
            No forecast data available.
          </div>
        ) : (
          dayGroups.map(({ dayName, date, hours }) => (
            <div key={date} className="mb-4">
              <div className="w-full text-center px-2 pt-2 text-lg font-bold text-gray-700">
                {dayName}
                <div className="text-xs text-gray-500">{date}</div>
              </div>
              <br />
              <div className="flex items-start gap-4 overflow-x-auto pb-2">
                {hours.map(({ time, temp, weathercode }) => (
                  <Card
                    key={`${date}-${time.toISOString()}`}
                    className="min-w-[100px] sm:min-w-[120px] bg-white"
                  >
                    <CardContent className="text-center p-3">
                      <p className="text-sm font-medium text-gray-600">
                        {formatTime(time)}
                      </p>
                      <div className="flex justify-center my-2 min-h-[32px]">
                        {getWeatherDetails(weathercode, temp).icon}
                      </div>
                      <p className="text-lg font-medium text-blue-700">
                        {temp.toFixed(1)}°C
                      </p>
                      <p className="text-sm font-medium text-gray-600 min-h-[20px]">
                        {getWeatherDetails(weathercode, temp).condition}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
