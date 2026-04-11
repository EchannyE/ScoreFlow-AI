  import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
})

const unwrapResponse = response => ({
  ...response,
  data: response.data?.data ?? response.data,
})

const get = (url, config) => api.get(url, config).then(unwrapResponse)
const post = (url, data, config) => api.post(url, data, config).then(unwrapResponse)
const patch = (url, data, config) => api.patch(url, data, config).then(unwrapResponse)
const put = (url, data, config) => api.put(url, data, config).then(unwrapResponse)
const del = (url, config) => api.delete(url, config).then(unwrapResponse)

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sf_token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const requestUrl = err.config?.url || ''
    const isAuthRoute =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/register')

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('sf_token')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

export const authAPI = {
  login: data => post('/api/auth/login', data),
  register: data => post('/api/auth/register', data),
  me: () => get('/api/auth/me'),
}

export const campaignsAPI = {
  list: params => get('/api/campaigns', { params }),
  get: id => get(`/api/campaigns/${id}`),
  create: data => post('/api/campaigns', data),
  update: (id, data) => patch(`/api/campaigns/${id}`, data),
  stats: id => get(`/api/campaigns/${id}/stats`),
}

export const submissionsAPI = {
  list: params => get('/api/submissions', { params }),
  mine: () => get('/api/submissions/mine'),
  get: id => get(`/api/submissions/${id}`),
  create: data => post('/api/submissions', data),
  assign: (id, evaluatorId) =>
    patch(`/api/submissions/${id}/assign`, { evaluatorId }),
  update: (id, data) => patch(`/api/submissions/${id}`, data),
}

export const evaluationsAPI = {
  myQueue: () => get('/api/evaluations/my-queue'),
  list: params => get('/api/evaluations', { params }),
  get: id => get(`/api/evaluations/${id}`),
  getSubmission: submissionId =>
    get(`/api/evaluations/submission/${submissionId}`),
  create: data => post('/api/evaluations', data),
  update: (id, data) => patch(`/api/evaluations/${id}`, data),
}

export const notificationsAPI = {
  list: () => get('/api/notifications'),
  markRead: id => patch(`/api/notifications/${id}/read`),
  markAllRead: () => patch('/api/notifications/read-all'),
}

export const usersAPI = {
  list: params => get('/api/users', { params }),
  get: id => get(`/api/users/${id}`),
}

export { api, get, post, patch, put, del }
export default api
