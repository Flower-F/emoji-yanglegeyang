import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Router>
    <App />
  </Router>,
)
