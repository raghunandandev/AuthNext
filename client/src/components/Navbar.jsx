import React, { useContext } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);
  
    const sendVerificationOTP = async () => {
      try {
        axios.defaults.withCredentials = true; // Enable sending cookies with requests

        const {data} = await axios.post(backendUrl+'/api/auth/send-verify-otp');
        if(data.success){
          navigate('/email-verify');
          toast.success(data.message || "Verification email sent successfully. Please check your inbox.");
        }else{
          toast.error(data.message || "Failed to send verification email. Please try again later.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred while sending verification email");
      }
    }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true; // Enable sending cookies with requests
      const {data} = await axios.post(backendUrl+'/api/auth/logout');
      data.success && setIsLoggedIn(false)
      data.success && setUserData('');
      navigate('/');
    } catch (error) {
      toast.error(error.message || "An error occurred while logging out");
    }
  }

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />
      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOTP} className="py-1 px-1 hover:bg-gray-200 cursor-pointer">
                  Verify email
                </li>
              )}
              <li onClick={logout} className="py-1 px-1 hover:bg-gray-200 cursor-pointer pr-10">
                logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="arrowIcon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
