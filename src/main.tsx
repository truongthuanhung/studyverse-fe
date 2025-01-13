import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import ProfileProvider from './contexts/ProfileContext.tsx';
import SocketProvider from './contexts/SocketContext.tsx';
import { Provider } from 'react-redux';
import store from './store/store.ts';
import { MathJaxContext } from 'better-react-mathjax';
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ProfileProvider>
      <SocketProvider>
        <MathJaxContext>
          <App />
        </MathJaxContext>
      </SocketProvider>
    </ProfileProvider>
  </Provider>
);
