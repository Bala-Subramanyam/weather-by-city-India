import { useEffect, useState, useMemo } from "react";
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
import { Loader2 } from "lucide-react"; // 👈 Lucide spinner

interface City {
  name: string;
  cc2: string;
  latitude: number;
  longitude: number;
}

interface Props {
  cc2: string | null;
  onSelect: (lat: number, long: number) => void;
  disabled?: boolean;
}

export function CitySelector({ cc2, onSelect, disabled = false }: Props) {
  const [cities, setCities] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);

  // Load city data when cc2 changes
  useEffect(() => {
    if (!cc2) {
      setCities([]);
      setSelectedCity(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCities = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/data/cities_by_cc2/${cc2}.json`, { signal });
        if (!res.ok) throw new Error("Failed to fetch city data");

        const data: City[] = await res.json();
        const sorted = data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setCities(sorted);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Request was aborted
        }
        console.error("Error loading cities:", error);
        setCities([]);
      } finally {
        setSelectedCity(null);
        setLoading(false);
      }
    };

    fetchCities();

    return () => {
      controller.abort(); // Cancel fetch on unmount or cc2 change
    };
  }, [cc2]);

  // Filter cities
  const filteredCities = useMemo(() => {
    if (!search) return cities.slice(0, 10);
    const lowerSearch = search.toLowerCase();
    return cities
      .filter((city) => city.name.toLowerCase().startsWith(lowerSearch))
      .slice(0, 10);
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
        if (!disabled && !loading) setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={selectedCity ? capitalizeFirstLetter(selectedCity.name) : ""}
            placeholder={
              disabled
                ? "Select a state first"
                : loading
                ? "Loading cities..."
                : "Select a city"
            }
            onClick={() => {
              if (!disabled && !loading) setOpen(true);
            }}
            disabled={disabled || loading}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search cities..."
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
                  key={`${city.name}-${city.latitude}-${city.longitude}`}
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

// Capitalize city name
const capitalizeFirstLetter = (cityName: string) =>
  cityName.charAt(0).toUpperCase() + cityName.slice(1);
