import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CandidatsPage from "./pages/CandidatsPage";
import ScoreEntryPage from "./pages/ScoreEntryPage";
import FinalScoresPage from "./pages/FinalScoresPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryPage from "./pages/CategoryPage";



function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/candidats" element={<ProtectedRoute><CandidatsPage/></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute role="jury"><ScoreEntryPage/></ProtectedRoute>} />
          <Route path="/final-scores" element={<ProtectedRoute role="admin"><FinalScoresPage /></ProtectedRoute>}/>
          {/* <Route path="/final-scores" element={<ProtectedRoute><FinalScoresPage/></ProtectedRoute>} /> */}
          <Route path="*" element={<LoginPage/>}/>
          <Route path="/categories" element={<ProtectedRoute role="admin"><CategoryPage /></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


