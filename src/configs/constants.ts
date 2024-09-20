export const APP_ROUTES = {
  MAIN: '/',
  LOGIN: '/login',
  INSTAGRAM_ACCOUNT: '/instagram-account',
  INSTAGRAM_ACCOUNT_SETUP: '/instagram-account/setup',
  PRODUCTS: '/products'
} as const

export const REQUEST_STATUTES = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
} as const

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived'
} as const
