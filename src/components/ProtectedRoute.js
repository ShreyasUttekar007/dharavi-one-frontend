import React, { useEffect, useState } from "react";
import { Route, Navigate } from "react-router-dom";
import { isLoggedIn, hasRole } from "../utils/auth";
import { BeatLoader } from "react-spinners";

const ProtectedRoute = ({ element, role, ...rest }) => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (role) {
        const hasRequiredRole = await hasRole(role);
        setAuthorized(hasRequiredRole);
      } else {
        const loggedIn = await isLoggedIn();
        setAuthorized(loggedIn);
      }
    };

    checkAuth();
  }, [role]);

  if (authorized === null) {
    return <div> <BeatLoader color="#03b3ff" className="loader" /></div>;
  }

  return authorized ? element : <Navigate to="/" />;
};

export default ProtectedRoute;
