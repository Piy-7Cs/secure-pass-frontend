import api from "./axiosInstance";
import { encryptSecret, decryptSecret } from "../utils/crypto";

export async function createEntry(
  service_name: string,
  service_username: string,
  password: string,
  notes: string,
  site_url: string
) {
  try {
    const res = await api.post(`/passwords/create_password`, {
      service_name: await encryptSecret(service_name),
      service_username: service_username ? await encryptSecret(service_username) : "",
      password: await encryptSecret(password),
      notes: notes ? await encryptSecret(notes) : "",
      site_url: site_url ? await encryptSecret(site_url) : "",
    });
    return res.data;
  } catch (err: any) {
    console.error("Error creating entry:", err.response?.data || err.message);
    return null;
  }
}

export async function getEntries() {
  try {
    const res = await api.get(`/passwords/`);
    const list = Array.isArray(res.data) ? res.data : [];

    return await Promise.all(
      list.map(async (item: any) => ({
        ...item,
        service_name: item.service_name ? await decryptSecret(item.service_name) : "",
        service_username: item.service_username ? await decryptSecret(item.service_username) : "",
        notes: item.notes ? await decryptSecret(item.notes) : "",
        site_url: item.site_url ? await decryptSecret(item.site_url) : "",
      }))
    );
  } catch (err: any) {
    console.error("Error fetching entries:", err.response?.data || err.message);
    return [];
  }
}

export async function getPassword(entry_id: number) {
  try {
    const res = await api.get(`/passwords/${entry_id}`);
    if (!res.data) return null;

    return {
      ...res.data,
      service_name: res.data.service_name ? await decryptSecret(res.data.service_name) : "",
      service_username: res.data.service_username ? await decryptSecret(res.data.service_username) : "",
      password: res.data.password ? await decryptSecret(res.data.password) : "",
      notes: res.data.notes ? await decryptSecret(res.data.notes) : "",
      site_url: res.data.site_url ? await decryptSecret(res.data.site_url) : "",
    };
  } catch (err: any) {
    console.error(`Error fetching password for id ${entry_id}:`, err.response?.data || err.message);
    return null;
  }
}

export async function updateEntry(
  entry_id: number,
  service_name: string,
  service_username: string,
  password: string,
  notes: string,
  site_url: string
) {
  try {
    const res = await api.put(`/passwords/${entry_id}`, {
      service_name: await encryptSecret(service_name),
      service_username: service_username ? await encryptSecret(service_username) : "",
      password: await encryptSecret(password),
      notes: notes ? await encryptSecret(notes) : "",
      site_url: site_url ? await encryptSecret(site_url) : "",
    });
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