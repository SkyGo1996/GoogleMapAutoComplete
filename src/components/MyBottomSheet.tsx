import { useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import BottomSheet, { BottomSheetTextInput } from '@gorhom/bottom-sheet'

const MyBottomSheet = () => {
  const snapPoints = useMemo(() => ['40%', '60%'], [])

  return (
    <BottomSheet snapPoints={snapPoints}>
      <BottomSheetTextInput style={{ padding: 10, margin: 5, borderWidth: 1 }}/>
      <FlatList
        data={[ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]}
        renderItem={({ item }) => { return (
          <Text style={{ textAlign: 'center', fontSize: 50 }}>{item}</Text>
        ) }}
      />
    </BottomSheet>
  )
} 

export default MyBottomSheet