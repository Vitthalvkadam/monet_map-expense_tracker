import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { api, getToken, setToken, setUnauthorizedHandler } from '../utils/api'

interface AuthResponse {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  /** true while we check a saved token on page load */
  checking: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(() => !!getToken())

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  // Restore the session if a token is saved
  useEffect(() => {
    if (!getToken()) return
    api
      .get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.postPublic<AuthResponse>('/auth/login', { email, password })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.postPublic<AuthResponse>('/auth/signup', { name, email, password })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const value = useMemo(() => ({ user, checking, login, signup, logout }), [user, checking, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
