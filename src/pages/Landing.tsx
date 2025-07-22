// Landing page for the application
import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/logokit/fs-bkg-1440.png";
import logo from "../assets/logokit/Forsynse logo_Bold_white.svg";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{
        bgcolor: "transparent",
        borderRadius: 0,
        boxShadow: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(24,28,34,0.60)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          zIndex: 1,
        }}
      />
      {/* App Logo and content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 480,
          mx: "auto",
          bgcolor: "rgba(30,32,36,0.85)",
          border: "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
          borderRadius: 3.5,
          backdropFilter: "blur(8px)",
          p: { xs: 3, sm: 5 },
          mt: { xs: 2, sm: 8 },
          mb: { xs: 2, sm: 8 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="ForSynse Logo"
          style={{
            width: 180,
            height: "auto",
            marginBottom: 32,
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Typography
          variant="h4"
          color="#e0e7ef"
          fontWeight={800}
          letterSpacing={1.2}
          mb={3}
          textAlign="center"
        >
          Welcome to ForSynse
        </Typography>
        <Typography
          variant="subtitle1"
          color="#bdbdbd"
          mb={4}
          textAlign="center"
          sx={{ maxWidth: 420 }}
        >
          Capture leads, verify users, and keep your company secure.
          <br />
          Fast, simple, and secure onboarding.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          sx={{
            mb: 2,
            width: "100%",
            maxWidth: 300,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: "0 2px 8px rgba(52,175,69,0.18)",
            letterSpacing: 0.5,
            background: "linear-gradient(90deg, #34af45 0%, #60a5fa 100%)",
            transition: "background 0.2s, box-shadow 0.2s",
            "&:hover": {
              background: "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
              boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
            },
          }}
          onClick={() => navigate("/signup")}
        >
          Get Started
        </Button>
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{
            width: "100%",
            maxWidth: 300,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: 18,
            color: "#e0e7ef",
            borderColor: "#60a5fa",
            letterSpacing: 0.5,
            "&:hover": {
              borderColor: "#34af45",
              color: "#34af45",
              background: "rgba(52,175,69,0.08)",
            },
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default Landing;
