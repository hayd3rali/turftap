import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import userReducer from './userSlice'
import bookingReducer from './bookingSlice'
import themeReducer from './themeSlice'
import { courtsApi }   from '../api/courtsService'
import { slotsApi }    from '../api/slotsService'
import { bookingsApi } from '../api/bookingsService'

const store = configureStore({
  reducer: {
    user:    userReducer,
    booking: bookingReducer,
    theme:   themeReducer,
    [courtsApi.reducerPath]:   courtsApi.reducer,
    [slotsApi.reducerPath]:    slotsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(courtsApi.middleware)
      .concat(slotsApi.middleware)
      .concat(bookingsApi.middleware),
})

setupListeners(store.dispatch)
export default store

