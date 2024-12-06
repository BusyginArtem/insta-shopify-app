declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_JWT_EXPIRATION: string
    NEXT_PUBLIC_JWT_SECRET: string
    NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET: string
    NEXT_PUBLIC_FIREBASE_API_KEY: string
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
    NEXT_PUBLIC_FIREBASE_APP_ID: string
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string
    NEXT_PUBLIC_FACEBOOK_APP_ID: string
    NEXT_PUBLIC_FACEBOOK_APP_SECRET: string
    NEXT_PUBLIC_FACEBOOK_VERSION: string
    NEXT_PUBLIC_FACEBOOK_SCOPE: string
    NEXT_PUBLIC_SHOPIFY_API_KEY: string
    SHOPIFY_API_KEY: string
    NODE_TLS_REJECT_UNAUTHORIZED: string
  }
}