import React, { useState, useEffect } from "react";
import { Sun, Cloud, Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherData {
  temperature_2m: number[];
  time: Date[];
}

interface WeatherFetcherProps {
  latitude: number;
  longitude: number;
}

interface DayGroup {
  dayName: string;
  date: string;
  hours: { time: Date; temp: number }[];
}

export const WeatherFetcher: React.FC<WeatherFetcherProps> = ({
  latitude,
  longitude,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current_weather=true&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const weather: WeatherData = {
          temperature_2m: data.hourly.temperature_2m,
          time: data.hourly.time.map((t: string) => new Date(t)),
        };

        setWeatherData(weather);
        setCurrentTemp(data.current_weather.temperature);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weather data.");
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (loading)
    return <div className="text-center text-gray-600">Loading weather data...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  const getWeatherIcon = (temp: number) => {
    if (temp >= 30) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (temp >= 20 && temp < 30) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <Snowflake className="w-6 h-6 text-blue-500" />;
  };

  // Group data by day, starting from *today* only
  const groupByDay = () => {
    if (!weatherData) return [];
    const groups: DayGroup[] = [];
    const now = new Date();

    const todayDate = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

    let currentGroup: DayGroup | null = null;

    weatherData.time.forEach((time, index) => {
      const date = time.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      // Skip hours before "now"
      if (time < now) return;

      const weekday = time.toLocaleDateString("en-IN", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      });

      let dayName = date === todayDate ? `Today (${weekday})` : weekday;

      if (!currentGroup || currentGroup.date !== date) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { dayName, date, hours: [] };
      }

      currentGroup.hours.push({
        time,
        temp: weatherData.temperature_2m[index],
      });
    });

    if (currentGroup) groups.push(currentGroup);

    return groups.slice(0, 7);
  };

  const dayGroups = groupByDay();

  return (
    <div className="mt-6">
      {/* Current Weather Card */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Weather</h3>
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
          <div className="flex justify-center my-2">
            {currentTemp !== null && getWeatherIcon(currentTemp)}
          </div>
          <p className="text-lg font-medium text-blue-700">
            {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "--"}
          </p>
        </CardContent>
      </Card>

      {/* Forecast */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Forecast</h3>
      <div className="space-y-6">
        {dayGroups.map((group) => (
          <div key={group.date} className="mb-4">
            <div className="w-full items-center text-center flex-shrink-0 pl-2 pr-2 pt-2 text-lg font-bold text-gray-700">
              {group.dayName}
              <div className="text-xs text-gray-500">{group.date}</div>
            </div>
            <br />
            <div className="flex items-start gap-4">
              <div className="flex overflow-x-auto gap-4 pb-2">
                {group.hours.map((hour, hourIndex) => (
                  <Card
                    key={`${group.date}-${hourIndex}`}
                    className="min-w-[100px] sm:min-w-[120px]"
                  >
                    <CardContent className=" text-center">
                      <p className="text-sm text-gray-600">
                        {hour.time.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                      <div className="flex justify-center my-2">
                        {getWeatherIcon(hour.temp)}
                      </div>
                      <p className="text-lg font-medium text-blue-700">
                        {hour.temp.toFixed(1)}°C
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
