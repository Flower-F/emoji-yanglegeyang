import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

import ReactDOM from 'react-dom/client'
import ReactModal from 'react-modal'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

ReactModal.setAppElement(document.getElementById('root') as HTMLElement)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Router>
    <App />
  </Router>,
)
