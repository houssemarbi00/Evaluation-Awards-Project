import React, { useEffect, useState } from "react";
import api from "../api/apiClient";

type Category = {
  id: number;
  nom: string;
};

type FinalScore = {
  candidat_id: number;
  nom_candidat: string;
  prenom_candidat: string;
  email: string;
  projet: string;
  note_finale: number;
  nb_jury: number;
};

export default function FinalScoresPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [scores, setScores] = useState<FinalScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/");
        setCategories(res.data);
      } catch {
        setError("Erreur de chargement des catégories");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    const loadScores = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/scores/final_scores/${selectedCat}`);
        setScores(res.data);
      } catch {
        setError("Erreur de chargement des scores finaux");
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, [selectedCat]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Résultats Finaux</h1>

      <div className="mb-4">
        <label className="font-semibold mr-2">Catégorie :</label>
        <select
          onChange={(e) => setSelectedCat(Number(e.target.value))}
          defaultValue=""
          className="border p-2 rounded"
        >
          <option value="" disabled>
            -- Sélectionnez une catégorie --
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Chargement des scores...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {selectedCat && !loading && (
        <>
          {scores.length === 0 ? (
            <p>Aucun score final trouvé pour cette catégorie.</p>
          ) : (
            <table className="min-w-full border border-gray-300 mt-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Classement</th>
                  <th className="border p-2">Candidat</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Projet</th>
                  <th className="border p-2">Note Finale</th>
                  <th className="border p-2">Nb Jurys</th>
                </tr>
              </thead>
              <tbody>
                {scores
                  .sort((a, b) => b.note_finale - a.note_finale)
                  .map((s, idx) => (
                    <tr key={s.candidat_id}>
                      <td className="border p-2 text-center font-semibold">{idx + 1}</td>
                      <td className="border p-2">{s.prenom_candidat} {s.nom_candidat}</td>
                      <td className="border p-2">{s.email}</td>
                      <td className="border p-2">{s.projet || "—"}</td>
                      <td className="border p-2 text-center font-semibold">
                        {s.note_finale.toFixed(2)}
                      </td>
                      <td className="border p-2 text-center">{s.nb_jury}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
