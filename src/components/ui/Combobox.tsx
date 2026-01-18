
import React, { useState } from "react";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxItem {
  value: string;
  label: string;
}

interface ExampleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  items: ComboboxItem[];
}

export function ExampleCombobox({ value, onChange, items }: ExampleComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    // If clicking the same value, clear it, otherwise set the new value
    const newValue = selectedValue === value ? "" : selectedValue;
    onChange(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 text-sm"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : "Select category..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search category..." className="h-8" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => handleSelect(item.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
