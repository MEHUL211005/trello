import React from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import RealtimeSync from './components/RealtimeSync'

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--toast-bg, #ffffff)",
            color: "var(--toast-text, #25253d)",
            border: "1px solid var(--toast-border, #e2e2f0)",
          },
        }}
      />
      <RealtimeSync />
      <AppRoutes />
    </>
  )
}

export default App
