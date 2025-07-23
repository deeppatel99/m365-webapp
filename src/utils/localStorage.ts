export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

export const isAuthenticated = () => localStorage.getItem("auth") === "true";

export const setAuthenticated = () => localStorage.setItem("auth", "true");

export const removeAuthenticated = () => localStorage.removeItem("auth");
