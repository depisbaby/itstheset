import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import "@fontsource/courier-prime/400.css";

const response = await fetch("/api/clue");
const data = await response.json();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App clue={data.clue} />
  </StrictMode>,
)

