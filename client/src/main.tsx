import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/print.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppWrapper() {
  if (PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </ClerkProvider>
    );
  }
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppWrapper />);
