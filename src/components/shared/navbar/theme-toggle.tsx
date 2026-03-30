"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

import { useTheme } from "../theme-provider";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">
        Switch to {isDark ? "light" : "dark"} mode
      </span>
    </Button>
  );
}

export { ThemeToggle };
