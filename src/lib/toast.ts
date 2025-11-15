// Toast utility with fallback for module resolution issues
interface ToastImplementation {
  success: (message: string) => void
  error: (message: string) => void
  loading: (message: string) => void
  dismiss: () => void
}

let toast: ToastImplementation

try {
  toast = require('react-hot-toast').default
} catch (error) {
  // Fallback toast implementation
  toast = {
    success: (message: string) => {
      console.log('✅ Success:', message)
      if (typeof window !== 'undefined') {
        window.alert(`Success: ${message}`)
      }
    },
    error: (message: string) => {
      console.error('❌ Error:', message)
      if (typeof window !== 'undefined') {
        window.alert(`Error: ${message}`)
      }
    },
    loading: (message: string) => {
      console.log('⏳ Loading:', message)
      return { id: 'loading' }
    },
    dismiss: (id?: string) => {
      console.log('Dismissed toast:', id)
    }
  }
}

export default toast