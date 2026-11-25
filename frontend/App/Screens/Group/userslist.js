import { FlatList, ImageBackground, Pressable, Text, View } from "react-native";
import { Images } from "../../Utilities/images";
import { deviceheight } from "../../Utilities/Dimensions";
import { Fontsize } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useState } from "react";


export default function Userlist() {
    const [users, setUsers] = useState([
        {
            name: "test",
            image: "",
            bio: "death"
        }
    ])
    return (

        <ImageBackground style={{ width: "100%", height: "100%" }} source={Images.homebg}  >
            <View style={{ width: "100%", alignItems: "center", flexDirection: "row", height: deviceheight * 0.075, justifyContent: "center" }} >
                <Pressable onPress={() => navigation.goBack()} style={{ width: "15%", alignItems: "center", height: "70%", justifyContent: "center", position: "absolute", left: "1%" }} >
                    {Images.back1}
                </Pressable>
                <Text style={{ color: "#fff", fontFamily: Fontsize.SemiBold, fontSize: RFValue(17), }} >{t('AddMembers')}</Text>

            </View>
            <View style={{ width: "100%", height: deviceheight * 0.15, }} >

            </View>

            <View style={{ width: "100%", height: deviceheight * 0.77,width:"90%" }} >
                <FlatList
                    data={users}
                    renderItem={({ item, index }) => (
                        <View style={{width:"100%",flexDirection:""}} >
                        </View>

                    )}

                />

            </View>
        </ImageBackground>

    )
}