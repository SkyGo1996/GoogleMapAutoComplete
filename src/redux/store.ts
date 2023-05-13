import { configureStore } from "@reduxjs/toolkit";
import addressReducer from './slices/AddressSlices'
import { createEpicMiddleware } from "redux-observable";
import addressEpic from './epics/addressEpic'

const epicMiddleware = createEpicMiddleware()

export const store = configureStore({
    reducer: {
        addresses: addressReducer
    },
    middleware: [epicMiddleware]
})

epicMiddleware.run(addressEpic)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch