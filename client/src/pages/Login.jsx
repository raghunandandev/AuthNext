import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {toast} from "react-toastify";
const Login = () => {
  const navigate = useNavigate();

  const {backendUrl,setIsLoggedIn,getUserData} = useContext(AppContext);
  const [state, setState] = useState("Sign-up");
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true; // Enable sending cookies with requests

      if(state === 'Sign-up'){
        const {data} = await axios.post(backendUrl+'/api/auth/register',{name,email,password})
        if(data.success){
          setIsLoggedIn(true);
          getUserData();
          navigate('/')
        }else{
          toast.error(data.message || "Registration failed");
        }
      }else{
        const {data} = await axios.post(backendUrl+'/api/auth/login',{email,password})
        if(data.success){
          setIsLoggedIn(true);
          getUserData();
          navigate('/')
        }else{
          toast.error(data.message || "Registration failed");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
      onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign-up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign-up" ? "Create your account" : "Login to you account"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign-up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="personicon" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="mailicon" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="email"
              required
              className="bg-transparent outline-none"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="lockicon" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="password"
              required
              className="bg-transparent outline-none"
            />
          </div>

          <p onClick={()=> navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">
            Forgot password?
          </p>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>

        {state === "Sign-up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign-up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign-up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
