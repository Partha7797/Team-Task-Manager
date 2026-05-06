import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const fallbackApiUrl = isBrowser
  ? isLocalHost
    ? 'http://127.0.0.1:5000/api'
    : `${window.location.origin}/api`
  : 'http://127.0.0.1:5000/api';

export const API_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
