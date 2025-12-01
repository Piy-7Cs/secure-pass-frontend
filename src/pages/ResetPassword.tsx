import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { resetPassword } from "../api/auth";


export default function ResetPassword(){

    const navigate= useNavigate()
    const [newpassword, setPassword] = useState("")

    const {token} = useParams<{token: string}>()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const res = await resetPassword(token!, newpassword)
            if (res) navigate("/login")
        }
        catch(err){
            console.error("Failed to Reset Password", err)
        }

    }



    return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input type="password" placeholder="New Password" value={newpassword} onChange={e => setPassword(e.target.value)} /> <br /> <br />
      <button type="submit">Login</button>
    </form>
    )

}