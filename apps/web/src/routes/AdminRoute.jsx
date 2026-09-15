import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Provider/AuthProvider";
import Loading from "../Components/Loading";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading, roleLoading } = useAuth();
  const location = useLocation();

  if (loading || roleLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;

