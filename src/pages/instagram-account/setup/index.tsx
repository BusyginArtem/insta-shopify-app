import { ReactNode } from 'react'

// ** @Mui
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import InstagramAccountSetupView from 'src/views/pages/instagramAccount/setup'
import useFacebook from 'src/hooks/useFacebook'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'
import useFirebaseVertexAI from 'src/hooks/useFirebaseVertexAI'
import useFirebaseStorage from 'src/hooks/useFirebaseStorage'
import AuthIllustrationV1Wrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '25rem' }
}))

const InstagramAccountSetup = () => {
  const auth = useAuth()
  const theme = useTheme()
  const facebook = useFacebook(auth.facebookAccessToken)
  const firestore = useFirebaseFirestore()
  const vertex = useFirebaseVertexAI()
  const storage = useFirebaseStorage()

  return (
    <Box className='content-center'>
      <AuthIllustrationV1Wrapper>
        <Card>
          <CardContent sx={{ p: theme => `${theme.spacing(10.5, 8, 8)} !important` }}>
            <InstagramAccountSetupView
              auth={auth}
              theme={theme}
              facebook={facebook}
              firestore={firestore}
              vertex={vertex}
              storage={storage}
            />
          </CardContent>
        </Card>
      </AuthIllustrationV1Wrapper>
    </Box>
  )
}
InstagramAccountSetup.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
InstagramAccountSetup.authGuard = true

export default InstagramAccountSetup
