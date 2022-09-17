import '~/i18n'

import { Suspense } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'

import Footer from '~/components/Footer'
import Header from '~/components/Header'
import { persistor, store } from '~/store'
import routes from '~react-pages'

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <main font-sans h-full p="x-4 y-6" text="center black dark:neutral-1">
          <Header />
          <Suspense fallback={<div>Loading...</div>}>
            {useRoutes(routes)}
          </Suspense>
          <Footer />
        </main>
      </PersistGate>
    </Provider>
  )
}

export default App
