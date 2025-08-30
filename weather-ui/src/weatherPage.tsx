import { useState } from "react";
import { StateSelector } from "./components/state-selector";
import { CitySelector } from "./components/city-selector";
import { WeatherFetcher } from "./components/weather-fetcher";
import type { Location } from "./data/states_by_cc2";

export function WeatherApp() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; long: number } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">🌡️ Weather App</h1>
          <p className="text-gray-600 text-sm">Get real-time weather information for cities across India</p>
        </div>

        <div className="space-y-8 sm:space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">📍 Select Location</label>
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">State / Union Territory</label>
                <StateSelector onSelect={setSelectedLocation} />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">City</label>
                <CitySelector
                  cc2={selectedLocation?.cc2 ?? null}
                  disabled={!selectedLocation}
                  onSelect={(lat, long) => {
                    setSelectedCoordinates({ lat, long });
                  }}
                />
              </div>
            </div>
          </div>

          {selectedCoordinates && (
            <WeatherFetcher
              latitude={selectedCoordinates.lat}
              longitude={selectedCoordinates.long}
            />
          )}
        </div>
      </div>
    </div>
  );
}