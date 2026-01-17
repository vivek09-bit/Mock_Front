import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const apiBase = import.meta.env.VITE_BACKEND || "";

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, apiBase }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
