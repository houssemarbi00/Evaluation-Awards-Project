import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Candidat = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  entreprise?: string;
  projet?: string;
  date_creation?: string;
};

export default function CandidatsPage() {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    entreprise: "",
    projet: "",
  });

  // Charger la liste
  const fetchCandidats = async () => {
    try {
      const res = await api.get("/candidats/");
      setCandidats(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidats();
  }, []);

  // Ajouter un candidat
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/candidats/", form);
      setSnackbar({ open: true, message: "Candidat ajouté avec succès 🎉", severity: "success" });
      setForm({ nom: "", prenom: "", email: "", entreprise: "", projet: "" });
      fetchCandidats();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "Erreur lors de l’ajout du candidat",
        severity: "error",
      });
    }
  };

  // Suppression d’un candidat
  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/candidats/${selectedId}`);
      setSnackbar({ open: true, message: "Candidat supprimé ✅", severity: "success" });
      fetchCandidats();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "Erreur lors de la suppression",
        severity: "error",
      });
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
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
        Liste des Candidats
      </Typography>

      {/* Formulaire d’ajout */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter un candidat
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField label="Nom" name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <TextField label="Prénom" name="prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
          <TextField label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField label="Entreprise" name="entreprise" value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} />
          <TextField label="Projet" name="projet" value={form.projet} onChange={(e) => setForm({ ...form, projet: e.target.value })} />

          <Button type="submit" variant="contained" color="primary" sx={{ gridColumn: "1 / -1", mt: 1 }}>
            Ajouter
          </Button>
        </Box>
      </Paper>

      {/* Tableau */}
      <Paper>
        {candidats.length === 0 ? (
          <Typography p={2}>Aucun candidat trouvé.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Entreprise</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Créé le</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidats.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.entreprise || "-"}</TableCell>
                  <TableCell>{c.projet || "-"}</TableCell>
                  <TableCell>{c.date_creation ? new Date(c.date_creation).toLocaleDateString() : "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => { setSelectedId(c.id); setConfirmOpen(true); }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

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


// import React, { useEffect, useState } from "react";
// import api from "../api/apiClient";

// type Candidat = {
//   id: number;
//   nom: string;
//   prenom: string;
//   email: string;
//   entreprise?: string;
//   projet?: string;
//   date_creation?: string;
// };

// export default function CandidatsPage() {
//   const [candidats, setCandidats] = useState<Candidat[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Charger la liste des candidats au montage
//   useEffect(() => {
//     const fetchCandidats = async () => {
//       try {
//         const res = await api.get("/candidats/");
//         setCandidats(res.data);
//       } catch (err: any) {
//         setError(err?.response?.data?.detail || "Erreur de chargement");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCandidats();
//   }, []);

//   if (loading) return <p className="p-4">Chargement...</p>;
//   if (error) return <p className="text-red-600 p-4">{error}</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Liste des candidats</h1>
//       {candidats.length === 0 ? (
//         <p>Aucun candidat trouvé.</p>
//       ) : (
//         <table className="min-w-full border border-gray-300">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Nom</th>
//               <th className="border p-2">Prénom</th>
//               <th className="border p-2">Email</th>
//               <th className="border p-2">Entreprise</th>
//               <th className="border p-2">Projet</th>
//               <th className="border p-2">Créé le</th>
//             </tr>
//           </thead>
//           <tbody>
//             {candidats.map((c) => (
//               <tr key={c.id}>
//                 <td className="border p-2">{c.nom}</td>
//                 <td className="border p-2">{c.prenom}</td>
//                 <td className="border p-2">{c.email}</td>
//                 <td className="border p-2">{c.entreprise || "-"}</td>
//                 <td className="border p-2">{c.projet || "-"}</td>
//                 <td className="border p-2">
//                   {c.date_creation
//                     ? new Date(c.date_creation).toLocaleDateString()
//                     : "-"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
