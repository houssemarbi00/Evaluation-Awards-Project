import React, { useEffect, useState } from "react";
import api from "../api/apiClient";

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

  // Charger la liste des candidats au montage
  useEffect(() => {
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
    fetchCandidats();
  }, []);

  if (loading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des candidats</h1>
      {candidats.length === 0 ? (
        <p>Aucun candidat trouvé.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Prénom</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Entreprise</th>
              <th className="border p-2">Projet</th>
              <th className="border p-2">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {candidats.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">{c.nom}</td>
                <td className="border p-2">{c.prenom}</td>
                <td className="border p-2">{c.email}</td>
                <td className="border p-2">{c.entreprise || "-"}</td>
                <td className="border p-2">{c.projet || "-"}</td>
                <td className="border p-2">
                  {c.date_creation
                    ? new Date(c.date_creation).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
