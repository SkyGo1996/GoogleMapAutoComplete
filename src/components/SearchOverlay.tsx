import { Button, Icon, InputItem } from '@ant-design/react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { IAddress, removeSearchAddresses, fetchAddresses, loadAddressesFromLocal } from '../redux/slices/AddressSlices'
import { LocationContext } from '../screens/main'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated'

interface ISearchOverlay {
  loading: boolean
}

const SearchOverlay:React.FC<ISearchOverlay> = ({ loading }) => {
  const appDispatch = useAppDispatch()
  const appSelector = useAppSelector(state => state.addresses)
  const { height } = useWindowDimensions()
  const [ focusing, setFocusing ] = useState(false)
  const listHeight = useSharedValue(0)

  const _loadAddresses = async (query: string) => {
    if(query.length > 0){
      appDispatch(fetchAddresses(query))
    } else {
      const localAddresses = await AsyncStorage.getItem('addressesSave')
      if(localAddresses){
        const localAddressesJSON = JSON.parse(localAddresses)
        appDispatch(loadAddressesFromLocal(localAddressesJSON))
      }
    }
  }

  const _deleteSearchHistories = () => {
    Alert.alert("Delete", "Are you sure you want to delete ALL search histories?", [
      {
        text: "Yes",
        onPress: async () => {
          await AsyncStorage.removeItem('addressesSave')
          appDispatch(loadAddressesFromLocal([]))
        }
      },
      {
        text: "No"
      }
    ])
  }

  useEffect(() => {
    // autocomplete animation
    if(appSelector.addrArr.length > 0){
      listHeight.value = withTiming(height * 0.5, {
        duration: 500
      })
    } else {
      listHeight.value = withTiming(0, {
        duration: 500
      })
    }
  }, [appSelector.addrArr, height])

  return (
    loading ? <View/> :
    <View style={styles.WholeContainer}>
      <View style={styles.Container}>
        <InputItem
          placeholder='Search Address...'
          extra={
            <View style={styles.SearchIconContainer}>
              <Icon name='search' color='white'/>
            </View>}
          style={[styles.SearchInput, { borderColor: focusing ? '#3875F6' : 'grey'}]}
          onChangeText={_loadAddresses}
          autoCorrect={false}
          onFocus={() => {
            setFocusing(true)
            _loadAddresses(appSelector.query)
          }}
          onBlur={() => {
            setFocusing(false)
          }}
        />
      </View>
      <View style={[ styles.Container, styles.Card, { marginTop: 10 } ]}>
        {
          appSelector.loading ?
          <ActivityIndicator size='large'/> :
          appSelector.error ?
          <Text style={styles.ErrorText}>{appSelector.error}</Text> :
          <View>
            {
              appSelector.addrArr.length > 0 && appSelector.query.length == 0? 
              <Button 
                type="warning" 
                onPress={_deleteSearchHistories} 
                style={{ width: '90%', alignSelf: "center" }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="delete" style={{ color: 'white', marginRight: 10 }}/>
                    <Text style={{ color: 'white', fontSize: 18 }}>Delete Search Histories</Text>
                  </View>
                </Button>
              : null
            }
            <Animated.FlatList
              data={appSelector.addrArr}
              renderItem={({ item }) => <SearchResultItem item={item}/>}
              style={{ maxHeight: listHeight}}
            />
          </View>
        }
      </View>
    </View>
  )
}

interface ISearchResultItem {
  item: IAddress
}

const SearchResultItem:React.FC<ISearchResultItem> = ({ item }) => {
  const { fontScale } = useWindowDimensions()
  const appDispatch = useAppDispatch()
  const useLocationContent = useContext(LocationContext)

  const _saveToLocal = async () => {
    const storedAddresses = await AsyncStorage.getItem('addressesSave')
    if (storedAddresses){
      const addrArr = JSON.parse(storedAddresses)
      let newAddrArr = []
      if(Array.isArray(addrArr)){
        const foundAddrIndex = addrArr.findIndex((addr) => addr.lon == item.lon && addr.lat == item.lat)

        if(foundAddrIndex == -1){
          newAddrArr = [ item, ...addrArr ]
        } else {
          // set latest search to first element
          addrArr.splice(foundAddrIndex, 1)
          newAddrArr = [ item, ...addrArr ]
        }
      } else {
        newAddrArr = [ item ]
      }

      await AsyncStorage.setItem('addressesSave', JSON.stringify(newAddrArr))
    } else {
      await AsyncStorage.setItem('addressesSave', JSON.stringify([ item ]))
    }
  }

  const _deleteSearchHistory = (history: IAddress) => {
    Alert.alert("Delete", `Are you sure you want to delete ${history.display_name}?`, [
      {
        text: "Yes",
        onPress: async () => {
          const addrArr = await AsyncStorage.getItem('addressesSave')

          if(addrArr){
            let addrArrJson = JSON.parse(addrArr)
            if(Array.isArray(addrArrJson)){
              const newArr = addrArrJson.filter(addr => !(addr.lon == history.lon && addr.lat == history.lat))
              await AsyncStorage.setItem('addressesSave', JSON.stringify(newArr))
              appDispatch(loadAddressesFromLocal(newArr))
            }
          }
        }
      },
      {
        text: "No"
      }
    ])
  }

  return (
    <Button style={[ styles.ItemButton, { height: 40 * fontScale } ]} 
      onPress={() => {
        useLocationContent.setLocation({
          lat: item.lat,
          lon: item.lon
        })
        _saveToLocal()
        appDispatch(removeSearchAddresses())
      }}
      onLongPress={() => {_deleteSearchHistory(item)}}
    >
      <Text 
        style={styles.ItemButtonText} 
        numberOfLines={2}>{item.display_name}</Text>
    </Button>
  )
}

const styles = StyleSheet.create({
  WholeContainer: {
    zIndex: 100,
    position: 'absolute',
    width: '100%',
    top: '10%',
    paddingVertical: 20,
    backgroundColor: 'white',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        top: '7%',
      },
      android: {
        top: '1%'
      }
    })
  },
  Container: {
    width: '95%',
    backgroundColor: 'white',
    alignSelf: 'center'
  },
  SearchInput: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopWidth: 1, 
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    height: 50, 
    padding: 10
  },
  SearchIconContainer: {
    backgroundColor: '#3875F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 50, 
    width: 50, 
    borderTopRightRadius: 10, 
    borderBottomRightRadius: 10, 
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3875F6'
  },
  Card: {
    borderRadius: 10,
    shadowColor: '#171717',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  ErrorText: {
    color: 'red', 
    textAlign: 'center', 
    marginVertical: 10
  },
  ItemButton: {
    marginVertical: 5, 
    marginHorizontal: 20, 
    borderWidth: 0,
  },
  ItemButtonText: {
    textAlign: 'left', 
    width: '100%', 
    fontSize: 16, 
    color: 'black'
  }
})

export default SearchOverlay