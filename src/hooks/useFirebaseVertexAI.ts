import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview'

import useFirebaseApp from './useFirebaseApp'

export default function useFirebaseVertexAI(overrideConfig = null) {
  const app = useFirebaseApp(overrideConfig)
  const vertexAI = getVertexAI(app)

  return {
    vertexAI,
    model: getGenerativeModel(vertexAI, { model: 'gemini-1.5-flash' })
  }
}
