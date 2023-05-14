import { Action } from '@reduxjs/toolkit'
import { Observable, catchError, debounceTime, filter, map, repeat, switchMap, takeUntil } from 'rxjs'
import { IAddress, fetchAddressFailed, fetchAddressFulfilled, loadAddressesFromLocal } from '../slices/AddressSlices'
import { ajax } from 'rxjs/ajax'
import { fetchAddresses } from '../slices/AddressSlices'

const epic = (action$: Observable<Action>) => {
    return action$.pipe(
        filter(fetchAddresses.match),
        debounceTime(300),
        switchMap(action => (
            ajax.getJSON<IAddress[]>(`https://nominatim.openstreetmap.org/search?q=${action.payload}&format=json&limit=5`).pipe(
                map(res => fetchAddressFulfilled(res)),
                catchError(async (error) => fetchAddressFailed(error.message)),
            )
        )),
        takeUntil(action$.pipe(
            filter(loadAddressesFromLocal.match)
        )),
        repeat()
    )
}

export default epic