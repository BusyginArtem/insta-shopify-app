import { ReactNode } from 'react'

import { Box } from '@mui/material'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import LoginCard from 'src/pages/login/components/cards/LoginCard'
import AuthIllustrationV1Wrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'

import useAuth from 'src/hooks/useAuth'

const LoginPage = () => {
  const { onLogin } = useAuth()

  return (
    <Box className='content-center'>
      <AuthIllustrationV1Wrapper>
        <LoginCard onLogin={onLogin} />
      </AuthIllustrationV1Wrapper>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
