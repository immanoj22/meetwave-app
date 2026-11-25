import { View, ActivityIndicator, Modal } from 'react-native'
import React from 'react'

const Loadercomponent = ({visible,onClose}) => {
  return (
    <Modal 
     animationType='fade'
     visible={visible}
     transparent={true}   
     onRequestClose={() => onClose(false)}  
    >
      <View style={{flex:1,backgroundColor:"rgba(0,0,0,0.5)",justifyContent:"center"}}  >
        <View style={{height:60,width:"50%",alignItems:"center",borderRadius:10,justifyContent:"center",alignSelf:"center"}} >
          <ActivityIndicator style={{alignSelf:"center"}} size={"large"} color={"#fff"} />
        </View>
      </View>
      </Modal>
  )
}

export default Loadercomponent