import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const data = await loginApi(email, password);
      login(data.access_token);
      nav("/dashboard");
    } catch (error: any) {
      setErr(error?.response?.data?.detail || "Erreur d'authentification");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Connexion</h1>
      <form onSubmit={submit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" />
        <button type="submit">Se connecter</button>
        {err && <div className="text-red-500 mt-2">{err}</div>}
      </form>
    </div>
  );
}
