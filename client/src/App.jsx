import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/Signup";
import ImgTo3d from "./screens/ImgTo3d";
import Dashboard from "./screens/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  
  return (
    <>
        <div className="bg-slate-900 text-slate-100 flex">
      {location.pathname !== "/" && location.pathname !== "/signup" && <Navbar />}
      <div className="w-full">

      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/imgto3d" element={<ImgTo3d />} />
      </Routes>
      </div>
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
