import { createContext,useEffect,useState } from "react";
import { toast } from "react-toastify";
export const AppContext = createContext();
import axios from "axios";
export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true; // Enable sending cookies with requests
    const backendUrl = "https://authnext.onrender.com";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState('');
    const getAuthState = async () => {
        try {
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth');
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occured while checking authentication state");
        }
    }
    
    const getUserData = async () => {
        try {
            console.log(backendUrl+'/api/user/data')
            const {data} = await axios.get(backendUrl+'/api/user/data');
            console.log(data);
            data.success ? setUserData(data.user) : toast.error(data.message || "Failed to fetch user data");
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while fetching user data");
        }
    }

    useEffect(() => {
        getAuthState();
    },[]);

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData

    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
