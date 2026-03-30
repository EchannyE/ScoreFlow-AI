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
  login:    data => post('/auth/login', data),
  register: data => post('/auth/register', data),
  me:       ()   => get('/auth/me'),
}
 
export const campaignsAPI = {
  list:   params     => get('/campaigns', { params }),
  get:    id         => get(`/campaigns/${id}`),
  create: data       => post('/campaigns', data),
  update: (id, data) => patch(`/campaigns/${id}`, data),
  stats:  id         => get(`/campaigns/${id}/stats`),
}
 
export const submissionsAPI = {
  list:   params     => get('/submissions', { params }),
  mine:   ()         => get('/submissions/mine'),
  get:    id         => get(`/submissions/${id}`),
  create: data       => post('/submissions', data),
  assign: (id, evaluatorId) => patch(`/submissions/${id}/assign`, { evaluatorId }),
  update: (id, data) => patch(`/submissions/${id}`, data),
}
 
export const evaluationsAPI = {
  myQueue: ()     => get('/evaluations/my-queue'),
  list:    params => get('/evaluations', { params }),
  create:  data   => post('/evaluations', data),
}
 
export const notificationsAPI = {
  list:        ()  => get('/notifications'),
  markRead:    id  => patch(`/notifications/${id}/read`),
  markAllRead: ()  => patch('/notifications/read-all'),
}

export const usersAPI = {
  list: params => get('/users', { params }),
  get:  id     => get(`/users/${id}`),
}
 
export default api
 
 
