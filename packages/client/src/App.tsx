// ──────────────────────────────────────────────
// App: Root component with layout
// ──────────────────────────────────────────────
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { ModalRenderer } from "./components/layout/ModalRenderer";
import { CustomThemeInjector } from "./components/layout/CustomThemeInjector";
import { Toaster } from "sonner";
import { useUIStore } from "./stores/ui.store";
import { api } from "./lib/api-client";

export function App() {
  const theme = useUIStore((s) => s.theme);
  const fontSize = useUIStore((s) => s.fontSize);
  const visualTheme = useUIStore((s) => s.visualTheme);
  const fontFamily = useUIStore((s) => s.fontFamily);

  // Apply theme + font size to the document root whenever they change
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Apply visual theme (default / sillytavern) to the document root
  useEffect(() => {
    if (visualTheme && visualTheme !== "default") {
      document.documentElement.dataset.visualTheme = visualTheme;
    } else {
      delete document.documentElement.dataset.visualTheme;
    }
  }, [visualTheme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Apply custom font family via CSS variable
  useEffect(() => {
    if (fontFamily) {
      document.documentElement.style.setProperty("--font-user", `"${fontFamily}"`);
    } else {
      document.documentElement.style.removeProperty("--font-user");
    }
  }, [fontFamily]);

  // Pre-load custom fonts at startup so switching to Appearance tab doesn't cause a flash
  const { data: customFonts } = useQuery<{ filename: string; family: string; url: string }[]>({
    queryKey: ["custom-fonts"],
    queryFn: () => api.get("/fonts"),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!customFonts?.length) return;
    const id = "marinara-custom-fonts";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = customFonts
      .map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.url}"); font-display: swap; }`)
      .join("\n");
  }, [customFonts]);

  return (
    <>
      <CustomThemeInjector />
      <AppShell />
      <ModalRenderer />
      <Toaster
        position="bottom-right"
        theme={theme}
        closeButton
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            userSelect: "text",
            WebkitUserSelect: "text",
          },
        }}
      />
    </>
  );
}
