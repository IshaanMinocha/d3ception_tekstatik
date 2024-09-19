import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MdOutline3dRotation } from "react-icons/md";
import { FaWpforms } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { invoke } from "@tauri-apps/api/tauri";
const IconSideNav = () => {
  return (
    <SideNav />

  );
};

const SideNav = () => {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate(); 

  const handleLogout = async () => {
    try {

 
      

      localStorage.removeItem("authToken");

      navigate("/signup");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (

    <nav className="min-h-[100vh] w-fit bg-slate-950 p-4 flex flex-col items-center gap-2">
      <h1 className="font-bold text-2xl"
      >d3ception</h1>
      <Link to="/dashboard">
        <NavItem selected={selected === 0} id={0} setSelected={setSelected}>
          <div className="flex justify-left gap-2 place-items-center">
          <FaWpforms /> Upload From
          </div>
        </NavItem>
      </Link>
      <Link to="/imgto3d">
        <NavItem selected={selected === 1} id={1} setSelected={setSelected}>
        <div className="flex justify-left  gap-2 place-items-center">
        <MdOutline3dRotation /> Image to 3D
          </div>
        </NavItem>
      </Link>
      <NavItem selected={selected === 2} id={2} setSelected={setSelected}>
      <div className="flex justify-left gap-2 place-items-center">
      <AiOutlineDashboard /> DashBoard
          </div>
      </NavItem>
      <NavItem selected={selected === 3} id={3} setSelected={setSelected}>
      <div className="flex justify-left gap-2 place-items-center">
          <FaWpforms /> Profile
          </div>
      </NavItem>
      <NavItem selected={selected === 4} id={4} setSelected={setSelected}>
      <div className="flex justify-left gap-2 place-items-center">
      <IoMdSettings /> Settings
          </div>
      </NavItem>
      <button onClick={handleLogout}>

      <div className="flex justify-left gap-2 place-items-center text-left m-4 text-sm relative">
      <CiLogout />Logout
          </div>
    </button>
   
    </nav>
  );
};

const NavItem = ({ children, selected, id, setSelected }) => {
  return (
    <motion.button
      className="p-3 text-xl bg-slate-800 hover:bg-slate-700 rounded-md transition-colors relative"
      onClick={() => setSelected(id)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="block relative z-10 text-xs w-24">{children}</span>
      <AnimatePresence>
        {selected && (
          <motion.span
            className="absolute inset-0 rounded-md bg-indigo-600 z-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          ></motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default IconSideNav;