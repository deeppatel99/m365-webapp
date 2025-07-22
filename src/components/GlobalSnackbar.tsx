import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { SnackbarSeverity } from "../context/SnackbarContext";
import { AlertColor } from "@mui/material/Alert";

interface GlobalSnackbarProps {
  open: boolean;
  message: string;
  severity?: SnackbarSeverity;
  onClose: () => void;
}

const GlobalSnackbar: React.FC<GlobalSnackbarProps> = ({
  open,
  message,
  severity = "info",
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          minWidth: 400,
          fontSize: 18,
          fontWeight: 500,
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity as AlertColor}
        sx={{
          width: "100%",
          fontSize: 18,
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          ...(severity === "success" && {
            bgcolor: "success.main",
            color: "white",
          }),
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
