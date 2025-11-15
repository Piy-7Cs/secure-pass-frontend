import { useState, type FormEvent } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";


export default function Register(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate()


    const handleSubmit = async( e : FormEvent) => {
        e.preventDefault()

        try {
            await register(username, password, email);
            navigate("/login");
        }catch(err){
            setError("Registration failed")
        }
    };



    return (
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Register</button>
        {error && <p>{error}</p>}
      </form>
    );

}


