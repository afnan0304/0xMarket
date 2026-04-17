import { create } from 'zustand'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const ASSETS_ENDPOINT = import.meta.env.VITE_ASSETS_ENDPOINT || 'http://localhost:5000/api/assets'

const buildUrl = (path) => `${API_BASE_URL}${path}`

export const useMarketStore = create((set, get) => ({
  assets: [],
  assetsLoading: false,
  assetsError: null,
  health: null,
  healthLoading: false,
  healthError: null,
  prompt: '',
  geminiResult: null,
  geminiLoading: false,
  geminiError: null,

  setPrompt: (prompt) => set({ prompt }),

  fetchAssets: async () => {
    set({ assetsLoading: true, assetsError: null })

    try {
      const response = await fetch(ASSETS_ENDPOINT)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Asset fetch failed')
      }

      set({
        assets: Array.isArray(data?.assets) ? data.assets : [],
        assetsLoading: false,
      })
    } catch (error) {
      set({
        assetsLoading: false,
        assetsError: error.message || 'Unable to reach /api/assets',
      })
    }
  },

  fetchHealth: async () => {
    set({ healthLoading: true, healthError: null })

    try {
      const response = await fetch(buildUrl('/api/health'))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Health check failed')
      }

      set({ health: data, healthLoading: false })
    } catch (error) {
      set({
        healthLoading: false,
        healthError: error.message || 'Unable to reach /api/health',
      })
    }
  },

  sendGeminiPrompt: async () => {
    const { prompt } = get()

    if (!prompt.trim()) {
      set({ geminiError: 'Prompt is required before sending.' })
      return
    }

    set({ geminiLoading: true, geminiError: null, geminiResult: null })

    try {
      const response = await fetch(buildUrl('/api/gemini'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Gemini request failed')
      }

      set({ geminiResult: data?.reply || 'The dealer stays quiet. Try another signal.', geminiLoading: false })
    } catch (error) {
      set({
        geminiLoading: false,
        geminiError: error.message || 'Unable to reach /api/gemini',
      })
    }
  },
}))
