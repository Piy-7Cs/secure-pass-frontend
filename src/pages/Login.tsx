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

            if (!data.success) {
                setError(data.error || "Invalid credentials");
                return;
            }

            loginUser(data.data.access_token);
            navigate("/dashboard");
        }
        catch(err){
            setError("Invalid Credentials");
        }
    };


    return (

    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /> <br />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /> <br /> <br />
      <button type="submit">Login</button>
      <p onClick={() => navigate("/register")}>Register Instead</p>
      <p onClick={() => navigate("/forgot-password")}>Forgot Password?</p>  
      {error && <p>{error}</p>}
    </form>


    )

}

