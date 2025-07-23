// OTP verification page for users
import React, { useState, useContext, FormEvent, useEffect } from "react";
import { Button, Typography, Box, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { SnackbarContext } from "../context/SnackbarContext";
import api from "../utils/api";
import OtpInput from "../components/OtpInput";
import logo from "../assets/logokit/Forsynse logo_Bold_Black.svg";
import LockoutModal from "../components/LockoutModal";
import { setUser, setAuthenticated } from "../utils/localStorage";
import config from "../../config/index";

const Verify: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [lockoutModal, setLockoutModal] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showMessage } = useContext(SnackbarContext);
  const email = (location.state as { email?: string })?.email;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await api.post("/verify-otp", { email, otp });
      setAuthenticated();
      try {
        const { data: user } = await api.get(
          `/auth/otp-user?email=${encodeURIComponent(email)}`
        );
        setUser(user);
      } catch {
        if (email) setUser({ email: email.trim().toLowerCase() });
      }
      showMessage("OTP verified! Welcome.", "success");
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "OTP verification failed";
      if (msg.includes("maximum execution limits")) {
        setLockoutModal(true);
      }
      showMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post("/send-otp", { email });
      setResendCooldown(180);
      showMessage("OTP resent! Please check your email.", "success");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to resend OTP";
      if (msg.includes("maximum execution limits")) {
        setLockoutModal(true);
      } else if (msg.includes("wait before resending")) {
        setResendCooldown(180);
      }
      showMessage(msg, "error");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email)
    return (
      <Typography color="error">
        No email provided. Please start from signup or login.
      </Typography>
    );

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
            color: "#000",
          }}
        >
          Verify OTP
        </Typography>
        <OtpInput value={otp} onChange={setOtp} length={6} />
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
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
          {loading ? <CircularProgress size={24} /> : "Verify"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 16 }}
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendLoading}
        >
          {resendLoading ? (
            <CircularProgress size={20} />
          ) : resendCooldown > 0 ? (
            `Resend OTP (${resendCooldown}s)`
          ) : (
            "Resend OTP"
          )}
        </Button>
      </Box>
      <LockoutModal
        open={lockoutModal}
        onClose={() => setLockoutModal(false)}
      />
    </Box>
  );
};

export default Verify;
