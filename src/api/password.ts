
import api from "./axiosInstance";



export async function createEntry(service_name: string, service_username: string, password: string, notes: string, site_url: string) {
    const res = await api.post(`/passwords/create_password`,{ service_name, service_username, password, notes, site_url })
    return res.data
}

export async function getEntries(){
    const res = await api.get(`/passwords`)
    return res.data
}


export async function getPassword(entry_id: Number) {
    const res = await api.get(`/passwords/${entry_id}`)
    return res.data
}



export async function updateEntry(entry_id: Number, service_name: string, service_username: string, password: string, notes: string, site_url: string) {
    const res = await api.put(`/passwords/${entry_id}`,
                 { service_name, service_username, password, notes, site_url })

    return res.data
}



export async function deletePassword(entry_id: Number) {
    const res = await api.delete(`/passwords/${entry_id}`)
    return res.data
}
