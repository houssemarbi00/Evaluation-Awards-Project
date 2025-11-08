import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  TextField,
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
import api from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";

type Category = { id: number; nom: string };
type Candidat = { id: number; nom: string; prenom: string };
type Critere = { id: number; nom: string; valeur_max: number };

export default function ScoreEntryPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "">("");
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [criteres, setCriteres] = useState<Critere[]>([]);
  const [notes, setNotes] = useState<Record<string, { note: number; commentaire: string }>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Charger les catégories
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

  // Charger les candidats et critères de la catégorie sélectionnée
  useEffect(() => {
    if (!selectedCat) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [candRes, critRes] = await Promise.all([
          api.get(`/categories/${selectedCat}/candidats`),
          api.get(`/criteres/by_category/${selectedCat}`),
        ]);
        setCandidats(candRes.data);
        setCriteres(critRes.data);
      } catch {
        showMessage("Erreur de chargement des données", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCat]);

  // Gestion du changement de note / commentaire
  const handleChange = (candId: number, critId: number, field: "note" | "commentaire", value: any) => {
    const key = `${candId}-${critId}`;
    setNotes((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // Enregistrement d’une note
  const saveScore = async (candId: number, critId: number) => {
    if (!selectedCat || !user) return;
    const key = `${candId}-${critId}`;
    const data = notes[key];
    if (!data?.note && data?.note !== 0) {
      showMessage("Veuillez entrer une note avant d’enregistrer", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/scores/criteria-score", {
        candidat_id: candId,
        jury_id: user.user_id,
        categorie_id: selectedCat,
        critere_id: critId,
        note: data.note,
        commentaire: data.commentaire || "",
      });
      showMessage("Note enregistrée ✅");
    } catch (err: any) {
      showMessage(err?.response?.data?.detail || "Erreur d’enregistrement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Saisie des notes
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Choisissez une catégorie :
        </Typography>
        <Select
          value={selectedCat}
          onChange={(e) => setSelectedCat(Number(e.target.value))}
          displayEmpty
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">-- Sélectionnez une catégorie --</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nom}
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && selectedCat && (
        <>
          {candidats.length === 0 ? (
            <Typography>Aucun candidat trouvé pour cette catégorie.</Typography>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidat</TableCell>
                    {criteres.map((crit) => (
                      <TableCell key={crit.id}>
                        {crit.nom} <br />
                        <Typography variant="caption" color="text.secondary">
                          (max {crit.valeur_max})
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidats.map((cand) => (
                    <TableRow key={cand.id}>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {cand.prenom} {cand.nom}
                        </Typography>
                      </TableCell>
                      {criteres.map((crit) => {
                        const key = `${cand.id}-${crit.id}`;
                        return (
                          <TableCell key={key}>
                            <TextField
                              type="number"
                              size="small"
                              label="Note"
                              variant="outlined"
                              value={notes[key]?.note || ""}
                              inputProps={{
                                min: 0,
                                max: crit.valeur_max,
                              }}
                              onChange={(e) =>
                                handleChange(cand.id, crit.id, "note", Number(e.target.value))
                              }
                              sx={{ width: 100, mr: 1 }}
                            />
                            <TextField
                              size="small"
                              label="Commentaire"
                              variant="outlined"
                              multiline
                              minRows={1}
                              value={notes[key]?.commentaire || ""}
                              onChange={(e) =>
                                handleChange(cand.id, crit.id, "commentaire", e.target.value)
                              }
                              sx={{ width: 200, mr: 1 }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => saveScore(cand.id, crit.id)}
                            >
                              Enregistrer
                            </Button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
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
// import { useAuth } from "../contexts/AuthContext";

// type Category = { id: number; nom: string; };
// type Candidat = { id: number; nom: string; prenom: string; };
// type Critere = { id: number; nom: string; valeur_max: number; };

// export default function ScoreEntryPage() {
//   const { user } = useAuth(); // on récupère le jury connecté
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCat, setSelectedCat] = useState<number | null>(null);
//   const [candidats, setCandidats] = useState<Candidat[]>([]);
//   const [criteres, setCriteres] = useState<Critere[]>([]);
//   const [notes, setNotes] = useState<Record<string, { note: number; commentaire: string }>>({});
//   const [loading, setLoading] = useState(false);

//   // Charger les catégories du jury
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await api.get("/categories/");
//         setCategories(res.data);
//       } catch (err) {
//         alert("Erreur de chargement des catégories");
//       }
//     };
//     loadCategories();
//   }, []);

//   // Charger les candidats et critères quand la catégorie change
//   useEffect(() => {
//     if (!selectedCat) return;
//     const loadData = async () => {
//       try {
//         const [candRes, critRes] = await Promise.all([
//           api.get(`/categories/${selectedCat}/candidats`),
//           api.get(`/criteres/by_category/${selectedCat}`),
//         ]);
//         setCandidats(candRes.data);
//         setCriteres(critRes.data);
//       } catch (err) {
//         alert("Erreur de chargement des données");
//       }
//     };
//     loadData();
//   }, [selectedCat]);

//   const handleNoteChange = (candidatId: number, critereId: number, field: "note" | "commentaire", value: any) => {
//     const key = `${candidatId}-${critereId}`;
//     setNotes((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], [field]: value },
//     }));
//   };

//   const saveScore = async (candidatId: number, critereId: number) => {
//     if (!selectedCat || !user) return;
//     const key = `${candidatId}-${critereId}`;
//     const { note, commentaire } = notes[key] || {};
//     if (note == null) return alert("Veuillez entrer une note !");
//     setLoading(true);
//     try {
//       await api.post("/scores/criteria-score", {
//         candidat_id: candidatId,
//         jury_id: user.user_id,
//         categorie_id: selectedCat,
//         critere_id: critereId,
//         note,
//         commentaire,
//       });
//       alert("Note enregistrée ✅");
//     } catch (err: any) {
//       alert(err?.response?.data?.detail || "Erreur d’enregistrement");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Saisie des notes</h1>

//       {/* Sélection catégorie */}
//       <div className="mb-6">
//         <label className="font-semibold mr-2">Catégorie :</label>
//         <select
//           onChange={(e) => setSelectedCat(Number(e.target.value))}
//           defaultValue=""
//           className="border p-2 rounded"
//         >
//           <option value="" disabled>-- Sélectionnez une catégorie --</option>
//           {categories.map((cat) => (
//             <option key={cat.id} value={cat.id}>{cat.nom}</option>
//           ))}
//         </select>
//       </div>

//       {/* Si une catégorie est sélectionnée */}
//       {selectedCat && (
//         <>
//           <h2 className="text-xl font-semibold mb-3">Candidats & Critères</h2>
//           {candidats.length === 0 ? (
//             <p>Aucun candidat dans cette catégorie.</p>
//           ) : (
//             <table className="min-w-full border border-gray-300">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border p-2">Candidat</th>
//                   {criteres.map((crit) => (
//                     <th key={crit.id} className="border p-2">{crit.nom} <small>(max {crit.valeur_max})</small></th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {candidats.map((cand) => (
//                   <tr key={cand.id}>
//                     <td className="border p-2 font-semibold">{cand.prenom} {cand.nom}</td>
//                     {criteres.map((crit) => {
//                       const key = `${cand.id}-${crit.id}`;
//                       return (
//                         <td key={key} className="border p-2">
//                           <input
//                             type="number"
//                             placeholder={`0 - ${crit.valeur_max}`}
//                             min={0}
//                             max={crit.valeur_max}
//                             className="border p-1 w-20"
//                             value={notes[key]?.note || ""}
//                             onChange={(e) =>
//                               handleNoteChange(cand.id, crit.id, "note", Number(e.target.value))
//                             }
//                           />
//                           <textarea
//                             placeholder="Commentaire..."
//                             className="border p-1 w-full mt-1 text-sm"
//                             value={notes[key]?.commentaire || ""}
//                             onChange={(e) =>
//                               handleNoteChange(cand.id, crit.id, "commentaire", e.target.value)
//                             }
//                           />
//                           <button
//                             onClick={() => saveScore(cand.id, crit.id)}
//                             className="bg-blue-500 text-white px-2 py-1 mt-1 rounded text-sm"
//                             disabled={loading}
//                           >
//                             Enregistrer
//                           </button>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// // import React, { useEffect, useState } from "react";
// // import { addOrUpdateCriteriaScore } from "../api/scores";
// // import api from "../api/apiClient";

// // export default function ScoreEntryPage(){
// //   const [candidats, setCandidats] = useState<any[]>([]);
// //   const [criteres, setCriteres] = useState<any[]>([]);
// //   const [selectedCandidat, setSelectedCandidat] = useState<number | null>(null);
// //   const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
// //   const [juryId, setJuryId] = useState<number>(() => Number(localStorage.getItem("user_id")) || 0);

// //   useEffect(()=> {
// //     api.get("/candidats/").then(r => setCandidats(r.data || r)); // selon retour
// //     // si on a categorie selection -> fetch criteres
// //   }, []);

// //   const submitNote = async (critereId:number, note:number, commentaire?:string) => {
// //     if (!selectedCandidat || !selectedCategorie) return alert("Sélectionner candidat & catégorie");
// //     try {
// //       await addOrUpdateCriteriaScore({
// //         candidat_id: selectedCandidat,
// //         jury_id: juryId,
// //         categorie_id: selectedCategorie,
// //         critere_id: critereId,
// //         note,
// //         commentaire
// //       });
// //       alert("Note enregistrée ✔️");
// //     } catch (e:any) {
// //       alert(e?.response?.data?.detail || "Erreur");
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Entrée des notes</h2>
// //       {/* UI pour sélectionner catégorie/candidat */}
// //       {/* Map des critères et champs input -> on submit call submitNote */}
// //     </div>
// //   );
// // }
