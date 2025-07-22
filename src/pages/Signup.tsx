// Signup page for new users
import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../context/SnackbarContext";
import api from "../utils/api";
import { SignupForm, SignupErrors } from "../types/forms";
import { validateSignup } from "../utils/validation";
import heroBg from "../assets/logokit/fs-bkg-1440.png";
import logo from "../assets/logokit/Forsynse logo_Bold_Black.svg";

// Initial form state
const initialState: SignupForm = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
};

const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupForm>(initialState);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showMessage } = useContext(SnackbarContext);

  // Handle input changes and clear field errors
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateSignup(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      // Check if a user from the same domain already exists
      const check = await api.get(`/check-domain?email=${form.email}`);
      if (check.data.exists) {
        showMessage(
          "User has already registered an email at that domain.",
          "error"
        );
        setLoading(false);
        return;
      }
      // Call signup API (backend expects snake_case fields)
      await api.post("/signup", {
        first_name: form.firstName,
        last_name: form.lastName,
        company: form.company,
        email: form.email,
      });
      // Store email for Navbar API fetch
      localStorage.setItem(
        "user",
        JSON.stringify({ email: form.email.trim().toLowerCase() })
      );
      showMessage("Signup successful! OTP sent to your email.", "success");
      navigate("/verify", { state: { email: form.email } });
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.error || err.response?.data?.message;
      showMessage(backendMsg || "Signup failed", "error");
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
          Sign Up
        </Typography>
        <TextField
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
          fullWidth
          margin="normal"
          sx={{ borderRadius: 2 }}
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
          fullWidth
          margin="normal"
          sx={{ borderRadius: 2 }}
        />
        <TextField
          label="Company"
          name="company"
          value={form.company}
          onChange={handleChange}
          error={!!errors.company}
          helperText={errors.company}
          fullWidth
          margin="normal"
          sx={{ borderRadius: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
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
          {loading ? <CircularProgress size={24} /> : "Sign Up"}
        </Button>
        <Button
          onClick={() => navigate("/login")}
          sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
          fullWidth
        >
          Already have an account? Log in
        </Button>
      </Box>
    </Box>
  );
};

export default Signup;
