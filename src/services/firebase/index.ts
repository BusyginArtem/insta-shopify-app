import { FirebaseApp, getApp, getApps, initializeApp } from '@firebase/app'

type Config = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

type OverrideConfig = Partial<Config> | null

const firebaseConfig: Config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export default (overrideConfig: OverrideConfig = null): FirebaseApp => {
  if (getApps().length && overrideConfig) {
    return initializeApp({
      ...firebaseConfig,
      ...overrideConfig
    })
  }

  if (!getApps().length && firebaseConfig.apiKey) {
    return initializeApp(firebaseConfig)
  }

  return getApp()
}
