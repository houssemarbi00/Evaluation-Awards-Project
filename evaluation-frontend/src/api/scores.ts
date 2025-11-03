import api from "./apiClient";

export const addOrUpdateCriteriaScore = async (payload: {
  candidat_id:number; jury_id:number; categorie_id:number; critere_id:number; note:number; commentaire?:string;
}) => {
  return api.post("/scores/criteria-score", payload).then(r => r.data);
};

export const getJuryScores = async (candidat_id:number, categorie_id:number) => {
  return api.get(`/scores/jury-scores/${candidat_id}/${categorie_id}`).then(r => r.data);
};

export const getFinalScoresByCategory = async (categorie_id:number) => {
  return api.get(`/scores/final_scores/${categorie_id}`).then(r => r.data);
};
