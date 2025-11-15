// src/api/criteres.ts
import api from "./apiClient";

export type Critere = {
  id: number;
  nom: string;
  categorie_id: number;
  valeur_max: number;
};

export type Category = {
  id: number;
  nom: string;
  description?: string;
};

export const fetchCategories = () => api.get<Category[]>("/categories/");
export const fetchCriteresByCategory = (categorie_id: number) =>
  api.get<Critere[]>(`/criteres/by_category/${categorie_id}`);
export const createCritere = (payload: { nom: string; categorie_id: number; valeur_max: number }) =>
  api.post<Critere>("/criteres/", payload);
export const deleteCritere = (id: number) => api.delete(`/criteres/${id}`);
