import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import ProfileProvider from './contexts/ProfileContext.tsx';
import SocketProvider from './contexts/SocketContext.tsx';
import { Provider } from 'react-redux';
import store from './store/store.ts';
createRoot(document.getElementById('root')!).render(
  <Provider store={store} stabilityCheck='never'>
    <ProfileProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ProfileProvider>
  </Provider>
);
