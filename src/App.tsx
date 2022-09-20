import '~/i18n'

import { Suspense } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'

import ComLoading from '~/components/ComLoading'
import TheErrorBoundary from '~/components/TheErrorBoundary'
import TheFooter from '~/components/TheFooter'
import TheHeader from '~/components/TheHeader'
import TheModal from '~/components/TheModal'
import ThePlayer from '~/components/ThePlayer'
import { persistor, store } from '~/store'
import routes from '~react-pages'

const App = () => {
  return (
    <TheErrorBoundary>
      <Provider store={store}>
        <TheModal />
        <ThePlayer />
        <PersistGate loading={null} persistor={persistor}>
          <main font-sans h-full p="x-4 y-6" text="center black dark:neutral-1">
            <TheHeader />
              <Suspense fallback={<div><ComLoading /></div>}>
                {useRoutes(routes)}
              </Suspense>
            <TheFooter />
          </main>
        </PersistGate>
      </Provider>
    </TheErrorBoundary>
  )
}

export default App
