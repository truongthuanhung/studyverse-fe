import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ProfileProvider from './contexts/ProfileContext.tsx';
import SocketProvider from './contexts/SocketContext.tsx';
createRoot(document.getElementById('root')!).render(
  <ProfileProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </ProfileProvider>
);
