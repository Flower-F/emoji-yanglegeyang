import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

import ReactDOM from 'react-dom/client'
import ReactModal from 'react-modal'
import { BrowserRouter as Router } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

import App from './App'

ReactModal.setAppElement(document.getElementById('root') as HTMLElement)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Router>
    <App />
  </Router>,
)

if ('serviceWorker' in navigator) {
  registerSW()
}
