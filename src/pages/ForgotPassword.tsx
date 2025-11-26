import { forgotPassword } from "../api/auth";
import { useState, type FormEvent } from "react";





export default function ForgotPassword(){



const [resetEmail, setResetEmail] = useState("")
const [message, setMessage] = useState("")
const [error, setError] = useState("")


const handleSubmit = async (e : FormEvent) => {
    e.preventDefault()
    setMessage("");
    setError("");

        try {
            const result = await forgotPassword(resetEmail)

            if(result.success){
                setMessage("Password Reset Link to the Registered Email Addres")
                console.log(result.data.email)
            }
            else{
                setError("Something Went Wrong")
            }
        }
        catch(error){
            console.error(error)
        }

}


 return (
    <form onSubmit={handleSubmit}>
        <p>Enter Email Id for password Reset</p>
        <input type="email" placeholder="Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}/>
        <button type="submit">Login</button>
        {message ? <p>{message}</p> : <p>{error}</p>}
    </form>
 )
}