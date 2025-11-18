import qs from "qs";
import api from "./axiosInstance";

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function login(username: string, password: string): Promise<ApiResult<any>> {
  try {
    const res = await api.post(
      `/auth/token`,
      qs.stringify({ username, password, grant_type: "password" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.detail || err.message };
  }
}

export async function register(username: string, password: string, email: string): Promise<ApiResult<any>> {
  try {
    const res = await api.post(`/auth`, { username, password, email });
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.detail || err.message };
  }
}

export async function forgotPassword(email: string): Promise<ApiResult<any>> {
  try {
    const res = await api.post(`/auth/forgot-password`, { email });
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.detail || err.message };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ApiResult<any>> {
  try {
    const res = await api.post(`/auth/reset-password`, {
      reset_token: token,
      new_password: newPassword
    });
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.detail || err.message };
  }
}
