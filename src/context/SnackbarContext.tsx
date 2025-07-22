import React, { createContext } from "react";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}
export interface SnackbarContextType {
  showMessage: (message: string, severity?: SnackbarSeverity) => void;
}

export const SnackbarContext = createContext<SnackbarContextType>({
  showMessage: () => {},
});
