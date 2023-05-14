import { createSlice } from "@reduxjs/toolkit"
import { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../store"

export interface IAddress {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox?: (string)[] | null;
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    icon?: string | null;
}

interface IAddressObj {
    query: string,
    addrArr: IAddress[],
    loading: boolean,
    error: string | null
}

const initialState: IAddressObj = {
    query: '',
    addrArr: [],
    loading: false,
    error: null
}

export const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        fetchAddresses: (state, action: PayloadAction<string>) => {
            state.query = action.payload
            state.loading = true
            state.error = null
        },
        fetchAddressFulfilled: (state, action: PayloadAction<IAddress[]>) => {
            state.loading = false
            state.addrArr = action.payload
        },
        fetchAddressFailed: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
        removeSearchAddresses: (state) => {
            state.addrArr = []
        },
        loadAddressesFromLocal: (state, action: PayloadAction<IAddress[]>) => {
            state.loading = false
            state.error = null
            state.addrArr = action.payload
            state.query = ''
        }
    },
})

export const { fetchAddresses, fetchAddressFulfilled, fetchAddressFailed, removeSearchAddresses, loadAddressesFromLocal } = addressSlice.actions
export const selectAddresses = (state: RootState) => state.addresses
export default addressSlice.reducer 