import FirebaseApp from '../services/firebase'

export default function useFirebaseApp(overrideConfig = null) {
  return FirebaseApp(overrideConfig)
}
