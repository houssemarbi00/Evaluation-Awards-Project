// src/components/PageLayout.tsx
import React from "react";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {!isLoginPage && (
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{ borderColor: "white", color: "white" }}
            >
              Déconnexion
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1400 }}>{children}</Box>
      </Container>
    </Box>
  );
}
