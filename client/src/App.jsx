import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="font-bold text-2xl underline text-center mt-10">
      <h1>D3CEPTION</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          className="border-2 border-black m-10"
        />
        <button className="bg-slate-500 rounded-xl p-3" type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
