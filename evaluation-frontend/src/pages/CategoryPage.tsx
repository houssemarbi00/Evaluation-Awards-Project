import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [candidats, setCandidats] = useState<any[]>([]);
  const [jurys, setJurys] = useState<any[]>([]);
  const [selectedCandidat, setSelectedCandidat] = useState<number | "">("");
  const [selectedJury, setSelectedJury] = useState<number | "">("");
  const [assignations, setAssignations] = useState<Record<number, { candidats: any[]; jurys: any[] }>>({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [newCat, setNewCat] = useState({ nom: "", description: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: "candidat" | "jury" | "categorie"; catId: number; id?: number } | null>(null);

  const showMessage = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchAll = async () => {
    try {
      const [catRes, candRes, userRes] = await Promise.all([
        api.get("/categories/"),
        api.get("/candidats/"),
        api.get("/users/"),
      ]);
      setCategories(catRes.data);
      setCandidats(candRes.data);
      setJurys(userRes.data.filter((u: any) => u.role === "jury"));
      for (const cat of catRes.data) await fetchAssignations(cat.id);
    } catch {
      showMessage("Erreur de chargement des données", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAssignations = async (catId: number) => {
    try {
      const [cand, jur] = await Promise.all([
        api.get(`/categories/${catId}/candidats`),
        api.get(`/categories/${catId}/jurys`),
      ]);
      setAssignations((prev) => ({
        ...prev,
        [catId]: { candidats: cand.data, jurys: jur.data },
      }));
    } catch {}
  };

  const addCandidat = async (catId: number) => {
    if (!selectedCandidat) return showMessage("Sélectionnez un candidat", "error");
    try {
      await api.post(`/categories/${catId}/add_candidat/${selectedCandidat}`);
      showMessage("Candidat ajouté avec succès !");
      await fetchAssignations(catId);
    } catch {
      showMessage("Erreur lors de l’ajout du candidat", "error");
    }
  };

  const addJury = async (catId: number) => {
    if (!selectedJury) return showMessage("Sélectionnez un jury", "error");
    try {
      await api.post(`/categories/${catId}/add_jury/${selectedJury}`);
      showMessage("Jury ajouté avec succès !");
      await fetchAssignations(catId);
    } catch {
      showMessage("Erreur lors de l’ajout du jury", "error");
    }
  };

  // ➕ Ajout de catégorie
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.nom.trim()) return showMessage("Le nom est obligatoire", "error");
    try {
      await api.post("/categories/", newCat);
      showMessage("Catégorie ajoutée avec succès 🎉");
      setNewCat({ nom: "", description: "" });
      await fetchAll();
    } catch {
      showMessage("Erreur lors de l’ajout de la catégorie", "error");
    }
  };

  // 🗑️ Suppression de candidat, jury ou catégorie
  const handleDelete = async () => {
    if (!toDelete) return;
    const { type, catId, id } = toDelete;

    try {
      if (type === "candidat") {
        await api.delete(`/categories/${catId}/remove_candidat/${id}`);
      } else if (type === "jury") {
        await api.delete(`/categories/${catId}/remove_jury/${id}`);
      } else if (type === "categorie") {
        await api.delete(`/categories/${catId}`);
      }
      showMessage("Suppression effectuée ✅");
      await fetchAll();
    } catch {
      showMessage("Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Gestion des Catégories
      </Typography>

      {/* ➕ Ajout de catégorie */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter une nouvelle catégorie
        </Typography>
        <Box
          component="form"
          onSubmit={handleAddCategory}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            label="Nom de la catégorie"
            value={newCat.nom}
            onChange={(e) => setNewCat({ ...newCat, nom: e.target.value })}
            required
          />
          <TextField
            label="Description"
            value={newCat.description}
            onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ gridColumn: "1 / -1" }}>
            Ajouter
          </Button>
        </Box>
      </Paper>

      {/* Sélection global */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" gap={3}>
          <Box>
            <Typography>Candidat :</Typography>
            <Select
              value={selectedCandidat}
              onChange={(e) => setSelectedCandidat(e.target.value as number)}
              displayEmpty
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">-- Sélectionnez un candidat --</MenuItem>
              {candidats.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography>Jury :</Typography>
            <Select
              value={selectedJury}
              onChange={(e) => setSelectedJury(e.target.value as number)}
              displayEmpty
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">-- Sélectionnez un jury --</MenuItem>
              {jurys.map((j) => (
                <MenuItem key={j.id} value={j.id}>
                  {j.nom}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Paper>

      {/* Liste des catégories */}
      {categories.map((cat) => (
        <Paper key={cat.id} sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">{cat.nom}</Typography>
              <Typography color="text.secondary">{cat.description || "Pas de description"}</Typography>
            </Box>

            {/* 🗑️ Bouton suppression catégorie */}
            <IconButton
              color="error"
              onClick={() => {
                setToDelete({ type: "categorie", catId: cat.id });
                setConfirmOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>

          <Typography variant="subtitle1" mt={2}>
            Candidats :
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignations[cat.id]?.candidats?.length ? (
                assignations[cat.id].candidats.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.prenom} {c.nom}
                    </TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setToDelete({ type: "candidat", catId: cat.id, id: c.id });
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>Aucun candidat</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Typography variant="subtitle1">Jurys :</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignations[cat.id]?.jurys?.length ? (
                assignations[cat.id].jurys.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>{j.nom}</TableCell>
                    <TableCell>{j.email}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setToDelete({ type: "jury", catId: cat.id, id: j.id });
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>Aucun jury</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" onClick={() => addCandidat(cat.id)}>
              + Ajouter ce candidat
            </Button>
            <Button variant="outlined" onClick={() => addJury(cat.id)}>
              + Ajouter ce jury
            </Button>
          </Box>
        </Paper>
      ))}

      {/* Dialog de confirmation */}
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
