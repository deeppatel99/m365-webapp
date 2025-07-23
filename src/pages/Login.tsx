// Login page for existing users
import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Modal
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../context/SnackbarContext";
import api from "../utils/api";
import { LoginForm, LoginErrors } from "../types/forms";
import { validateLogin } from "../utils/validation";
import heroBg from "../assets/logokit/fs-bkg-1440.png";
import logo from "../assets/logokit/Forsynse logo_Bold_Black.svg";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lockoutModal, setLockoutModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { showMessage } = useContext(SnackbarContext);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateLogin({ email });
    if (Object.keys(errs).length) {
      setError(errs.email || "");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Call login API
      await api.post("/login", { email });
      showMessage("OTP sent to your email.", "success");
      navigate("/verify", { state: { email } });
      // Store user info for Navbar
      localStorage.setItem(
        "user",
        JSON.stringify({ email: email.trim().toLowerCase() })
      );
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.error || err.response?.data?.message;
        if (backendMsg && backendMsg.includes("maximum execution limits")) {
          setLockoutModal(true);
          // Prevent navigation and user info storage if locked out
          return;
        } else {
          showMessage(backendMsg || "Login failed", "error");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          bgcolor: "rgba(255,255,255,0.95)",
          borderRadius: 4,
          boxShadow: 6,
          maxWidth: 420,
          mx: "auto",
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img
            src={logo}
            alt="ForSynse Logo"
            style={{ width: 80, height: "auto" }}
          />
        </Box>
        <Typography
          variant="h5"
          mb={2}
          fontWeight={700}
          letterSpacing={0.5}
          align="center"
          sx={{
            color: "#000"
          }}
        >
          Login
        </Typography>
        <TextField
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
          fullWidth
          margin="normal"
          type="email"
          autoComplete="email"
          sx={{ borderRadius: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 2,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Send OTP"}
        </Button>
        <Button
          onClick={() => navigate("/signup")}
          sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
          fullWidth
        >
          New user? Sign up
        </Button>
      </Box>
      <Modal
        open={lockoutModal}
        onClose={() => setLockoutModal(false)}
        children={
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 6,
              boxShadow: 12,
              p: 7,
              maxWidth: 540,
              width: "96vw",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              sx={{
                fontWeight: 800,
                textAlign: "center",
                mb: 2,
                letterSpacing: 0.5,
              }}
            >
              Account Locked
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mb: 4,
                fontSize: 20,
                lineHeight: 1.6,
                maxWidth: 420,
              }}
            >
              Your account has reached the maximum execution limits.
              <br />
              Please reach out to <b>support@forsynse.com</b> for assistance.
            </Typography>
            <Button
              sx={{
                mt: 1,
                fontWeight: 700,
                px: 6,
                py: 1.5,
                borderRadius: 4,
                fontSize: 18,
              }}
              variant="contained"
              color="primary"
              onClick={() => setLockoutModal(false)}
            >
              Close
            </Button>
          </Box>
        }
      />
    </Box>
  );
};

export default Login;
