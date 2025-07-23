import React from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
} from "@mui/material";

interface ActionBarProps {
  selectedAction: string;
  onActionChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  isFetching: boolean;
  isSignedIn: boolean;
  onSubmit: () => void;
  children?: React.ReactNode;
}

const ActionBar: React.FC<ActionBarProps> = ({
  selectedAction,
  onActionChange,
  isFetching,
  isSignedIn,
  onSubmit,
  children,
}) => {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
      mb={3}
    >
      {/* Left: Select action and submit */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body1" fontWeight={600}>
          Select Action:
        </Typography>
        <Select
          value={selectedAction}
          onChange={onActionChange}
          disabled={isFetching}
          sx={{
            minWidth: 240,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <MenuItem value="getInactiveUsers">Get Inactive Users</MenuItem>
          <MenuItem value="getAdminRolesWithUsers">
            Get Admin Roles & Assigned Users
          </MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={!isSignedIn || isFetching}
          startIcon={isFetching && <CircularProgress size={18} />}
        >
          {isFetching ? "Loading..." : "Submit"}
        </Button>
      </Box>

      {/* Right: Children such as Login component */}
      {children && (
        <Box display="flex" alignItems="center" gap={2}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default ActionBar;
