import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Navigate } from "@/lib/router-shim";

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] flex items-center justify-center transition-colors">
    <div className="w-8 h-8 border-2 border-[#356AE6]/20 border-t-[#356AE6] rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (!user.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (user.onboarding_completed && location.pathname === "/onboarding") {
    return <Navigate to="/app/inicio" replace />;
  }
  return <>{children}</>;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) {
    return <Navigate to={user.onboarding_completed ? "/app/inicio" : "/onboarding"} replace />;
  }
  return <>{children}</>;
};
