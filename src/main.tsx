import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { StoreProvider } from './data/store';
import { createLocalStore } from './data/local-store';
import { createRemoteStore } from './data/remote-store';
import './index.css';

const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY;
const store = hasFirebaseConfig ? createRemoteStore() : createLocalStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
