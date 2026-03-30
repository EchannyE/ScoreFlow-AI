import axios from 'axios'
 
const unwrapResponse = response => ({
  ...response,
  data: response.data?.data ?? response.data,
})

const get = (url, config) => api.get(url, config).then(unwrapResponse)
const post = (url, data, config) => api.post(url, data, config).then(unwrapResponse)
const patch = (url, data, config) => api.patch(url, data, config).then(unwrapResponse)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
 
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
 
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
 
export const authAPI = {
  login:    data => post('/api/auth/login', data),
  register: data => post('/api/auth/register', data),
  me:       ()   => get('/api/auth/me'),
}
 
export const campaignsAPI = {
  list:   params     => get('/api/campaigns', { params }),
  get:    id         => get(`/api/campaigns/${id}`),
  create: data       => post('/api/campaigns', data),
  update: (id, data) => patch(`/api/campaigns/${id}`, data),
  stats:  id         => get(`/api/campaigns/${id}/stats`),
}
 
export const submissionsAPI = {
  list:   params     => get('/api/submissions', { params }),
  mine:   ()         => get('/api/submissions/mine'),
  get:    id         => get(`/api/submissions/${id}`),
  create: data       => post('/api/submissions', data),
  assign: (id, evaluatorId) => patch(`/api/submissions/${id}/assign`, { evaluatorId }),
  update: (id, data) => patch(`/api/submissions/${id}`, data),
}
 
export const evaluationsAPI = {
  myQueue: ()     => get('/api/evaluations/my-queue'),
  list:    params => get('/api/evaluations', { params }),
  create:  data   => post('/api/evaluations', data),
}
 
export const notificationsAPI = {
  list:        ()  => get('/api/notifications'),
  markRead:    id  => patch(`/api/notifications/${id}/read`),
  markAllRead: ()  => patch('/api/notifications/read-all'),
}

export const usersAPI = {
  list: params => get('/api/users', { params }),
  get:  id     => get(`/api/users/${id}`),
}
 
export default api
 
 
