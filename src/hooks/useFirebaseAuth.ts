import { FacebookAuthProvider, getAuth } from '@firebase/auth'
import FirebaseApp from '../services/firebase'

export default function useFirebaseAuth(overrideConfig = null) {
  const app = FirebaseApp(overrideConfig)

  const fbProvider = new FacebookAuthProvider()

  fbProvider.addScope('email')
  fbProvider.addScope('public_profile')
  fbProvider.addScope('instagram_basic')
  fbProvider.addScope('instagram_manage_insights')
  fbProvider.addScope('pages_show_list')
  fbProvider.addScope('pages_read_engagement')
  fbProvider.addScope('pages_manage_metadata')
  fbProvider.addScope('pages_read_user_content')
  fbProvider.addScope('pages_manage_engagement')
  fbProvider.addScope('instagram_shopping_tag_products')
  fbProvider.addScope('business_management')
  fbProvider.setCustomParameters({
    display: 'dialog'
  })

  return {
    auth: getAuth(app),
    fbProvider
  }
}
