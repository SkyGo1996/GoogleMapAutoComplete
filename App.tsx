import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Main from './src/screens/map/main'
import { Provider } from 'react-redux'
import { store } from './src/redux/store'

const App = () => {

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Main/>
        </GestureHandlerRootView>
      </Provider>
    </SafeAreaProvider>
  )
}

export default App