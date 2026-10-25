import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ProtectedRoute = () => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = cookies.token || localStorage.getItem("token");

    // Fast check: if no token exists in cookies or localStorage, fail immediately
    if (!token) {
      setIsAuthenticated(false);
      setIsVerifying(false);
      return;
    }

    // Verify token against backend
    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setIsAuthenticated(true);
          if (data.username) {
            localStorage.setItem("username", data.username);
          }
        } else {
          removeCookie("token", { path: "/" });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } catch (error) {
        removeCookie("token", { path: "/" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUser();
  }, [cookies.token, removeCookie]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
