import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Auth from "./screens/Auth";
import ImgTo3d from "./screens/ImgTo3d";
import Dashboard from "./screens/Dashboard"
import Navbar from "./components/Navbar"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/imgto3d" element={<ImgTo3d />} />
        </Routes>
        <Navbar />
      </BrowserRouter>
    </>
  );
}

export default App;
