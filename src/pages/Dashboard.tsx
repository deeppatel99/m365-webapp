// Dashboard page for authenticated users
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  TextField,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Login, useIsSignedIn } from "@microsoft/mgt-react";
import { callGraphApi } from "../graph";
import { GRAPH_ENDPOINTS } from "../graphEndpoints";
import { convertToCSV } from "../utils/csv";
import { getDateNDaysAgo } from "../utils/date";
import { SnackbarContext } from "../context/SnackbarContext";
import Divider from "@mui/material/Divider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  actionBarStyle,
  actionControlsStyle,
  outputBoxStyle,
  selectLabelStyle,
} from "../styles/dashboardStyles";
import dashboardBg from "../assets/logokit/fs-bkg-1440.png";
import logo from "../assets/logokit/Forsynse logo_Bold_Black.svg";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import {
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  setAuthenticated,
  removeAuthenticated,
} from "../utils/localStorage";
import ActionBar from "../components/dashboard/ActionBar";
import ConsoleOutput from "../components/dashboard/ConsoleOutput";
import ExportControls from "../components/dashboard/ExportControls";
import LoadingOverlay from "../components/dashboard/LoadingOverlay";

const exportFormats = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
];

interface InactiveUser {
  displayName: string;
  userPrincipalName: string;
  lastSignInDateTime: string | null;
}

