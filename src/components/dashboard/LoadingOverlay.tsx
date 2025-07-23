import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingOverlayProps {
  open: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open }) =>
  open ? (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgba(255,255,255,0.7)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
      }}
    >
      <CircularProgress size={48} color="primary" />
    </Box>
  ) : null;

export default LoadingOverlay;
