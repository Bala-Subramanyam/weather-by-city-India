import { useState } from "react";
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
import type { Location } from "../data/states_by_cc2";
import {  locations } from "../data/states_by_cc2";

interface Props {
  onSelect: (location: Location) => void;
}

export function StateSelector({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [search, setSearch] = useState("");

  const filtered = locations.sort((a, b) => {
    const aMatch = a.ascii_name.toLowerCase().startsWith(search.toLowerCase());
    const bMatch = b.ascii_name.toLowerCase().startsWith(search.toLowerCase());
    if (aMatch === bMatch) return a.ascii_name.localeCompare(b.ascii_name);
    return aMatch ? -1 : 1;
  });

  const handleSelect = (location: Location) => {
    setSelected(location);
    setOpen(false);
    setSearch("");
    onSelect(location);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          readOnly
          value={
            selected ? `${selected.ascii_name} (${selected.type})` : ""
          }
          placeholder="Select a State or Union Territory"
          onClick={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            {filtered.map((loc) => (
              <CommandItem key={loc.cc2} onSelect={() => handleSelect(loc)}>
                <div className="flex flex-col">
                  <span>{loc.ascii_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {loc.type}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
