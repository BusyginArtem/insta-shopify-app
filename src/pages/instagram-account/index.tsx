import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import Box from '@mui/material/Box'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import AuthIllustrationWrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'
import InstagramAccountView from 'src/views/pages/instagramAccount'

// ** Hooks
import useAuth from 'src/hooks/useAuth'
import useFacebook from 'src/hooks/useFacebook'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'

const InstagramAccount = () => {
  // ** Hooks
  const router = useRouter()
  const { user, facebookAccessToken, onSelectInstagramAccount, onLogout, loading } = useAuth()
  const facebook = useFacebook(facebookAccessToken)

  useEffect(() => {
    if (!user?.uid && !loading) {
      // Todo fix error Abort fetching component for route: "/login"
      router.replace(APP_ROUTES.LOGIN)
    }
  }, [user?.uid, loading])

  return (
    <Box className='content-center'>
      <AuthIllustrationWrapper>
        <InstagramAccountView
          user={user}
          onLogout={onLogout}
          facebook={facebook}
          onSelectInstagramAccount={onSelectInstagramAccount}
        />
      </AuthIllustrationWrapper>
    </Box>
  )
}

InstagramAccount.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
InstagramAccount.authGuard = true

export default InstagramAccount
