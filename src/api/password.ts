import api from "./axiosInstance";

export async function createEntry(service_name: string, service_username: string, password: string, notes: string, site_url: string) {
    try {
        const res = await api.post(`/passwords/create_password`, { service_name, service_username, password, notes, site_url });
        return res.data;
    } catch (err: any) {
        console.error("Error creating entry:", err.response?.data || err.message);
        return null; // or throw if you want to handle in component
    }
}

export async function getEntries() {
    try {
        const res = await api.get(`/passwords/`);
        console.log(res.data);
        return res.data;
    } catch (err: any) {
        console.error("Error fetching entries:", err.response?.data || err.message);
        return []; // return empty array if fetch fails
    }
}

export async function getPassword(entry_id: number) {
    try {
        const res = await api.get(`/passwords/${entry_id}`);
        return res.data;
    } catch (err: any) {
        console.error(`Error fetching password for id ${entry_id}:`, err.response?.data || err.message);
        return null;
    }
}

export async function updateEntry(entry_id: number, service_name: string, service_username: string, password: string, notes: string, site_url: string) {
    try {
        const res = await api.put(`/passwords/${entry_id}`, { service_name, service_username, password, notes, site_url });
        return res.data;
    } catch (err: any) {
        console.error(`Error updating entry ${entry_id}:`, err.response?.data || err.message);
        return null;
    }
}

export async function deletePassword(entry_id: number) {
    try {
        const res = await api.delete(`/passwords/${entry_id}`);
        return res.data;
    } catch (err: any) {
        console.error(`Error deleting entry ${entry_id}:`, err.response?.data || err.message);
        return null;
    }
}
