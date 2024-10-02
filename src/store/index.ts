// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Redux
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

// ** Reducers
import products from 'src/store/products'
import shopify from 'src/store/shopify'

const store = configureStore({
  reducer: {
    products,
    shopify
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
// export const createAppAsyncThunk = createAsyncThunk.withTypes<{
//   state: RootState
//   dispatch: AppDispatch
//   rejectValue: string
//   // extra: { s: string; n: number }
// }>()

export default store
