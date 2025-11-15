import { createContext, useContext, useState, useEffect  } from "react";
import type { ReactNode } from "react";
interface AuthContextType {
    user:  {token : string} | null;
    loginUser : (token: string) => void;
    logoutUser : () => void; 
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children} : {children : ReactNode}){
    const [user, setUser] = useState<{token: string} | null>(null);

    useEffect( () => {
        const token = localStorage.getItem("token");
        if(token) setUser({ token });
    }, []);

    const loginUser = (token: string) => {
        localStorage.setItem("token", token);
        setUser({ token });
    };

    const logoutUser = () =>{
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loginUser, logoutUser}}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

