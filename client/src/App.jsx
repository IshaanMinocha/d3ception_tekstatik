import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import FileUpload from "./components/FileUpload";

function App() {


  return (
    <>
      <FileUpload/>
    </>
  );
}

export default App;
