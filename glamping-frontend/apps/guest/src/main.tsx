import 'core-js/stable'
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@glamping/utils'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
