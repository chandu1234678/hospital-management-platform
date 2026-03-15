/**
 * Tests for Zustand authStore
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore.js'

const MOCK_USER = { id: 1, name: 'Arjun Mehta', email: 'arjun@deepthi.com', role: 'PATIENT', token: 'tok123' }

beforeEach(() => {
  // Reset store state between tests
  useAuthStore.setState({ user: null, isAuthenticated: false })
})

describe('authStore', () => {
  it('initial state is unauthenticated', () => {
    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('login sets user and isAuthenticated', () => {
    useAuthStore.getState().login(MOCK_USER)
    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toEqual(MOCK_USER)
    expect(isAuthenticated).toBe(true)
  })

  it('logout clears user and isAuthenticated', () => {
    useAuthStore.getState().login(MOCK_USER)
    useAuthStore.getState().logout()
    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  it('updateUser merges partial data into existing user', () => {
    useAuthStore.getState().login(MOCK_USER)
    useAuthStore.getState().updateUser({ name: 'Arjun Updated', phone: '9999999999' })
    const { user } = useAuthStore.getState()
    expect(user.name).toBe('Arjun Updated')
    expect(user.phone).toBe('9999999999')
    expect(user.email).toBe('arjun@deepthi.com') // unchanged
    expect(user.token).toBe('tok123') // unchanged
  })

  it('updateUser does not affect isAuthenticated', () => {
    useAuthStore.getState().login(MOCK_USER)
    useAuthStore.getState().updateUser({ name: 'Changed' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('multiple logins replace previous user', () => {
    const user2 = { id: 2, name: 'Admin', email: 'admin@deepthi.com', role: 'ADMIN', token: 'admintok' }
    useAuthStore.getState().login(MOCK_USER)
    useAuthStore.getState().login(user2)
    expect(useAuthStore.getState().user.email).toBe('admin@deepthi.com')
  })
})
