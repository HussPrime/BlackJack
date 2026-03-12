import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Casino from './Casino.jsx'

createRoot(document.getElementById('root')).render(
  /*<StrictMode>*/
    <Casino />
  /*</StrictMode>*/,
)
