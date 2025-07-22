import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

interface LoadingBackdropProps {
  open: boolean;
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ open }) => {
  return (
    <Backdrop
      sx={{ color: "#0057FF", zIndex: (theme) => theme.zIndex.drawer + 1, background: 'rgba(247,250,252,0.7)' }}
      open={open}
    >
      <CircularProgress color="inherit" size={56} thickness={4.5} />
    </Backdrop>
  );
};

export default LoadingBackdrop;
