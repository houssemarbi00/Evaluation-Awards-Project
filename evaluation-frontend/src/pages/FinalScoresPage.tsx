import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import api from "../api/apiClient";

type Category = {
  id: number;
  nom: string;
};

type FinalScore = {
  id: number; // DataGrid nécessite un id unique
  candidat_id: number;
  prenom_candidat: string;
  nom_candidat: string;
  email: string;
  projet: string;
  note_finale: number;
  nb_jury: number;
};

export default function FinalScoresPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "">("");
  const [scores, setScores] = useState<FinalScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (msg: string, sev: "success" | "error" = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/");
        setCategories(res.data);
      } catch {
        showMessage("Erreur de chargement des catégories", "error");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    const fetchScores = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/scores/final_scores/${selectedCat}`);
        const sorted = res.data
          .sort((a: any, b: any) => b.note_finale - a.note_finale)
          .map((s: any, i: number) => ({
            ...s,
            id: s.candidat_id,
            classement: i + 1,
          }));
        setScores(sorted);
      } catch {
        showMessage("Erreur de chargement des scores finaux", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [selectedCat]);

  const columns: GridColDef[] = [
    {
      field: "classement",
      headerName: "🏅 Classement",
      // width: 130,
      renderCell: (params) => {
        const rank = params.value as number;
        if (rank === 1) return <EmojiEventsIcon color="warning" sx={{ fontSize: 28 }} titleAccess="🥇 1er" />;
        if (rank === 2) return <EmojiEventsIcon color="secondary" sx={{ fontSize: 24 }} titleAccess="🥈 2e" />;
        if (rank === 3) return <EmojiEventsIcon color="info" sx={{ fontSize: 22 }} titleAccess="🥉 3e" />;
        return <Typography>{rank}</Typography>;
      },
    },
    { field: "prenom_candidat", headerName: "Prénom", flex: 1 },
{ field: "nom_candidat", headerName: "Nom", flex: 1 },
{ field: "email", headerName: "Email", flex: 1.5 },
{ field: "projet", headerName: "Projet", flex: 1.5 },

    {
      field: "note_finale",
      headerName: "Note finale",
      flex: 1,
      type: "number",
      renderCell: (params) => (
        <Typography fontWeight="bold" color="primary">
          {params.value.toFixed(2)}
        </Typography>
      ),
    },
    { field: "nb_jury", headerName: "Nb Jurys", flex: 1, type: "number" },
  ];

  return (
    <Box p={4} sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Résultats Finaux 🏁
      </Typography>

      <Paper sx={{ width: "100%", p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sélectionnez une catégorie :
        </Typography>
        <Select
          value={selectedCat}
          onChange={(e) => setSelectedCat(Number(e.target.value))}
          displayEmpty
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">-- Choisir une catégorie --</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nom}
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {loading ? (
        <Box sx={{width: "100%", display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        selectedCat &&
        scores.length > 0 && (
  <Paper sx={{ height: 600, width: 1080, p: 2 }}>
  <DataGrid
  rows={scores}
  columns={columns}
  disableRowSelectionOnClick
  autoHeight
  disableColumnResize={false}
  sx={{
    width: "100%",
    "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },
    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
    "& .MuiDataGrid-row:nth-of-type(1)": { backgroundColor: "rgba(255, 215, 0, 0.15)" },
    "& .MuiDataGrid-row:nth-of-type(2)": { backgroundColor: "rgba(192, 192, 192, 0.1)" },
    "& .MuiDataGrid-row:nth-of-type(3)": { backgroundColor: "rgba(205, 127, 50, 0.1)" },
  }}
  columnHeaderHeight={45}
  pageSizeOptions={[5, 10]}
  initialState={{
    pagination: { paginationModel: { pageSize: 10 } },
  }}
/>

</Paper>

        )
      )}

      {!loading && selectedCat && scores.length === 0 && (
        <Typography color="text.secondary" textAlign="center">
          Aucun score final trouvé pour cette catégorie.
        </Typography>
      )}

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
// };

// type FinalScore = {
//   candidat_id: number;
//   nom_candidat: string;
//   prenom_candidat: string;
//   email: string;
//   projet: string;
//   note_finale: number;
//   nb_jury: number;
// };

// export default function FinalScoresPage() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCat, setSelectedCat] = useState<number | null>(null);
//   const [scores, setScores] = useState<FinalScore[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await api.get("/categories/");
//         setCategories(res.data);
//       } catch {
//         setError("Erreur de chargement des catégories");
//       }
//     };
//     loadCategories();
//   }, []);

//   useEffect(() => {
//     if (!selectedCat) return;
//     const loadScores = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get(`/scores/final_scores/${selectedCat}`);
//         setScores(res.data);
//       } catch {
//         setError("Erreur de chargement des scores finaux");
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadScores();
//   }, [selectedCat]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Résultats Finaux</h1>

//       <div className="mb-4">
//         <label className="font-semibold mr-2">Catégorie :</label>
//         <select
//           onChange={(e) => setSelectedCat(Number(e.target.value))}
//           defaultValue=""
//           className="border p-2 rounded"
//         >
//           <option value="" disabled>
//             -- Sélectionnez une catégorie --
//           </option>
//           {categories.map((cat) => (
//             <option key={cat.id} value={cat.id}>
//               {cat.nom}
//             </option>
//           ))}
//         </select>
//       </div>

//       {loading && <p>Chargement des scores...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {selectedCat && !loading && (
//         <>
//           {scores.length === 0 ? (
//             <p>Aucun score final trouvé pour cette catégorie.</p>
//           ) : (
//             <table className="min-w-full border border-gray-300 mt-4">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border p-2">Classement</th>
//                   <th className="border p-2">Candidat</th>
//                   <th className="border p-2">Email</th>
//                   <th className="border p-2">Projet</th>
//                   <th className="border p-2">Note Finale</th>
//                   <th className="border p-2">Nb Jurys</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {scores
//                   .sort((a, b) => b.note_finale - a.note_finale)
//                   .map((s, idx) => (
//                     <tr key={s.candidat_id}>
//                       <td className="border p-2 text-center font-semibold">{idx + 1}</td>
//                       <td className="border p-2">{s.prenom_candidat} {s.nom_candidat}</td>
//                       <td className="border p-2">{s.email}</td>
//                       <td className="border p-2">{s.projet || "—"}</td>
//                       <td className="border p-2 text-center font-semibold">
//                         {s.note_finale.toFixed(2)}
//                       </td>
//                       <td className="border p-2 text-center">{s.nb_jury}</td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
