// ** React Imports
import { useEffect, useState } from 'react'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** MUI Components
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Button, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Config
import themeConfig from 'src/configs/themeConfig'

// ** Store
import { syncDBProducts } from 'src/store/products'
import { useAppDispatch } from 'src/store'
import { Box } from '@mui/system'

type Props = {
  loading: boolean
  opened: boolean
  onCloseModal: () => void
  onAddProducts: (vertexAIEnabled: boolean) => Promise<void>
}

const AddToShopModal = ({ opened, loading, onCloseModal, onAddProducts }: Props) => {
  const [vertexAIEnabled, setVertexAIEnabled] = useState(false)

  const handleSendProducts = async () => {
    await onAddProducts(vertexAIEnabled)

    onCloseModal()
  }

  const handleToggleVertexAIEnabled = () => {
    setVertexAIEnabled(!vertexAIEnabled)
  }

  return (
    <>
      <Dialog
        open={opened}
        maxWidth={'sm'}
        fullWidth={true}
        aria-labelledby='max-width-dialog-title'
        onClose={onCloseModal}
      >
        <DialogContent>
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
              Please wait while we're processing products.
            </Typography>
          </Box>

          <FormControlLabel
            control={<Switch checked={vertexAIEnabled} onChange={handleToggleVertexAIEnabled} />}
            label="Use Vertex AI to generate products' content."
          />

          <Stack flexDirection='row' justifyContent='flex-end' mt={8}>
            <LoadingButton loading={loading} variant='contained' sx={{ mb: 4 }} onClick={handleSendProducts}>
              Send
            </LoadingButton>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddToShopModal
