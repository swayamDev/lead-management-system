"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerDesk01Icon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
  { value: "system", label: "System", icon: ComputerDesk01Icon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoids a hydration mismatch: the server doesn't know the user's
  // system/stored preference, so render a neutral icon until mounted.
  const [mounted, setMounted] = useState(false);
  // Standard next-themes hydration guard: server can't know the client's
  // stored/system preference, so we defer showing it by one tick after
  // mount (the resulting one-frame icon swap is intentional, not a bug).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const current = options.find((o) => o.value === theme) ?? options[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <HugeiconsIcon icon={mounted ? current.icon : Sun01Icon} size={16} />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
            <HugeiconsIcon icon={option.icon} size={16} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
