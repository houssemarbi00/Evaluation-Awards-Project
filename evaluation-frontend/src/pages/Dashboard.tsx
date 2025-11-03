import React, { useEffect, useState } from "react";
import { CircularProgress} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import BarChartIcon from "@mui/icons-material/BarChart";
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    categories: 0,
    candidats: 0,
    jurys: 0,
    moyenneGlobale: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [catRes, candRes, userRes, finalRes] = await Promise.all([
        api.get("/categories/"),
        api.get("/candidats/"),
        api.get("/users/"),
        api.get("/final_scores/by_category/1").catch(() => ({ data: [] })),
      ]);
      const allScores = finalRes.data?.map((s: any) => s.note_finale) || [];
      const moyenneGlobale =
        allScores.length > 0
          ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length
          : 0;
      setStats({
        categories: catRes.data.length,
        candidats: candRes.data.length,
        jurys: userRes.data.filter((u: any) => u.role === "jury").length,
        moyenneGlobale,
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <CircularProgress />
      </div>
    );

  if (user?.role === "admin") {
    return (
      <div style={{ padding: 24 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord - Administrateur
        </Typography>

        <Grid container spacing={3}>
          <Grid >
            <Card>
              <CardContent>
                <CategoryIcon color="primary" />
                <Typography variant="h6">Catégories</Typography>
                <Typography variant="h4">{stats.categories}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  >
            <Card>
              <CardContent>
                <GroupIcon color="primary" />
                <Typography variant="h6">Candidats</Typography>
                <Typography variant="h4">{stats.candidats}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid >
            <Card>
              <CardContent>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Jurys</Typography>
                <Typography variant="h4">{stats.jurys}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid >
            <Card>
              <CardContent>
                <BarChartIcon color="primary" />
                <Typography variant="h6">Moyenne Globale</Typography>
                <Typography variant="h4">
                  {stats.moyenneGlobale.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4 }}
          onClick={() => navigate("/final-scores")}
        >
          Voir les résultats finaux
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenue, {user?.nom || "Jury"}
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Vos informations
          </Typography>
          <Typography>Email : {user?.email}</Typography>
          <Typography>Rôle : Jury</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            Vous pouvez commencer à évaluer les candidats des catégories
            assignées.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/scores")}
          >
            Aller à la saisie des notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import api from "../api/apiClient";
// import { useAuth } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [stats, setStats] = useState({
//     categories: 0,
//     candidats: 0,
//     jurys: 0,
//     moyenneGlobale: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Charger les statistiques générales (pour admin)
//   useEffect(() => {
//     const loadStats = async () => {
//       try {
//         const [catRes, candRes, userRes, finalRes] = await Promise.all([
//           api.get("/categories/"),
//           api.get("/candidats/"),
//           api.get("/users/"),
//           api.get("/final_scores/by_category/1").catch(() => ({ data: [] })), // test pour moyenne
//         ]);

//         // Calculer la moyenne globale de toutes les notes finales si dispo
//         const allScores = finalRes.data?.map((s: any) => s.note_finale) || [];
//         const moyenneGlobale =
//           allScores.length > 0
//             ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length
//             : 0;

//         setStats({
//           categories: catRes.data.length,
//           candidats: candRes.data.length,
//           jurys: userRes.data.filter((u: any) => u.role === "jury").length,
//           moyenneGlobale,
//         });
//       } catch (err: any) {
//         setError("Erreur de chargement du tableau de bord");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStats();
//   }, []);

//   if (loading) return <p className="p-4">Chargement du tableau de bord...</p>;
//   if (error) return <p className="text-red-600 p-4">{error}</p>;

//   // 👑 ADMIN VIEW
//   if (user?.role === "admin") {
//     return (
//       <div className="p-6">
//         <h1 className="text-3xl font-bold mb-6">Tableau de bord - Administrateur</h1>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-blue-100 p-4 rounded shadow">
//             <h3 className="font-semibold text-gray-700">Catégories</h3>
//             <p className="text-3xl font-bold">{stats.categories}</p>
//           </div>
//           <div className="bg-green-100 p-4 rounded shadow">
//             <h3 className="font-semibold text-gray-700">Candidats</h3>
//             <p className="text-3xl font-bold">{stats.candidats}</p>
//           </div>
//           <div className="bg-yellow-100 p-4 rounded shadow">
//             <h3 className="font-semibold text-gray-700">Jurys</h3>
//             <p className="text-3xl font-bold">{stats.jurys}</p>
//           </div>
//           <div className="bg-purple-100 p-4 rounded shadow">
//             <h3 className="font-semibold text-gray-700">Moyenne Globale</h3>
//             <p className="text-3xl font-bold">{stats.moyenneGlobale.toFixed(2)}</p>
//           </div>
//         </div>

//         <div className="mt-8">
//           <button
//             onClick={() => navigate("/final-scores")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Voir les résultats finaux
//           </button>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
//             onClick={() => navigate("/categories")}
//             > Ajouter un Candidats/Jury a tel Categorie</button>
//         </div>
//       </div>
//     );
//   }

//   // ⚖️ JURY VIEW
//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Bienvenue, {user?.nom || "Jury"}</h1>

//       <div className="bg-gray-50 border rounded-lg p-4 shadow mb-6">
//         <h2 className="font-semibold mb-2 text-gray-700">Vos informations</h2>
//         <p><strong>Email :</strong> {user?.email}</p>
//         <p><strong>Rôle :</strong> Jury</p>
//       </div>

//       <div className="bg-blue-50 border rounded-lg p-4 shadow mb-6">
//         <p className="mb-3">Vous pouvez commencer à évaluer les candidats des catégories assignées.</p>
//         <button
//           onClick={() => navigate("/scores")}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Aller à la saisie des notes
//         </button>
        
//       </div>
//     </div>
//   );
// }
