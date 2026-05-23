// Real localStorage-backed storage for production
// Replace with your backend API calls when you add auth (Supabase, Firebase, etc.)

const PREFIX = 'georank_'

export const db = {
  get: (key) => {
    try {
      const val = localStorage.getItem(PREFIX + key)
      return val ? JSON.parse(val) : null
    } catch {
      return null
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(val))
    } catch {}
  },
  del: (key) => {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {}
  },
}
