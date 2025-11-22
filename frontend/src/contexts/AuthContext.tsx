'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@shared/types'
import { apiClient } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  register: (phoneNumber: string, password: string) => Promise<void>
  loginAnonymous: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'safewatch_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        if (savedToken) {
          // Verify token and get user info
          const response = await apiClient.get<{ user: User }>('/auth/me', {
            token: savedToken,
          })
          setUser(response.user)
          setToken(savedToken)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const register = async (phoneNumber: string, password: string) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      '/auth/register',
      { phoneNumber, password }
    )

    setUser(response.user)
    setToken(response.token)
    localStorage.setItem(TOKEN_KEY, response.token)
  }

  const login = async (phoneNumber: string, password: string) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      '/auth/login',
      { phoneNumber, password }
    )

    setUser(response.user)
    setToken(response.token)
    localStorage.setItem(TOKEN_KEY, response.token)
  }

  const loginAnonymous = async () => {
    const response = await apiClient.post<{ user: User; token: string }>(
      '/auth/anonymous'
    )

    setUser(response.user)
    setToken(response.token)
    localStorage.setItem(TOKEN_KEY, response.token)
  }

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout', {}, { token })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginAnonymous, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
