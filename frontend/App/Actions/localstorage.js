
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV(
    // {
    //     id: `meetwave2024`,
    //     encryptionKey: 'meetwave004'
    // }
)

export const SetItem = (key, value) => {
    try {
        var result = GetLocal()
        if (result) {
            result[key] = value
            storage.set("coonec", JSON.stringify(result))
        }
        else {
            var result = {}
            result[key] = value
            storage.set("coonec", JSON.stringify(result))
        }

    } catch (error) {
    }
}

export const GetLocal = () => {
    try {
        var result = storage.getString("coonec")
        return JSON.parse(result)
    } catch (error) {
        return {};
    }
}


export const GetItem = (key) => {
    try {
        var result = storage.getString("coonec")
        if (result) {
            var final = JSON.parse(result)
            return final[key]
        }
        else {
            return undefined
        }
    } catch (error) {
        return undefined
    }
}

export const RemoveItem = (key) => {
    try {
        var result = storage.getString("coonec")
        var final = JSON.parse(result)
        delete final[key]
        storage.set("coonec", JSON.stringify(final))
    } catch (error) {
    }
}


export const Clearlocal = () => {
    storage.clearAll()
} 
storage
