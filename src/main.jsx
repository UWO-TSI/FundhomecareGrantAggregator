import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from "react-router-dom";
import { router } from './router';
import { AuthContextProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </>
  </StrictMode>,
)
