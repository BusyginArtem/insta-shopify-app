// ** React
import { useState } from 'react'

// ** Components
import InstagramAccountSetupLoaderView from './InstagramAccountSetupLoader'
import InstagramAccountSetupFormView from './InstagramAccountSetupForm'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Types
import type { Theme } from '@mui/material'
import type { InstagramSetupFormValues } from 'src/types'

type Props = {
  theme: Theme
}

const InstagramAccountSetupView = ({ theme }: Props) => {
  const [loading, setLoading] = useState(false)

  const auth = useAuth()
  const { onHandleSetUp } = auth

  const onSubmit = async (data: InstagramSetupFormValues) => {
    setLoading(true)

    await onHandleSetUp(data)

    setLoading(false)
  }

  return loading ? (
    <InstagramAccountSetupLoaderView theme={theme} />
  ) : (
    <InstagramAccountSetupFormView auth={auth} theme={theme} onSubmit={onSubmit} />
  )
}

export default InstagramAccountSetupView
