import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";

const PublicRoute = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token || localStorage.getItem("token");

  // If already logged in, redirect to home dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
