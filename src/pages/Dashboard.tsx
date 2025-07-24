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

interface User {
  id: string;
  displayName: string;
  userPrincipalName: string;
}

interface SignInActivity {
  lastSignInDateTime: string | null;
}

interface InactiveUser {
  displayName: string;
  userPrincipalName: string;
  lastSignInDateTime: string | null;
}

interface InactiveDevice {
  displayName: string;
  deviceOwnership: string;
  managementType: string;
  operatingSystem: string;
  approximateLastSignInDateTime: string;
  registrationDateTime: string;
}

interface NamedLocation {
  displayName: string;
  isTrusted: boolean;
  cidrAddresses: string[];
}

interface AzureNamedLocation {
  id: string;
  displayName: string;
  isTrusted?: boolean;
  ipRanges?: Array<{
    cidrAddress?: string;
  }>;
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

  // Action options for the dropdown
  const actionOptions = [
    { value: "getInactiveUsers", label: "Get inactive users (90 Days+)" },
    { value: "getInactiveDevices", label: "Get inactive devices (90 Days+)" },
    { value: "getAdminRolesWithUsers", label: "Get Admin Roles with Users" },
    { value: "getPolicies", label: "Get Conditional Access policies" },
    {
      value: "getNamedLocations",
      label: "Get Conditional Access named locations",
    },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
    // Load user from localStorage
    const stored = getUser() || {};
    setUserState(stored);
  }, [navigate]);

  // Function to get user details (display name & userPrincipalName)
  const getUserDetails = async (
    userId: string
  ): Promise<{ displayName: string; userPrincipalName: string }> => {
    if (userId === "All" || userId === "None") {
      return { displayName: userId, userPrincipalName: userId };
    }

    try {
      const userDetails = await callGraphApi<User>(`/users/${userId}`);
      console.log(
        `Found displayName & UserPrincipalName for user ${userId}: ${userDetails.displayName} - ${userDetails.userPrincipalName}`
      );

      return {
        displayName: userDetails.displayName || userId,
        userPrincipalName: userDetails.userPrincipalName || "N/A",
      };
    } catch (error) {
      console.error(`Error fetching user details for ${userId}: `, error);
      return { displayName: userId, userPrincipalName: "N/A" };
    }
  };

  // Fetch role displayName using roleTemplateId
  const getRoleDisplayName = async (roleId: string): Promise<string> => {
    if (roleId === "All" || roleId === "None") {
      return roleId;
    }

    try {
      // Get role template directly by ID
      const roleTemplate = await callGraphApi<any>(
        `/directoryRoleTemplates/${roleId}`
      );
      return roleTemplate.displayName || roleId;
    } catch (error) {
      console.error(`Error fetching role template for ${roleId}:`, error);
      return roleId;
    }
  };

  // Replace user & role IDs with display names
  const replaceIdsWithUserDetails = async (result: any) => {
    const updatedResult = JSON.parse(JSON.stringify(result));

    if (updatedResult.value && Array.isArray(updatedResult.value)) {
      for (let policy of updatedResult.value) {
        if (policy.conditions && policy.conditions.users) {
          const users = policy.conditions.users;

          // IncludeUsers
          if (users.includeUsers && Array.isArray(users.includeUsers)) {
            for (let i = 0; i < users.includeUsers.length; i++) {
              const userId = users.includeUsers[i];
              if (userId !== "All" && userId !== "None") {
                const { displayName, userPrincipalName } = await getUserDetails(
                  userId
                );
                users.includeUsers[i] = {
                  id: userId,
                  displayName,
                  userPrincipalName,
                };
              }
            }
          }

          // ExcludeUsers
          if (users.excludeUsers && Array.isArray(users.excludeUsers)) {
            for (let i = 0; i < users.excludeUsers.length; i++) {
              const userId = users.excludeUsers[i];
              if (userId !== "All" && userId !== "None") {
                const { displayName, userPrincipalName } = await getUserDetails(
                  userId
                );
                users.excludeUsers[i] = {
                  id: userId,
                  displayName,
                  userPrincipalName,
                };
              }
            }
          }

          // IncludeRoles
          if (users.includeRoles && Array.isArray(users.includeRoles)) {
            for (let i = 0; i < users.includeRoles.length; i++) {
              const roleId = users.includeRoles[i];
              if (roleId !== "All" && roleId !== "None") {
                const roleDisplayName = await getRoleDisplayName(roleId);
                users.includeRoles[i] = {
                  id: roleId,
                  displayName: roleDisplayName,
                };
              }
            }
          }

          // ExcludeRoles
          if (users.excludeRoles && Array.isArray(users.excludeRoles)) {
            for (let i = 0; i < users.excludeRoles.length; i++) {
              const roleId = users.excludeRoles[i];
              if (roleId !== "All" && roleId !== "None") {
                const roleDisplayName = await getRoleDisplayName(roleId);
                users.excludeRoles[i] = {
                  id: roleId,
                  displayName: roleDisplayName,
                };
              }
            }
          }
        }
      }
    }

    return updatedResult;
  };

  // Enhanced CSV conversion function that handles nested objects
  const convertToCSVAdvanced = (objArray: any[]): string => {
    if (!objArray || objArray.length === 0) return "";

    // If the data is deeply nested, we need a flattening function
    const flattenObject = (obj: any, prefix = ""): any => {
      return Object.keys(obj).reduce((acc: any, key: string) => {
        const pre = prefix.length ? `${prefix}.` : "";
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
        } else if (Array.isArray(obj[key])) {
          // Handle arrays - join with semicolons to keep in one cell
          acc[`${pre}${key}`] = obj[key]
            .map((item: any) => {
              if (typeof item === "object") {
                return JSON.stringify(item);
              }
              return item;
            })
            .join("; ");
        } else {
          acc[`${pre}${key}`] = obj[key];
        }
        return acc;
      }, {});
    };

    // Flatten each object in the array
    const flattenedArray = objArray.map((obj) => flattenObject(obj));

    // Get all unique keys
    const headers = Array.from(
      new Set(
        flattenedArray.reduce((keys: string[], obj) => {
          return [...keys, ...Object.keys(obj)];
        }, [])
      )
    ) as string[];

    // Build CSV string
    let csvString = headers.join(",") + "\r\n";

    // Add each row
    csvString += flattenedArray
      .map((obj) => {
        return headers
          .map((header: string) => {
            let value = obj[header] === undefined ? "" : obj[header];

            // Escape quotes and handle commas
            if (typeof value === "string") {
              // Replace double quotes with two double quotes (CSV standard)
              value = value.replace(/"/g, '""');

              // If value contains commas, newlines, or quotes, wrap in quotes
              if (
                value.includes(",") ||
                value.includes("\n") ||
                value.includes('"')
              ) {
                value = `"${value}"`;
              }
            }

            return value;
          })
          .join(",");
      })
      .join("\r\n");

    return csvString;
  };

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
      if (selectedAction === "getPolicies") {
        setResponse("Fetching policies...");
        const result = await callGraphApi(
          "/policies/conditionalAccessPolicies"
        );

        setResponse("Processing user and role data...");
        const updatedResult = await replaceIdsWithUserDetails(result);

        setResponseData(updatedResult);
        setResponse(JSON.stringify(updatedResult, null, 2));
        showMessage(
          <span>
            <CheckCircleIcon
              sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
            />
            Policies fetched successfully!
          </span>,
          "success"
        );
      } else if (selectedAction === "getInactiveUsers") {
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
      } else if (selectedAction === "getInactiveDevices") {
        setResponse("Fetching Inactive Devices...");
        const result = await callGraphApi<{ value: InactiveDevice[] }>(
          "/devices?$select=displayName,deviceOwnership,managementType,operatingSystem,approximateLastSignInDateTime,registrationDateTime"
        );

        const get90DaysAgo = getDateNDaysAgo(90);

        // Filter devices that haven't signed in in the last 90 days
        const inactiveDevices = (result.value || []).filter((device: any) => {
          const signInDate = device.approximateLastSignInDateTime
            ? new Date(device.approximateLastSignInDateTime)
            : null;
          return signInDate && signInDate < get90DaysAgo;
        });

        // Extract only the required fields
        const filteredInactiveDevices = inactiveDevices.map((device: any) => ({
          displayName: device.displayName,
          deviceOwnership: device.deviceOwnership,
          managementType: device.managementType,
          operatingSystem: device.operatingSystem,
          approximateLastSignInDateTime: device.approximateLastSignInDateTime,
          registrationDateTime: device.registrationDateTime,
        }));

        setResponseData({ value: filteredInactiveDevices });
        setResponse(
          JSON.stringify({ value: filteredInactiveDevices }, null, 2)
        );
        showMessage(
          <span>
            <CheckCircleIcon
              sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
            />
            Inactive devices fetched successfully!
          </span>,
          "success"
        );
      } else if (selectedAction === "getNamedLocations") {
        setResponse("Fetching named locations...");
        const result = await callGraphApi<{ value: AzureNamedLocation[] }>(
          "/identity/conditionalAccess/namedLocations"
        );

        // Map to NamedLocation interface with type safety
        const filteredLocations: NamedLocation[] = result.value.map(
          (location) => ({
            displayName: location.displayName,
            isTrusted: location.isTrusted || false,
            cidrAddresses:
              location.ipRanges
                ?.map((ip) => ip.cidrAddress)
                ?.filter((cidr): cidr is string => !!cidr) || [],
          })
        );

        const formattedResponse = { value: filteredLocations };
        setResponseData(formattedResponse);
        setResponse(JSON.stringify(formattedResponse, null, 2));
        showMessage(
          <span>
            <CheckCircleIcon
              sx={{ verticalAlign: "middle", color: "success.main", mr: 1 }}
            />
            Named locations fetched successfully!
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
      } else if (selectedAction === "getPolicies") {
        // Use advanced CSV conversion for complex policy data
        csvData = convertToCSVAdvanced(data);
      } else {
        // Use regular CSV conversion for simple data
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

    // Set appropriate filename based on action
    let filename = "response";
    switch (selectedAction) {
      case "getAdminRolesWithUsers":
        filename = "AdminRolesUsers";
        break;
      case "getInactiveUsers":
        filename = "InactiveUsers";
        break;
      case "getInactiveDevices":
        filename = "InactiveDevices";
        break;
      case "getPolicies":
        filename = "ConditionalAccessPolicies";
        break;
      case "getNamedLocations":
        filename = "NamedLocations";
        break;
      default:
        filename = "response";
    }

    link.download = `${filename}.${fileExtension}`;
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
              actionOptions={actionOptions}
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
