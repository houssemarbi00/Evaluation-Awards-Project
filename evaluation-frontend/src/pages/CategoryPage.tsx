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
// import React, { useEffect, useState } from "react";
// import api from "../api/apiClient";

// type Category = {
//   id: number;
//   nom: string;
//   description?: string;
// };

// type Candidat = {
//   id: number;
//   nom: string;
//   prenom: string;
//   email: string;
// };

// type Jury = {
//   id: number;
//   nom: string;
//   email: string;
// };

// export default function CategoryPage() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [candidats, setCandidats] = useState<Candidat[]>([]);
//   const [jurys, setJurys] = useState<Jury[]>([]);
//   const [selectedCandidat, setSelectedCandidat] = useState<number | null>(null);
//   const [selectedJury, setSelectedJury] = useState<number | null>(null);
//   const [assignations, setAssignations] = useState<Record<number, { candidats: Candidat[]; jurys: Jury[] }>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Charger les catégories, candidats et jurys
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [catRes, candRes, userRes] = await Promise.all([
//           api.get("/categories/"),
//           api.get("/candidats/"),
//           api.get("/users/"),
//         ]);
//         setCategories(catRes.data);
//         setCandidats(candRes.data);
//         setJurys(userRes.data.filter((u: any) => u.role === "jury"));
//         // charger les assignations
//         for (const cat of catRes.data) {
//           await fetchAssignations(cat.id);
//         }
//       } catch (err: any) {
//         setError(err?.response?.data?.detail || "Erreur de chargement");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, []);

//   const fetchAssignations = async (categorieId: number) => {
//     try {
//       const [candRes, juryRes] = await Promise.all([
//         api.get(`/categories/${categorieId}/candidats`),
//         api.get(`/categories/${categorieId}/jurys`),
//       ]);
//       setAssignations((prev) => ({
//         ...prev,
//         [categorieId]: {
//           candidats: candRes.data,
//           jurys: juryRes.data,
//         },
//       }));
//     } catch {
//       console.warn("Impossible de charger les assignations pour la catégorie", categorieId);
//     }
//   };

//   const addCandidat = async (categorieId: number) => {
//     if (!selectedCandidat) return alert("Sélectionnez un candidat");
//     try {
//       await api.post(`/categories/${categorieId}/add_candidat/${selectedCandidat}`);
//       alert("Candidat ajouté avec succès !");
//       await fetchAssignations(categorieId); // refresh local
//     } catch (err: any) {
//       alert(err?.response?.data?.detail || "Erreur d’ajout du candidat");
//     }
//   };

//   const addJury = async (categorieId: number) => {
//     if (!selectedJury) return alert("Sélectionnez un jury");
//     try {
//       await api.post(`/categories/${categorieId}/add_jury/${selectedJury}`);
//       alert("Jury ajouté avec succès !");
//       await fetchAssignations(categorieId);
//     } catch (err: any) {
//       alert(err?.response?.data?.detail || "Erreur d’ajout du jury");
//     }
//   };
//  const removeCandidat = async (categorieId: number, candidatId: number) => {
//   if (!window.confirm("Retirer ce candidat de la catégorie ?")) return;
//   try {
//     await api.delete(`/categories/${categorieId}/remove_candidat/${candidatId}`);
//     alert("Candidat retiré !");
//     await fetchAssignations(categorieId); // refresh
//   } catch (err: any) {
//     alert(err?.response?.data?.detail || "Erreur de suppression du candidat");
//   }
// };

// const removeJury = async (categorieId: number, juryId: number) => {
//   if (!window.confirm("Retirer ce jury de la catégorie ?")) return;
//   try {
//     await api.delete(`/categories/${categorieId}/remove_jury/${juryId}`);
//     alert("Jury retiré !");
//     await fetchAssignations(categorieId);
//   } catch (err: any) {
//     alert(err?.response?.data?.detail || "Erreur de suppression du jury");
//   }
// };

//   if (loading) return <p className="p-4">Chargement...</p>;
//   if (error) return <p className="text-red-600 p-4">{error}</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Catégories</h1>

//       {/* Sélection globale pour ajouter un candidat/jury */}
//       <div className="flex gap-6 mb-6">
//         <div>
//           <label className="block font-semibold mb-1">Candidat :</label>
//           <select
//             className="border p-2 rounded"
//             onChange={(e) => setSelectedCandidat(Number(e.target.value))}
//             defaultValue=""
//           >
//             <option value="" disabled>
//               -- Sélectionnez un candidat --
//             </option>
//             {candidats.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.prenom} {c.nom}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Jury :</label>
//           <select
//             className="border p-2 rounded"
//             onChange={(e) => setSelectedJury(Number(e.target.value))}
//             defaultValue=""
//           >
//             <option value="" disabled>
//               -- Sélectionnez un jury --
//             </option>
//             {jurys.map((j) => (
//               <option key={j.id} value={j.id}>
//                 {j.nom}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {categories.length === 0 ? (
//         <p>Aucune catégorie trouvée.</p>
//       ) : (
//         categories.map((cat) => (
//           <div key={cat.id} className="border rounded p-4 mb-4">
//             <h2 className="text-xl font-semibold mb-2">{cat.nom}</h2>
//             <p className="mb-3 text-gray-700">{cat.description || "Pas de description"}</p>

//             <div className="mb-3">
//               <strong>Candidats :</strong>
//               <ul className="list-disc list-inside">
//                 {assignations[cat.id]?.candidats?.length ? (
//                   assignations[cat.id].candidats.map((c) => (
//   <li key={c.id} className="flex justify-between items-center">
//     <span>{c.prenom} {c.nom} ({c.email})</span>
//     <button
//       onClick={() => removeCandidat(cat.id, c.id)}
//       className="text-red-600 hover:text-red-800"
//       title="Retirer ce candidat"
//     >
//       🗑️
//     </button>
//   </li>
// ))

//                 ) : (
//                   <li className="text-gray-500">Aucun candidat</li>
//                 )}
//               </ul>
//             </div>

//             <div className="mb-3">
//               <strong>Jurys :</strong>
//               <ul className="list-disc list-inside">
//                 {assignations[cat.id]?.jurys?.length ? (
//                   assignations[cat.id].jurys.map((c) => (
//   <li key={c.id} className="flex justify-between items-center">
//     <span>{c.nom} ({c.email})</span>
//     <button
//       onClick={() => removeCandidat(cat.id, c.id)}
//       className="text-red-600 hover:text-red-800"
//       title="Retirer ce candidat"
//     >
//       🗑️
//     </button>
//   </li>
// ))

//                 ) : (
//                   <li className="text-gray-500">Aucun jury</li>
//                 )}
//               </ul>
//             </div>

//             <div>
//               <button
//                 onClick={() => addCandidat(cat.id)}
//                 className="bg-blue-500 text-white px-3 py-1 mr-2 rounded"
//               >
//                 + Ajouter ce candidat
//               </button>
//               <button
//                 onClick={() => addJury(cat.id)}
//                 className="bg-green-500 text-white px-3 py-1 rounded"
//               >
//                 + Ajouter ce jury
//               </button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
