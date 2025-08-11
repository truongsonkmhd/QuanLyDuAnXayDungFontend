// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";   
import App from "./App";
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>             
      <App />
    </AuthProvider>
  </BrowserRouter>
);
