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
} from "@mui/material";

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

  const showMessage = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
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

      {categories.map((cat) => (
        <Paper key={cat.id} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">{cat.nom}</Typography>
          <Typography color="text.secondary" mb={2}>
            {cat.description || "Pas de description"}
          </Typography>

          <Typography variant="subtitle1">Candidats :</Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignations[cat.id]?.candidats?.length ? (
                assignations[cat.id].candidats.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.prenom} {c.nom}</TableCell>
                    <TableCell>{c.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>Aucun candidat</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Typography variant="subtitle1">Jurys :</Typography>
          <Table size="small">
            <TableBody>
              {assignations[cat.id]?.jurys?.length ? (
                assignations[cat.id].jurys.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>{j.nom}</TableCell>
                    <TableCell>{j.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>Aucun jury</TableCell>
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