interface RoleWithUsers {
  roleDisplayName: string;
  users: Array<{
    userDisplayName: string;
    userPrincipalName: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState("getInactiveUsers");
  const [exportFormat, setExportFormat] = useState("csv");
  const [response, setResponse] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [user, setUserState] = useState<{ firstName?: string; name?: string }>(
    {}
  );
  const isSignedIn = useIsSignedIn()[0];
  const { showMessage } = useContext(SnackbarContext);
  // Remove useTheme import

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
    // Load user from localStorage
    const stored = getUser() || {};
    setUserState(stored);
  }, [navigate]);

  // Removed the useEffect that overwrites localStorage user from Graph API

  const handleLogout = () => {
    removeAuthenticated();
    removeUser();
    navigate("/login");
  };

  const handleActionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAction(event.target.value as string);
  };

  const handleExportFormatChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setExportFormat(event.target.value as string);
  };

  const handleSubmit = async () => {
    if (!isSignedIn) {
      showMessage("User is not authenticated. Please sign in first.", "error");
      setResponse("User is not authenticated. Please sign in first.");
      setResponseData(null);
      return;
    }
    setIsFetching(true);
    setShowLoadingOverlay(true);
    setResponse("");
    try {
      if (selectedAction === "getInactiveUsers") {
        const result = await callGraphApi<{ value: any[] }>(
          GRAPH_ENDPOINTS.users
        );
        const get90DaysAgo = getDateNDaysAgo(90);

        // filter by user.signInActivity?.lastSignInDateTime
        const inactiveUsers = (result.value || []).filter((user: any) => {
          const signInDate = user.signInActivity?.lastSignInDateTime
            ? new Date(user.signInActivity.lastSignInDateTime)
            : null;
          return signInDate && signInDate < get90DaysAgo;
        });

        // Extract only the required fields
        const filteredInactiveUsers = inactiveUsers.map((user: any) => ({
          displayName: user.displayName,
          userPrincipalName: user.userPrincipalName,
          lastSignInDateTime: user.signInActivity?.lastSignInDateTime || null,
        }));

        setResponseData({ value: filteredInactiveUsers });
        setResponse(JSON.stringify({ value: filteredInactiveUsers }, null, 2));
        showMessage(
          <span>
            <CheckCircleIcon
              sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
            />
            Inactive users fetched successfully!
          </span>,
          "success"
        );
      } else if (selectedAction === "getAdminRolesWithUsers") {
        const roles = await callGraphApi<{ value: any[] }>(
          GRAPH_ENDPOINTS.directoryRoles
        );

        // Filter enabled roles
        const enabledRoles = roles.value;

        const rolesWithUsers: RoleWithUsers[] = [];

        for (const role of enabledRoles) {
          // For each role, get members (users assigned)
          const membersRes = await callGraphApi<{ value: any[] }>(
            `/directoryRoles/${role.id}/members?$select=displayName,userPrincipalName`
          );

          // Filter out users with blank/null UPN and only add roles that have valid users
          if (membersRes.value && membersRes.value.length > 0) {
            const users = membersRes.value
              .filter(
                (user: any) =>
                  user.userPrincipalName && user.userPrincipalName.trim() !== ""
              )
              .map((user: any) => ({
                userDisplayName: user.displayName,
                userPrincipalName: user.userPrincipalName,
              }));

            // Only add the role if it has users with valid UPNs
            if (users.length > 0) {
              rolesWithUsers.push({
                roleDisplayName: role.displayName,
                users: users,
              });
            }
          }
        }

        // Sort roles by name for better organization
        rolesWithUsers.sort((a, b) =>
          a.roleDisplayName.localeCompare(b.roleDisplayName)
        );

        setResponseData({ value: rolesWithUsers });
        setResponse(JSON.stringify({ value: rolesWithUsers }, null, 2));
        showMessage(
          <span>
            <CheckCircleIcon
              sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
            />
            Admin roles and assigned users fetched successfully!
          </span>,
          "success"
        );
      } else {
        setResponse("Action not implemented.");
        setResponseData(null);
        showMessage("Selected action is not implemented.", "info");
      }
    } catch (error: any) {
      setResponse("Error: " + (error.message || "Unknown error"));
      setResponseData(null);
      showMessage(
        "Failed to fetch data: " + (error.message || "Unknown error"),
        "error"
      );
    }
    setIsFetching(false);
    setShowLoadingOverlay(false);
  };

  const handleExport = () => {
    if (!responseData) {
      showMessage("No data available to export!", "error");
      return;
    }
    setExporting(true);
    let blob, fileExtension;
    if (exportFormat === "csv") {
      const data = responseData.value || [];
      let csvData;

      // Handle different data structures for CSV export
      if (selectedAction === "getAdminRolesWithUsers") {
        // Flatten the grouped data for CSV export
        const flattenedData = data.flatMap((role: RoleWithUsers) =>
          role.users.map((user) => ({
            roleDisplayName: role.roleDisplayName,
            userDisplayName: user.userDisplayName,
            userPrincipalName: user.userPrincipalName,
          }))
        );
        csvData = convertToCSV(flattenedData);
      } else {
        csvData = convertToCSV(data);
      }

      blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      fileExtension = "csv";
    } else {
      blob = new Blob([JSON.stringify(responseData, null, 2)], {
        type: "application/json",
      });
      fileExtension = "json";
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      selectedAction === "getAdminRolesWithUsers"
        ? "AdminRolesUsers"
        : "InactiveUsers"
    }.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    showMessage(
      <span>
        <CheckCircleIcon
          sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
        />
        Data exported successfully as {exportFormat.toUpperCase()}!
      </span>,
      "success"
    );
  };

  return (
    <Box
      sx={{
        bgcolor: "transparent",
        minHeight: "100vh",
        py: 0,
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Dashboard Page"
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
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          mx: "auto",
          mt: 5,
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 6,
            px: { xs: 2, sm: 6, md: 8 },
            py: { xs: 2, sm: 5 },
            position: "relative",
            overflow: "visible",
            bgcolor: "rgba(255,255,255,0.95)",
          }}
        >
          {/* Progress Indicator */}
          {isFetching && (
            <LinearProgress sx={{ mb: 2 }} aria-label="Loading Progress" />
          )}
          {/* Logo at top left */}
          <Box
            sx={{
              position: "absolute",
              top: -36,
              left: 24,
              bgcolor: "background.default",
              borderRadius: 2,
              p: 1,
              boxShadow: 2,
            }}
          >
            <img
              src={logo}
              alt="ForSynse Logo"
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            />
          </Box>
          {showLoadingOverlay && <LoadingOverlay open={showLoadingOverlay} />}
          <CardContent>
            <ActionBar
              selectedAction={selectedAction}
              onActionChange={handleActionChange}
              isFetching={isFetching}
              isSignedIn={isSignedIn}
              onSubmit={handleSubmit}
            >
              {/* Right: User info and sign in, with improved UI */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                ml={{ sm: 3, xs: 0 }}
                mt={{ xs: 2, sm: 0 }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: 17,
                    px: 3,
                    py: 1.5,
                    background: "#fff",
                    color: "#22292f",
                    border: "1.5px solid #e0e0e0",
                    boxShadow: "none",
                    transition: "background 0.2s, box-shadow 0.2s",
                    display: "inline-block",
                    cursor: "pointer",
                    fontFamily: "Nunito, Nunito Sans, sans-serif",
                    "&:hover": {
                      background: "rgba(52,175,69,0.08)",
                      boxShadow: "0 2px 8px rgba(52,175,69,0.10)",
                    },
                  }}
                >
                  <Login />
                </Box>
              </Box>
            </ActionBar>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600} mb={2}>
              Console Output
            </Typography>
            <ConsoleOutput
              response={response}
              emptyState={
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  mt={4}
                >
                  <PersonOutlineIcon
                    sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No data yet. Please select an action and click Submit.
                  </Typography>
                </Box>
              }
              outputBoxStyle={outputBoxStyle}
            />
            <ExportControls
              exportFormat={exportFormat}
              onExportFormatChange={handleExportFormatChange}
              exporting={exporting}
              onExport={handleExport}
              exportFormats={exportFormats}
              disabled={!responseData}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
