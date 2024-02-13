import axios from 'axios'

const baseURLMap = {
  development: 'http://localhost:3000',
  production: 'https://example.com',
  test: 'https://test.example.com',
}

const env = process.env.NEXT_PUBLIC_ENV as 'development' | 'production' | 'test'

export const api = axios.create({
  baseURL: `${baseURLMap[env ?? 'development']}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(undefined, (err) => {
  return Promise.reject(err.response?.data?.message || err.message || err)
})
