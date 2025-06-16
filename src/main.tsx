import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import "./index.css";
import UserList from "@/pages/UserList";
import Home from "@/pages/Home";
import theme from "@/shared/theme";
import Navbar from "@/widgets/Navbar/ui/Navbar";

const queryClient = new QueryClient()

// eslint-disable-next-line  react-refresh/only-export-components
function App() {
  const location = useLocation();
  const userData = location.state?.userData;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home userData={userData} />} />
        <Route path="/users" element={<UserList />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
  </StrictMode>,
);
