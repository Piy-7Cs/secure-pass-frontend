import { deletePassword } from "../api/password";
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
    onDelete : () => void;
    refreshEntries : () => Promise<void>;
}


export default function PasswordList({ passwords, onDelete, refreshEntries}: PasswordListProps){
    const navigate = useNavigate()

    const handleDelete = async (id: number) => {
        await deletePassword(id);
        await refreshEntries();
        onDelete();
    };

    return (
    <div>
      {passwords.map(p => (
        <div key={p.id}>
          <h3>{p.service_name}</h3>
          <p>URL: {p.site_url}</p>
          <button onClick={() => navigate(`/details/${p.id}`)}>Details</button>
          <button onClick={() => handleDelete(p.id)}>Delete</button>
        </div>
      ))}
    </div>

    )
}

