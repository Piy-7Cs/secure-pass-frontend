import { useState, type FormEvent} from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Login(){
    const [username, setUsername] = useState("")
    const[password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()
    const { loginUser } = useAuth();


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const data = await login(username, password);
            loginUser(data.data("access_token"));
            navigate("/dashboard");
        }
        catch(err){
            setError("Invalid Credentials");
        }
    };


    return (

    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>


    )

}

