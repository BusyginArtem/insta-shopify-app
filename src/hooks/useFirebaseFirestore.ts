import { getFirestore } from '@firebase/firestore'

import useFirebaseApp from './useFirebaseApp'

export default function useFirebaseFirestore(overrideConfig = null) {
  const app = useFirebaseApp(overrideConfig)

  return getFirestore(app)
}
