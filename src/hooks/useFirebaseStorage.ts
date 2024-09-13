import { getStorage } from '@firebase/storage'

import useFirebaseApp from './useFirebaseApp'

export default function useFirebaseStorage(overrideConfig = null) {
  const app = useFirebaseApp(overrideConfig)
  
  return getStorage(app)
}
