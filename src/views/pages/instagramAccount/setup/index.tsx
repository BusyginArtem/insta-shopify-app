// ** Components
import InstagramAccountSetupLoaderView from './InstagramAccountSetupLoader'
import InstagramAccountSetupFormView from './InstagramAccountSetupForm'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Types
import type { Theme } from '@mui/material'
import type { InstagramSetupFormValues } from 'src/context/types'

type Props = {
  theme: Theme
}

const InstagramAccountSetupView = ({ theme }: Props) => {
  const auth = useAuth()
  const { loading, onHandleSetUp } = auth
  console.log('%c loading', 'color: green; font-weight: bold;', loading)
  const onSubmit = (data: InstagramSetupFormValues) => {
    onHandleSetUp(data)
  }

  return loading ? (
    <InstagramAccountSetupLoaderView theme={theme} />
  ) : (
    <InstagramAccountSetupFormView auth={auth} theme={theme} onSubmit={onSubmit} />
  )
}

export default InstagramAccountSetupView
