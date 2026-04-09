export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface User {
  id: string
  email: string
  name: string
  twoFactorEnabled: boolean
}

export interface Session {
  id: string
  createdAt: string
  expiresAt: string
  lastUsedAt: string | null
  ipAddress: string | null
  userAgent: string | null
  deviceId: string | null
}

export interface ActivityLog {
  id: string
  action: string
  ipAddress: string | null
  userAgent: string | null
  country: string | null
  city: string | null
  createdAt: string
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const errorMessages: Record<string, string> = {
  'Invalid credentials': 'Identifiants invalides',
  'Invalid email': 'Adresse email invalide',
  'Weak password': 'Mot de passe trop faible',
  'User already exists': 'Un compte avec cet email existe déjà',
  'Current password is incorrect': 'Le mot de passe actuel est incorrect',
  'Refresh token not found': 'Session expirée, veuillez vous reconnecter',
  'Access token is required': 'Authentification requise',
  'Access token has expired': 'Session expirée, veuillez vous reconnecter',
  'Invalid access token': 'Session invalide, veuillez vous reconnecter',
  'User not found': 'Utilisateur introuvable',
  'Authentication failed': 'Échec de l\'authentification',
  'Token theft detected': 'Activité suspecte détectée, veuillez vous reconnecter',
}

function translateError(message: string): string {
  return errorMessages[message] || message
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(translateError(message))
    this.name = 'ApiError'
  }
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        onUnauthorized?.()
      }
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || 'Une erreur est survenue')
    }
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Erreur réseau ou serveur indisponible')
  }
}

// ════════════════════════════════════════════════════════
// AUTH API
// ════════════════════════════════════════════════════════

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async checkPasswordStrength(password: string): Promise<{ strength: number }> {
    return fetchApi<{ strength: number }>('/auth/password-strength', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  /**
   * Refresh
   * Utilise le refresh token du cookie httpOnly
   * Retourne un nouveau access token
   */
  async refresh(): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/auth/refresh', {
      method: 'POST',
    })
  },

  /**
   * Logout
   * Nécessite un access token valide
   */
  async logout(accessToken: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  /**
   * Get Profile
   * Récupère le profil de l'utilisateur connecté
   */
  async getProfile(accessToken: string): Promise<User> {
    return fetchApi<User>('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}

// ════════════════════════════════════════════════════════
// SESSIONS API
// ════════════════════════════════════════════════════════

export const sessionsApi = {
  async getActiveSessions(accessToken: string): Promise<{ data: Session[]; total: number }> {
    return fetchApi<{ data: Session[]; total: number }>('/sessions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  async revokeSession(accessToken: string, sessionId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}

// ════════════════════════════════════════════════════════
// ACTIVITY API
// ════════════════════════════════════════════════════════

export const activityApi = {
  async getRecentActivity(accessToken: string, limit = 5): Promise<ActivityLog[]> {
    return fetchApi<ActivityLog[]>(`/activity/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  async getActivityLogs(
    accessToken: string,
    params: { limit?: number; offset?: number; action?: string } = {},
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const query = new URLSearchParams()
    if (params.limit) query.set('limit', String(params.limit))
    if (params.offset) query.set('offset', String(params.offset))
    if (params.action) query.set('action', params.action)
    return fetchApi<{ data: ActivityLog[]; total: number }>(`/activity?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}

export { ApiError }
