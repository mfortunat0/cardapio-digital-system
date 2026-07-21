import { Routes, Route } from "react-router-dom";
import CardapioFora from "./pages/Television";
import { Admin } from "./pages/Admin";
import { Login } from "./pages/Login";
import Tablet from "./pages/Tablet";

function App() {
  return (
    <Routes>
      <Route path="/outside" element={<CardapioFora />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tablet" element={<Tablet />} />
    </Routes>
  );
}

export default App;
