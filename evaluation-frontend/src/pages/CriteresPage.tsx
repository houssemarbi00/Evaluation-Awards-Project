// src/pages/CriteresPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchCategories,
  fetchCriteresByCategory,
  createCritere,
  deleteCritere, 
} from "../api/criteres";
import type {Critere,Category} from "../api/criteres";

export default function CriteresPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "">("");
  const [criteres, setCriteres] = useState<Critere[]>([]);
  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [valeurMax, setValeurMax] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Delete confirmation
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const showSnack = (message: string, severity: "success" | "error" = "success") =>
    setSnack({ open: true, message, severity });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
        showSnack("Erreur lors du chargement des catégories", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedCat === "") {
      setCriteres([]);
      return;
    }
    const loadCriteres = async () => {
      setLoading(true);
      try {
        const res = await fetchCriteresByCategory(Number(selectedCat));
        setCriteres(res.data || []);
      } catch (err) {
        console.error(err);
        showSnack("Erreur lors du chargement des critères", "error");
      } finally {
        setLoading(false);
      }
    };
    loadCriteres();
  }, [selectedCat]);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedCat) {
      showSnack("Veuillez choisir une catégorie", "error");
      return;
    }
    if (!nom.trim()) {
      showSnack("Le nom du critère est requis", "error");
      return;
    }
    if (!valeurMax || Number(valeurMax) <= 0) {
      showSnack("La valeur maximale doit être un entier > 0", "error");
      return;
    }

    setSubmitting(true);
    try {
      await createCritere({
        nom: nom.trim(),
        categorie_id: Number(selectedCat),
        valeur_max: Number(valeurMax),
      });
      showSnack("Critère ajouté", "success");
      setNom("");
      setValeurMax("");
      // reload list
      const res = await fetchCriteresByCategory(Number(selectedCat));
      setCriteres(res.data || []);
    } catch (err) {
      console.error(err);
      showSnack("Erreur lors de l'ajout du critère", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete || selectedCat === "") {
      setConfirmOpen(false);
      return;
    }
    try {
      await deleteCritere(toDelete);
      showSnack("Critère supprimé", "success");
      const res = await fetchCriteresByCategory(Number(selectedCat));
      setCriteres(res.data || []);
    } catch (err) {
      console.error(err);
      showSnack("Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  if (!user) return <Typography sx={{ p: 4 }}>Chargement...</Typography>;
  if (user.role !== "admin")
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          Accès refusé — page réservée aux administrateurs.
        </Typography>
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Gestion des critères
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleAdd}>
          <Grid container spacing={2} alignItems="center">
            <Grid >
              <FormControl fullWidth>
                <InputLabel id="cat-select-label">Catégorie</InputLabel>
                <Select
                  labelId="cat-select-label"
                  value={selectedCat}
                  label="Catégorie"
                  onChange={(e) => setSelectedCat(e.target.value as number | "")}
                >
                  <MenuItem value="">-- choisir --</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid >
              <TextField
                label="Nom du critère"
                fullWidth
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Grid>

            <Grid >
              <TextField
                label="Valeur max"
                type="number"
                inputProps={{ min: 1 }}
                fullWidth
                value={valeurMax}
                onChange={(e) => setValeurMax(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Grid>

            <Grid >
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={submitting}>
                {submitting ? "..." : "Ajouter"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Liste des critères {selectedCat ? `pour la catégorie` : ""}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : selectedCat === "" ? (
          <Typography sx={{ py: 2 }}>Sélectionne une catégorie pour voir ses critères.</Typography>
        ) : criteres.length === 0 ? (
          <Typography sx={{ py: 2 }}>Aucun critère pour cette catégorie.</Typography>
        ) : (
          criteres.map((c) => (
            <Card key={c.id} sx={{ mb: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{c.nom}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valeur max: {c.valeur_max}
                  </Typography>
                </Box>
                <IconButton color="error" onClick={() => confirmDelete(c.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          ))
        )}
      </Paper>

      {/* Confirm delete */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
