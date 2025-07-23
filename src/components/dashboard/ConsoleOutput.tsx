import React from "react";
import { Box, TextField } from "@mui/material";

interface ConsoleOutputProps {
  response: string;
  emptyState: React.ReactNode;
  outputBoxStyle: any;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  response,
  emptyState,
  outputBoxStyle,
}) => (
  <Box sx={outputBoxStyle}>
    <TextField
      multiline
      minRows={14}
      maxRows={28}
      fullWidth
      value={response}
      InputProps={{
        readOnly: true,
        style: {
          fontFamily:
            "Fira Mono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          background: "transparent",
          border: "none",
          fontSize: 16,
        },
        disableUnderline: true,
        "aria-label": "Console Output",
      }}
      variant="standard"
      sx={{ border: "none" }}
      placeholder="Results will appear here after you submit an action."
    />
    {!response && emptyState}
  </Box>
);

export default ConsoleOutput;
