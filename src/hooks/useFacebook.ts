import FacebookService from '../services/facebook'

export default function useFacebook(accessToken: string) {
  const fb = new FacebookService(accessToken)

  return fb
}
