import '~/i18n'

import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'

import Footer from '~/components/Footer'
import Header from '~/components/Header'
import routes from '~react-pages'

const App = () => {
  return (
    <main font-sans h-full p="x-4 y-6" text="center black dark:neutral-1">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        {useRoutes(routes)}
      </Suspense>
      <Footer />
    </main>
  )
}

export default App
