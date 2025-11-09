import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      await login(data.access_token);
      nav("/dashboard");
    } catch (error: any) {
      setErr(error?.response?.data?.detail || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", mb: 2 }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Connexion
        </Typography>

        {err && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {err}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={submit}
          sx={{ width: "100%", mt: 1 }}
        >
          <TextField
            fullWidth
            label="Adresse email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 2, py: 1.3 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={26} color="inherit" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          © 2025 Plateforme d’Évaluation Jury
        </Typography>
      </Paper>
    </Box>
  );
}


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { loginApi } from "../api/auth";
// import { useAuth } from "../contexts/AuthContext";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState<string | null>(null);
//   const { login } = useAuth();
//   const nav = useNavigate();

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErr(null);
//     try {
//       const data = await loginApi(email, password);
//       login(data.access_token);
//       nav("/dashboard");
//     } catch (error: any) {
//       setErr(error?.response?.data?.detail || "Erreur d'authentification");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6">
//       <h1 className="text-2xl mb-4">Connexion</h1>
//       <form onSubmit={submit}>
//         <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
//         <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" />
//         <button type="submit">Se connecter</button>
//         {err && <div className="text-red-500 mt-2">{err}</div>}
//       </form>
//     </div>
//   );
// }
