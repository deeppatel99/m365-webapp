// Dashboard page styles
export const cardStyle = {
  borderRadius: 3,
  boxShadow: 3,
  px: { xs: 2, sm: 6, md: 8 },
  py: { xs: 2, sm: 5 },
};

export const actionBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 4,
  flexWrap: "wrap",
  gap: 2,
};

export const actionControlsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

export const outputBoxStyle = {
  background: "#f4f6fa", // light gray background (a bit more gray than white)
  border: "1px solid #e0e0e0",
  borderRadius: 2,
  p: 3,
  mb: 4,
  minHeight: 320,
  maxHeight: 600,
  overflow: "auto",
  transition: "box-shadow 0.2s",
  boxShadow: 1,
  color: "#23272a", // dark text for readability
  fontFamily: "Fira Mono, Menlo, Monaco, Consolas, monospace",
  fontSize: 15,
  ":hover": { boxShadow: 4 },
};

export const selectLabelStyle = {
  fontWeight: 500,
  fontSize: 16,
  color: "#22223b",
  mr: 1,
};
