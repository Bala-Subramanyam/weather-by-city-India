import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

interface City {
  name: string;
  cc2: string;
  latitude: number;
  longitude: number;
}

interface Props {
  cc2: string | null; // cc2 code to load city data for
  onSelect: (lat: number, long: number) => void; // callback on city select
  disabled?: boolean; // disable dropdown when no cc2 selected
}

export function CitySelector({ cc2, onSelect, disabled = false }: Props) {
  const [cities, setCities] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);

  // Load city data on cc2 change
  useEffect(() => {
    if (!cc2) {
      setCities([]);
      setSelectedCity(null);
      return;
    }
    const url = `/data/cities_by_cc2/${cc2}.json`;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch city data");
        return res.json();
      })
      .then((data: City[]) => {
        const sorted = data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setCities(sorted);
        setSelectedCity(null);
        setLoading(false);
      })
      .catch(() => {
        setCities([]);
        setSelectedCity(null);
        setLoading(false);
      });
  }, [cc2]);

  // Filter cities based on search, showing top 10 starting with search text
  const filteredCities = React.useMemo(() => {
    if (!search) {
      return cities.slice(0, 10);
    }
    const lowerSearch = search.toLowerCase();
    const filtered = cities.filter((city) =>
      city.name.toLowerCase().startsWith(lowerSearch)
    );
    return filtered.slice(0, 10);
  }, [cities, search]);

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    setOpen(false);
    setSearch("");
    onSelect(city.latitude, city.longitude);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!disabled) setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Input
          readOnly
          value={selectedCity ? capitalizeFirstLetter(selectedCity.name) : ""}
          placeholder={disabled ? "Select a state first" : "Select a city"}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
          disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={loading ? "Loading cities..." : "Search cities..."}
            value={search}
            onValueChange={setSearch}
            disabled={loading || disabled}
            autoFocus
          />
          <CommandList>
            {loading && <CommandEmpty>Loading cities...</CommandEmpty>}
            {!loading && filteredCities.length === 0 && (
              <CommandEmpty>No cities found.</CommandEmpty>
            )}
            {!loading &&
              filteredCities.map((city) => (
                <CommandItem
                  key={`${city.name}-${city.latitude}-${city.longitude}`} // Unique key
                  onSelect={() => handleSelect(city)}
                  className="capitalize"
                >
                  {city.name}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Function to capitalize first letter of the city name
const capitalizeFirstLetter = (cityName: string) => {
  return cityName.charAt(0).toUpperCase() + cityName.slice(1);
};
