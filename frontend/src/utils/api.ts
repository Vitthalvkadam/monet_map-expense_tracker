const BASE = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'moneymap-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null
/** Lets the auth context log the user out when the server says the token is no longer valid. */
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn
}

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Can’t reach the server. Make sure the backend is running.', 0)
  }

  if (res.status === 401 && auth && token) {
    onUnauthorized?.()
    throw new ApiError('Your session expired. Please sign in again.', 401)
  }
  if (!res.ok) {
    let message = 'Something went wrong. Please try again.'
    try {
      const json = await res.json()
      if (json?.message) message = json.message
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(message, res.status)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
  /** Login / signup: no token yet, and a 401 here just means "wrong password". */
  postPublic: <T>(path: string, body: unknown) => request<T>('POST', path, body, false),
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.')
