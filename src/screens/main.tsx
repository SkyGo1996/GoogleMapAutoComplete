import { Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import MyBottomSheet from "../components/MyBottomSheet"
import SearchOverlay from "../components/SearchOverlay"
import { createContext, useState } from "react"

interface ILocation {
  lat: string,
  lon: string
}

export type ILocationContent = {
  setLocation: (location: ILocation) => void
}

export const LocationContext = createContext<ILocationContent>({
  setLocation: () => {}
})

const jsCode = "javascript:(function() { " +
// "document.getElementsByTagName('div')[26].style.display = 'none'; " +
// "document.getElementsByTagName('form')[0].style.display = 'none'; " +
"document.getElementById('searchbox').style.display='none';"
"})()"

const Main = () => {
  const insets = useSafeAreaInsets()
  const [ location, setLocation ] = useState<ILocation | undefined>()
  const [ webLoading, setWebLoading ] = useState(true)

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <LocationContext.Provider value={{ setLocation }}>
        <SearchOverlay loading={webLoading}/>
      </LocationContext.Provider>
      <WebView source={{ uri: `http://maps.google.com/maps?q=${location?.lat},${location?.lon}` }} 
        javaScriptEnabled={true}  
        injectedJavaScript={jsCode} 
        onMessage={(event) => {}}
        onLoadEnd={() => setWebLoading(false)}
      />
      {/* <MyBottomSheet/> */}
    </View>
  )
}

export default Main