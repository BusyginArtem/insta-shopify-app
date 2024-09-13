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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string
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
