import CryptoJS, { AES, enc } from "react-native-crypto-js";

import { ENCODEKEY } from './constant';

export const EncryptData = (data) => {
    // console.log("SendDatas ==> ",data)
    try {
        const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);
        const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, ENCODEKEY).toString();
        return encryptedData;
    } catch (error) {
        console.error("Encryption error:", error);
        return false; // Or throw error if you prefer
    }
};

export const DecryptData = (data, name) => {
    try {
        // console.log("Decryptdata",name);
        // Directly decrypt the data using AES
        const bytes = CryptoJS.AES.decrypt(data, ENCODEKEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption is successful and produces valid JSON, parse it
        if (decryptedData) {
            return JSON.parse(decryptedData);
        } else {
            return null; // Or false
        }
    } catch (e) {
        return null; // Or false
    }
};

export const AppendData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        // If the value is an array, handle each item individually
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item?.type && (item?.size || item.uri)) {
                    formData.append(key, item); // Append file directly
                } else {
                    formData.append(key, item === "" ? item : EncryptData(item)); // Don't encrypt empty strings
                }
            });
        } else {
            // Check for empty string values and avoid encrypting them
            if (value === "") {
                formData.append(key, value); // Append empty string directly
            } else if (value?.type && (value?.size || value.uri)) {
                formData.append(key, value); // Append file directly
            } else {
                formData.append(key, EncryptData(value)); // Encrypt non-empty values
            }
        }
    });

    return formData; // Return the FormData object
};