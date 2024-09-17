import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import useAuth from 'src/hooks/useAuth'
import useFacebook from 'src/hooks/useFacebook'
import AuthIllustrationWrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'

import InstagramAccountView from 'src/views/pages/instagramAccount'

const InstagramAccount = () => {
  // ** Hooks
  const router = useRouter()
  const { user, facebookAccessToken, onSelectInstagramAccount, onLogout, loading } = useAuth()
  const facebook = useFacebook(facebookAccessToken)

  useEffect(() => {
    if (!user?.uid && !loading) {
      // Todo fix error Abort fetching component for route: "/login"
      router.replace('/login')
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
