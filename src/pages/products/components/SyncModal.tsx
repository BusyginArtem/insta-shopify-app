// ** React Imports
import { useEffect } from 'react'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** MUI Components
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Config
import themeConfig from 'src/configs/themeConfig'

// ** Store
import { fetchDBProducts, syncDBProducts } from 'src/store/products'
import { useAppDispatch } from 'src/store'

type Props = {
  opened: boolean
  onCloseModal: () => void
}

const SyncModal = ({ opened, onCloseModal }: Props) => {
  const { facebookAccessToken, selectedInstagramAccount, shop, user } = useAuth()

  const theme = useTheme()
  const appDispatch = useAppDispatch()

  useEffect(() => {
    if (opened && user?.uid && shop?.id && selectedInstagramAccount?.id && facebookAccessToken) {
      ;(async () => {
        await appDispatch(
          syncDBProducts({
            shop,
            instagramAccountId: selectedInstagramAccount?.id,
            userId: user.uid,
            facebookAccessToken
          })
        )

        await appDispatch(fetchDBProducts({ shopId: shop.id }))

        setTimeout(() => {
          onCloseModal()
          toast.success('Products have been synchronized successfully.')
        }, 500)
      })()
    }

    if (opened && !facebookAccessToken) {
      onCloseModal()
      toast.error('Something went wrong! Try again or refresh your token.')
    }
  }, [opened, facebookAccessToken, shop?.id, user?.uid, selectedInstagramAccount?.id])

  return (
    <>
      <Dialog open={opened} maxWidth={'sm'} fullWidth={true} aria-labelledby='max-width-dialog-title'>
        <DialogContent>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={34} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                fill={theme.palette.primary.main}
                d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z'
              />
              <path
                fill='#161616'
                opacity={0.06}
                fillRule='evenodd'
                clipRule='evenodd'
                d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z'
              />
              <path
                fill='#161616'
                opacity={0.06}
                fillRule='evenodd'
                clipRule='evenodd'
                d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                fill={theme.palette.primary.main}
                d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z'
              />
            </svg>
            <Typography variant='h3' sx={{ ml: 2.5, fontWeight: 700 }}>
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h4' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Don't close or refresh the page!
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Please wait while we setup your shop.
            </Typography>
          </Box>
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SyncModal
