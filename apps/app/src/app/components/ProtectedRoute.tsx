import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useVerifySessionQuery } from "../../lib/redux/api/auth/session/api";

type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoading, isFetching, isSuccess } = useVerifySessionQuery();

  if (isLoading || isFetching) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isSuccess) {
    return <>{children ?? <Outlet />}</>;
  }

  return <Navigate to="/auth/signin" state={{ from: location }} replace />;
}
