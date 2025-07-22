import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
import { getTheme } from "./theme";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import GlobalSnackbar from "./components/GlobalSnackbar";
import LoadingBackdrop from "./components/LoadingBackdrop";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  SnackbarContext,
  SnackbarState,
  SnackbarSeverity,
} from "./context/SnackbarContext";
import bgImage from "./assets/logokit/fs-bkg-1440.png";

function App() {
  const theme = getTheme("light"); // or "dark" if you want dark mode
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const showMessage = (message: string, severity: SnackbarSeverity = "info") =>
    setSnackbar({ open: true, message, severity });
  const handleClose = () => setSnackbar((s) => ({ ...s, open: false }));
  return (
    <ThemeProvider theme={theme}>
      {/* Blurry background image */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          background: `url(${bgImage}) center center / cover no-repeat`,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(24,28,34,0.60)",
            backdropFilter: "blur(1px)",
            zIndex: 1,
          },
        }}
      />
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <SnackbarContext.Provider value={{ showMessage }}>
          <Router>
            <Navbar />
            <AppRoutes snackbar={snackbar} handleClose={handleClose} />
            <Footer />
          </Router>
        </SnackbarContext.Provider>
      </Box>
    </ThemeProvider>
  );
}

export default App;

interface AppRoutesProps {
  snackbar: SnackbarState;
  handleClose: () => void;
}

function AppRoutes({ snackbar, handleClose }: AppRoutesProps) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400); // Simulate loading for demo
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <LoadingBackdrop open={loading} />
      <GlobalSnackbar {...snackbar} onClose={handleClose} />
      {location.pathname === "/dashboard" ? (
        <Box sx={{ width: "100%", px: { xs: 0, sm: 4 }, py: { xs: 0, sm: 2 } }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      ) : (
        <Container
          maxWidth="sm"
          sx={{ mt: { xs: 2, sm: 8 }, px: { xs: 0, sm: 2 } }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      )}
    </>
  );
}

function AnimatedRoutes({ snackbar, handleClose }: AppRoutesProps) {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
