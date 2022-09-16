import '~/i18n'

import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'

import routes from '~react-pages'

import Header from './components/Header'

const App = () => {
  return (
    <main font-sans p="x-4 y-6" text="center gray-700 dark:gray-200">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        {useRoutes(routes)}
      </Suspense>
    </main>
  )
}

export default App
