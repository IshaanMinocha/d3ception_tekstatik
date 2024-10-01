import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { invoke } from "@tauri-apps/api/tauri";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {

    

      const localToken = localStorage.getItem("authToken");

      if (localToken) {
        navigate("/dashboard/");
      }
    } catch (err) {
      console.error("Error checking token:", err);
    }
  };

  const setAuthToken = async (token) => {
    try {
      localStorage.setItem("authToken", token);
    } catch (err) {
      console.error("Error setting token:", err);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(`${backendUrl}/user/login`, { username, password });
      if (response.data.success) {
        await setAuthToken(response.data.token);
        navigate("/dashboard/");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again." + error);
    }
  };

  return (
    <div className="bg-zinc-950 py-20 text-zinc-200 selection:bg-zinc-600 pt-28 min-h-[100vh]">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeInOut" }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Heading />
        {error && <p className="text-red-500">{error}</p>}
        <LoginForm
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleSignIn={handleSignIn}
        />
      </motion.div>
      <CornerGrid />
    </div>
  );
};

const Heading = () => (
  <div>
    <div className="mb-9 mt-6 space-y-1.5">
      <h1 className="text-2xl font-semibold">Sign in to your account</h1>
      <p className="text-zinc-400">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-400">
          Create one.
        </a>
      </p>
    </div>
  </div>
);

const LoginForm = ({ username, password, setUsername, setPassword, handleSignIn }) => {
  return (
    <form onSubmit={handleSignIn}>
      <div className="mb-3">
        <label htmlFor="username-input" className="mb-1.5 block text-zinc-400">
          Username
        </label>
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <div className="mb-6">
        <div className="mb-1.5 flex items-end justify-between">
          <label htmlFor="password-input" className="block text-zinc-400">
            Password
          </label>
        </div>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <SplashButton type="submit" className="w-full">
        Sign in
      </SplashButton>
    </form>
  );
};

const SplashButton = ({ children, className, ...rest }) => {
  return (
    <button
      className={twMerge(
        "rounded-md bg-gradient-to-br from-indigo-600 from-40% to-indigo-400 px-4 py-2 text-lg text-zinc-50 ring-2 ring-offset-2 ring-offset-zinc-950 transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

const CornerGrid = () => {
  return (
    <div
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(30 58 138 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
      className="absolute right-0 top-0 z-0 size-[50vw]"
    >
      <div
        style={{
          backgroundImage:
            "radial-gradient(100% 100% at 100% 0%, rgba(9,9,11,0), rgba(9,9,11,1))",
        }}
        className="absolute inset-0"
      />
    </div>
  );
};

export default SignIn;