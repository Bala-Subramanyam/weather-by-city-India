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

export const WeatherFetcher: React.FC<WeatherFetcherProps> = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const weather: WeatherData = {
          temperature_2m: data.hourly.temperature_2m,
          time: data.hourly.time.map((t: string) => new Date(t)),
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

  // Group data by day
  const groupByDay = () => {
    if (!weatherData) return [];
    const groups: DayGroup[] = [];
    const now = new Date(); // Use actual current date for grouping
    const todayDate = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

    let currentGroup: DayGroup | null = null;

    weatherData.time.forEach((time, index) => {
      const date = time.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
      const weekday = time.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
      let dayName = weekday;

      if (date === todayDate) {
        dayName = "Saturday";
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
        if (date === tomorrowDate) {
          dayName = "Sunday";
        }
      }

      if (!currentGroup || currentGroup.date !== date) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { dayName, date, hours: [] };
      }

      currentGroup.hours.push({ time, temp: weatherData.temperature_2m[index] });
    });

    if (currentGroup) groups.push(currentGroup);

    return groups.slice(0, 7); // Limit to 7 days
  };

  const dayGroups = groupByDay();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Forecast</h3>
      <div className="space-y-6">
        {dayGroups.map((group, groupIndex) => (
          <div key={group.date} className="flex items-start gap-4">
            <div className="w-25 items-center text-center flex-shrink-0  pl-2 pr-2 pt-2 text-sm font-bold text-gray-700">
              {groupIndex === 0 ? "Saturday" : groupIndex === 1 ? "Sunday" : group.dayName}
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2">
              {group.hours.map((hour, hourIndex) => (
                <Card key={`${group.date}-${hourIndex}`} className="min-w-[100px] sm:min-w-[120px]">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">
                      {hour.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                    </p>
                    <div className="flex justify-center my-2">
                      {getWeatherIcon(hour.temp)}
                    </div>
                    <p className="text-lg font-medium text-blue-700">{hour.temp.toFixed(1)}°C</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
