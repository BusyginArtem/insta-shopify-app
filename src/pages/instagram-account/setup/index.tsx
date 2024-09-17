import { ReactNode } from 'react'

// ** @Mui
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import InstagramAccountSetupView from 'src/views/pages/instagramAccount/setup'
import AuthIllustrationV1Wrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '25rem' }
}))

const InstagramAccountSetup = () => {
  const theme = useTheme()

  return (
    <Box className='content-center'>
      <AuthIllustrationV1Wrapper>
        <Card>
          <CardContent sx={{ p: theme => `${theme.spacing(10.5, 8, 8)} !important` }}>
            <InstagramAccountSetupView theme={theme} />
          </CardContent>
        </Card>
      </AuthIllustrationV1Wrapper>
    </Box>
  )
}
InstagramAccountSetup.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
InstagramAccountSetup.authGuard = true

export default InstagramAccountSetup
