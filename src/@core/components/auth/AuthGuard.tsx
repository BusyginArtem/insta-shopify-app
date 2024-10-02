// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import useAuth from 'src/hooks/useAuth'

// ** Constants
import authConfig from 'src/configs/auth'
import { APP_ROUTES } from 'src/configs/constants'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(
    () => {
      if (!router.isReady) {
        return
      }

      if (auth.isReady && auth.user === null && !window.localStorage.getItem(authConfig.storageTokenKeyName)) {
        if (router.asPath !== APP_ROUTES.MAIN) {
          router.replace({
            pathname: APP_ROUTES.LOGIN,
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace(APP_ROUTES.LOGIN)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, router.isReady, auth.user, auth.isReady]
  )

  if (auth.loading || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
