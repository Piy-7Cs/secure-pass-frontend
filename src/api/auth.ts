import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"


export async function login(username : string, password : string) {
    const res = await axios.post(`${BASE_URL}/auth/token`, {username, password});
    return res.data
}

export async function register(username: string, email: string, password: string) {
    const res = await axios.post(`${BASE_URL}/auth`, {username, password, email})
    return res.data
}

export async function forgotPassword( email:string) {
    const res = await axios.post(`${BASE_URL}/auth/forgot-password`, { email })
    return res.data
}

export async function resetPassword(token: string, newPassword: string) {
    const res = await axios.post(`${BASE_URL}/auth/reset-password`, {
        "reset_token" : token,
        "new_password" : newPassword
    });
    return res.data
}