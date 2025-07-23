import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

interface LockoutModalProps {
  open: boolean;
  onClose: () => void;
}

const LockoutModal = ({ open, onClose }: LockoutModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="lockout-modal-title"
    aria-describedby="lockout-modal-description"
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
          id="lockout-modal-title"
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
          id="lockout-modal-description"
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
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    }
  />
);

export default LockoutModal;
