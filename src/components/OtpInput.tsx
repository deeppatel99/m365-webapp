import React from "react";
import { Box, TextField } from "@mui/material";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, length = 6 }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, up to the specified length
    const val = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(val);
  };

  return (
    <Box display="flex" justifyContent="center" mb={2}>
      <TextField
        value={value}
        onChange={handleChange}
        inputProps={{
          maxLength: length,
          inputMode: "numeric",
          pattern: "[0-9]*",
          style: { textAlign: "center", fontSize: 28, letterSpacing: 6 },
        }}
        variant="outlined"
        fullWidth
        placeholder={"Enter OTP"}
      />
    </Box>
  );
};

export default OtpInput;
