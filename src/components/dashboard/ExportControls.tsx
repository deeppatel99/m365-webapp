import React from "react";
import {
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

interface ExportControlsProps {
  exportFormat: string;
  onExportFormatChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
  exporting: boolean;
  onExport: () => void;
  exportFormats: { value: string; label: string }[];
  disabled?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  exportFormat,
  onExportFormatChange,
  exporting,
  onExport,
  exportFormats,
  disabled,
}) => (
  <Box display="flex" alignItems="center" justifyContent="flex-end">
    <FormControl size="small" sx={{ minWidth: 100, mr: 3 }}>
      <span style={{ display: "inline-block", width: "100%" }}>
        <Select value={exportFormat} onChange={onExportFormatChange}>
          {exportFormats.map((format) => (
            <MenuItem key={format.value} value={format.value}>
              {format.label}
            </MenuItem>
          ))}
        </Select>
      </span>
    </FormControl>
    <span style={{ display: "inline-block" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onExport}
        disabled={disabled || exporting}
        sx={{
          fontWeight: 600,
          minWidth: 120,
          fontSize: 16,
          boxShadow: 2,
          ":hover": { boxShadow: 4 },
        }}
        tabIndex={0}
      >
        {exporting ? <CircularProgress size={24} /> : "Export"}
      </Button>
    </span>
  </Box>
);

export default ExportControls;
