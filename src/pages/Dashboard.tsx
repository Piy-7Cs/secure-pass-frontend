import PasswordForm from "../components/PasswordForm";
import PasswordList from "../components/PasswordList";
import { useNavigate } from "react-router-dom";
import { type PasswordEntry } from "../components/PasswordList";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

interface Props{
    entries: PasswordEntry[];
    refresh: () => Promise<void>;
}


export default function Dashboard({entries, refresh}: Props) {

    const navigate = useNavigate()
    const {logoutUser} = useAuth()
    
    const handleClick = async ()=> {
        try {
            await api.post("/auth/logout");
        }
        catch(err){
            console.error("error logging out", err)
        }
        logoutUser()
        navigate("/login")

        
    }

    return (
        <div>
            <button onClick={handleClick}>Logout</button> 
            <PasswordForm onSuccess={refresh}/> 
            <PasswordList passwords={entries} onDelete={() => {console.log("Successfully deleted Password")}} refreshEntries={refresh}/>
                
        </div> 
        
    )

  
}