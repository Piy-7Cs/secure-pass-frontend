import { getPassword } from "../api/password";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PasswordEntry{
    id: number,
    service_name: string,
    service_username : string,
    password? : string,
    notes?: string,
    site_url?: string
}


interface PasswordListProps{
    passwords : PasswordEntry[];
}


export default function EntryDetails( {passwords} : PasswordListProps){
    const navigate = useNavigate()

    const [entry, setEntry] = useState<PasswordEntry|null>(null)
    const {id} = useParams<{id : string}>()

    useEffect( ()=> {

        const fetchPassword = async () =>   {

            if (id){
                const entryId = Number(id)

                const FoundEntry = passwords.find(p => p.id === entryId)


                if (FoundEntry){
                    try{
                    const res = await getPassword(entryId)
                    const decPassword = res.password
                    setEntry({...FoundEntry, password: decPassword})

                    }
                    catch(err){
                    console.error("Error fetching password : ",err)
                    }
                }
            }    
        };
        fetchPassword();
    }, [id, passwords]);


    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState)
    };


    return (

        <div>
            {entry ? (
                <div>
                    <h1>Details for {entry.service_name}</h1>
                    <p>Username: {entry.service_username}</p>
                    <p>Password: {showPassword ? entry.password : "*******"}
                        <button onClick={togglePasswordVisibility }> {showPassword? "Hide" : "Show"} Password 
                        </button>
                    </p>
                    <p>Notes: {entry.notes}</p>
                    <p>Site URL: {entry.site_url}</p>
                    <button onClick={() => navigate(`/edit/${id}`)}>Edit</button>
                </div>
            ) : (
                <p>Entry Details Not Found</p>
            )}

        </div>

    )
}


    


