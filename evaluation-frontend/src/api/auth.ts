import api from "./apiClient";

export const loginApi = async (email: string, password: string) => {
  // FastAPI OAuth2PasswordRequestForm expects form-urlencoded
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const r = await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  return r.data; // { access_token, token_type }
};
