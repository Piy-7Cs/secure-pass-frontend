import axios from "axios";


const BASE_URL = "http://localhost:8000"

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})


api.interceptors.request.use(
    (config) => {
        const token =  localStorage.getItem("token");
        
        if (token){
                config.headers.Authorization = `Bearer ${token}`
        };
            
        return config;      
    },
    (error) => {Promise.reject(error)}
)


api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true

       try{

          const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {withCredentials: true})
          const newAccessToken = res.data.access_token;

          localStorage.setItem("token", newAccessToken);

       }catch(err){
          localStorage.removeItem("token");
          console.error("Token refresh failed:", err);
          
       }

    }
    return Promise.reject(error);
  }
);


export default api