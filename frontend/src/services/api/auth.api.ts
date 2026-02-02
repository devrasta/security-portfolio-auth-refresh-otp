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
}
console.log(import.meta.env.VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', //  Envoie les cookies httpOnly
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
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

export { ApiError }
