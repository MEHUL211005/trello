import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { persistor } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import AuthInitializer from "./components/AuthInitializer";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
          <App />
          </AuthInitializer>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
