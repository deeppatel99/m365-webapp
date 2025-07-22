import { createTheme, Theme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark" = "dark"): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#34af45",
        contrastText: "#fff",
      },
      secondary: {
        main: "#60a5fa",
        contrastText: "#fff",
      },
      background: {
        default: mode === "dark" ? "#181a1b" : "#f4f6fa",
        paper: mode === "dark" ? "#23272a" : "#fff",
      },
      text: {
        primary: mode === "dark" ? "#e0e7ef" : "#23272a",
        secondary: mode === "dark" ? "#bdbdbd" : "#42474c",
      },
    },
    typography: {
      fontFamily: "Nunito, Nunito Sans, sans-serif",
      fontWeightRegular: 400,
      fontWeightBold: 700,
      h5: { fontWeight: 700, letterSpacing: 0.5 },
      h6: { fontWeight: 600, letterSpacing: 0.3 },
      button: { fontWeight: 700, letterSpacing: 0.5 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(52,175,69,0.10)",
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            background: mode === "dark" ? "#23272a" : "#fff",
            borderRadius: 8,
          },
        },
      },
    },
  });
