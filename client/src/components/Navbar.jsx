import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  SiFramer,
  SiTailwindcss,
  SiReact,
  SiJavascript,
  SiCss3,
} from "react-icons/si";
import { Link } from "react-router-dom";

const IconSideNav = () => {
  return (
    <SideNav />

  );
};

const SideNav = () => {
  const [selected, setSelected] = useState(0);

  return (

    <nav className="min-h-[100vh] w-fit bg-slate-950 p-4 flex flex-col items-center gap-2">
      <h1 className="font-bold text-2xl"
      >d3</h1>
      <Link to="/imgto3d">
        <NavItem selected={selected === 0} id={0} setSelected={setSelected}>
          <SiTailwindcss />
        </NavItem>
      </Link>
      <Link to="/dashboard">
        <NavItem selected={selected === 1} id={1} setSelected={setSelected}>
          <SiReact />
        </NavItem>
      </Link>
      <NavItem selected={selected === 2} id={2} setSelected={setSelected}>
        <SiJavascript />
      </NavItem>
      <NavItem selected={selected === 3} id={3} setSelected={setSelected}>
        <SiFramer />
      </NavItem>
      <NavItem selected={selected === 4} id={4} setSelected={setSelected}>
        <SiCss3 />
      </NavItem>
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
      <span className="block relative z-10">{children}</span>
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