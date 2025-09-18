import localforage from "localforage";
import { jwtDecode } from "jwt-decode";

export const getUser = async () => {
  try {
    const userName = await localforage.getItem("userName");
    const email = await localforage.getItem("email");
    const id = await localforage.getItem("ID");
    const roles = await localforage.getItem("roles");
    if (userName && email && id && roles) {
      return { userName, email, id, roles };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user data", error);
    return null;
  }
};

export const isLoggedIn = async () => {
  try {
    const token = await localforage.getItem("token");
    if (!token) return false;

    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      await localforage.removeItem("token");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to validate token", error);
    await localforage.removeItem("token");
    return false;
  }
};

export const hasRole = async (role) => {
  try {
    const roles = await localforage.getItem("roles");
    return roles ? roles.includes(role) : false;
  } catch (error) {
    console.error("Failed to fetch roles", error);
    return false;
  }
};
