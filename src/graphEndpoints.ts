// Microsoft Graph API endpoint constants
export const GRAPH_ENDPOINTS = {
  users: "/users/?$select=displayName,userPrincipalName,signInActivity",
  adminRoles: "/roleManagement/directory/roleAssignments",
  directoryRoles: "/directoryRoles",
};
