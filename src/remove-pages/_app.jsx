// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// ** Next Imports
import Head from 'next/head'
// import { Router } from 'next/router'

// ** Loader Import
// import NProgress from 'nprogress'

// import { store } from 'src/store'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports

// import { defaultACLObj } from 'src/configs/acl'
// import themeConfig from 'src/configs/themeConfig'

// ** Fake-DB Import
// import 'src/@fake-db'

// ** Third Party Import
// import { Toaster } from 'react-hot-toast'

// ** Component Imports
// import UserLayout from 'src/layouts/UserLayout'
// import ThemeComponent from 'src/@core/theme/ThemeComponent'
// import AuthGuard from 'src/@core/components/auth/AuthGuard'
// import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
// import Spinner from 'src/@core/components/spinner'

// ** Contexts
// import { AuthProvider } from 'src/context/AuthContext'
import { SettingsProvider } from '@/@core/contexts/settingsContext'

// ** Styled Components
// import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
// import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import Link from 'next/link'

// const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
// if (themeConfig.routingLoader) {
//   Router.events.on('routeChangeStart', () => {
//     NProgress.start()
//   })
//   Router.events.on('routeChangeError', () => {
//     NProgress.done()
//   })
//   Router.events.on('routeChangeComplete', () => {
//     NProgress.done()
//   })
// }

// const Guard = ({ children, authGuard, guestGuard }) => {
//   if (guestGuard) {
//     return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
//   } else if (!guestGuard && !authGuard) {
//     return <>{children}</>
//   } else {
//     return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
//   }
// }

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    // Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
    Component.getLayout ?? (page => <div contentHeightFixed={contentHeightFixed}>{page}</div>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  // const aclAbilities = Component.acl ?? defaultACLObj

  const shopifyApiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY

  return (
    // <Provider store={store}>
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='shopify-api-key' content={shopifyApiKey} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src='https://cdn.shopify.com/shopifycloud/app-bridge.js' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <ui-nav-menu>
        <Link href='/' rel='home' />
        <Link href='/test'>TEST</Link>
      </ui-nav-menu>

      {/* <AuthProvider> */}
      <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
        {/* <SettingsConsumer>
              {({ settings }) => {
                return (
                  <ThemeComponent settings={settings}>
                    <Guard authGuard={authGuard} guestGuard={guestGuard}> */}
        {getLayout(<Component {...pageProps} />)}
        {/* </Guard>
                    <ReactHotToast>
                      <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                    </ReactHotToast>
                  </ThemeComponent>
                )
              }}
            </SettingsConsumer> */}
      </SettingsProvider>
      {/* </AuthProvider> */}
    </CacheProvider>
    // </Provider>
  )
}

export default App
