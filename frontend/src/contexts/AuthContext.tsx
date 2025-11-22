'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@shared/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (role: UserRole, isAnonymous?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // TODO: Implement actual auth check
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (role: UserRole, isAnonymous = false) => {
    // TODO: Implement actual login logic
    console.log('Login:', { role, isAnonymous })
  }

  const logout = async () => {
    // TODO: Implement actual logout logic
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
