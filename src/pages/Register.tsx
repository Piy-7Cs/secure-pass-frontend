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
            const data = await register(username, password, email);
            if (data.success){
              navigate("/login")
            }
            else[
              setError("Registration Failed, Maybe try a Different username")
            ]
            
        }catch(err){
            setError("Registration failed, Maybe try a Different username")
        }
    };



    return (
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />  <br />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /> <br />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /> <br /> <br />
        <button type="submit">Register</button>
        <p onClick={() => navigate("/login")}>Already signed in? Login</p>
        {error && <p>{error}</p>}
      </form>
    );

}


