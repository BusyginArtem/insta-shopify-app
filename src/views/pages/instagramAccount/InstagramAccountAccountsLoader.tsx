import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const InstagramAccountsLoader = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default InstagramAccountsLoader
