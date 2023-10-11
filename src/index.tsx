import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Initialization from './router'
import reportWebVitals from './reportWebVitals';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'
import './components/PasswordStrengthMeter/PasswordStrengthMeter.css'
import { QueryClient, QueryClientProvider } from "react-query";
import ToastProvider from './core/context/ToastContext';
import { GlobalProvider } from './core/context/GlobalContext';
import { LoadingProvider } from './core/context/LoadingContext';
import { AuthenticationProvider } from './core/context/AuthContext';
import ControlledToast from './components/Toast/Toastify';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient({});

root.render(
  <BrowserRouter>
    <LocalizationProvider dateAdapter={AdapterMoment}>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
          <LoadingProvider>
            <AuthenticationProvider>
              <GlobalProvider>
                <ControlledToast
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
                  <Initialization />
              </GlobalProvider>
            </AuthenticationProvider>
          </LoadingProvider>
      </ToastProvider>
    </QueryClientProvider>
    </LocalizationProvider>
  </BrowserRouter>
)
reportWebVitals();