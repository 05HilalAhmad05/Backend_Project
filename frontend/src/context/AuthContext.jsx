import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const refreshUser = async () => {
    try {
      const response = await api.get('/user/current-user')
      const currentUser = response?.data?.data ?? null
      setUser(currentUser)
      setAuthError('')
    } catch (error) {
      setUser(null)
      setAuthError('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (payload) => {
    try {
      const response = await api.post('/user/login', payload)
      const loggedInUser = response?.data?.data?.user ?? response?.data?.data ?? null
      setUser(loggedInUser)
      setAuthError('')
      return response.data
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed'
      setAuthError(message)
      throw new Error(message)
    }
  }

  const register = async ({ fullName, email, password, username, avatar }) => {
    try {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('username', username)

      if (avatar) {
        formData.append('avatar', avatar)
      }

      // Let the browser set multipart boundary automatically
      const response = await api.post('/user/register', formData)

      const registeredUser =
        response?.data?.data?.user ?? response?.data?.data ?? null
      setUser(registeredUser)
      setAuthError('')
      return response.data
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed'
      setAuthError(message)
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      await api.post('/user/logout')
    } catch (error) {
      console.error(error)
    } finally {
      setUser(null)
      setAuthError('')
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
