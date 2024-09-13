import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Icon from 'src/@core/components/icon'

import type { AuthValuesType, InstagramAccountType } from 'src/context/types'

type Props = {
  accounts: InstagramAccountType[]
} & Pick<AuthValuesType, 'onSelectInstagramAccount'>

const InstagramAccountAccountsList = ({ accounts, onSelectInstagramAccount }: Props) => {
  return (
    <Box sx={{ mb: 6 }}>
      {accounts.map((account, index) => {
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: index !== accounts.length - 1 ? 4.5 : undefined
            }}
          >
            <Avatar alt={account?.username} src={account.profile_picture_url} />
            <Box
              sx={{
                ml: 4,
                rowGap: 1,
                columnGap: 4,
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant='h6'>{account.name || account.username}</Typography>
                <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                  @{account.username}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  aria-label='capture screenshot'
                  color='secondary'
                  onClick={() => {
                    onSelectInstagramAccount(account)
                  }}
                >
                  <Icon icon='ic:baseline-arrow-forward-ios' fontSize='inherit' />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default InstagramAccountAccountsList
