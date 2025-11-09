import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type User = {
  id: number;
  nom: string;
  email: string;
  role: "admin" | "jury";
  date_creation?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "jury",
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const showMessage = (msg: string, sev: "success" | "error" = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/");
      setUsers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur de chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.mot_de_passe)
      return showMessage("Tous les champs sont obligatoires", "error");

    try {
      await api.post("/users/", form);
      showMessage("Utilisateur ajouté avec succès 🎉");
      setForm({ nom: "", email: "", mot_de_passe: "", role: "jury" });
      fetchUsers();
    } catch (err: any) {
      showMessage(err?.response?.data?.detail || "Erreur lors de l’ajout", "error");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/users/${toDelete}`);
      showMessage("Utilisateur supprimé ✅");
      fetchUsers();
    } catch {
      showMessage("Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" sx={{ p: 4 }}>
        {error}
      </Typography>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Gestion des Utilisateurs
      </Typography>

      {/* 🧩 Formulaire d’ajout */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter un utilisateur
        </Typography>

        <Box
          component="form"
          onSubmit={handleAdd}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            label="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={form.mot_de_passe}
            onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
            required
          />
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            displayEmpty
          >
            <MenuItem value="jury">Jury</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>

          <Button type="submit" variant="contained" color="primary" sx={{ gridColumn: "1 / -1" }}>
            Ajouter
          </Button>
        </Box>
      </Paper>

      {/* 🧾 Tableau des utilisateurs */}
      <Paper sx={{ p: 3 }}>
        {users.length === 0 ? (
          <Typography>Aucun utilisateur trouvé.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Créé le</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nom}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    {u.date_creation ? new Date(u.date_creation).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setToDelete(u.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 🧱 Dialog confirmation suppression */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
