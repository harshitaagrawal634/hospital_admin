import axios from 'axios'
import auth from './auth'

const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const api = axios.create({
  baseURL: `${base}/api/v1`,
  timeout: 5000,
})

// Attach Authorization header when token is present
api.interceptors.request.use((config) => {
  const token = auth.getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
