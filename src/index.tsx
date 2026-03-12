import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';
import App from './App';
import './index.css';
import { GlobalErrorBoundary } from './components/common/ErrorBoundary';
import './pwa';

/**
 * Custom IndexedDB persister for React Query
 */
const idbPersister = {
  persistClient: async (client: any) => {
    await set('react-query-cache', client);
  },
  restoreClient: async () => {
    return await get('react-query-cache');
  },
  removeClient: async () => {
    await del('react-query-cache');
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours for most data
      gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Persist the query client to IndexedDB
persistQueryClient({
  queryClient,
  persister: idbPersister as any,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Handle Vite chunk loading errors (e.g., when a new version is deployed)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error, reloading page...', event);
  window.location.reload();
});

// Handle unhandled promise rejections that might be fatal
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (event.reason instanceof Error) {
    console.error('Stack trace:', event.reason.stack);
  }
  // If it's a chunk load error that wasn't caught by vite:preloadError
  if (event.reason && (event.reason.name === 'ChunkLoadError' || event.reason.message?.includes('Failed to fetch dynamically imported module'))) {
    window.location.reload();
  }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);