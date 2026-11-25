// import config
import axios from '../config/axios';


export const AddSellLink = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axios({
            'url': `/admin/addsellLink`,
            'method': 'post',
            data
        })
        console.log("respDatadata",respData);
      
        return {
            status: respData.data.status,
            message: respData.data.message,
            result: respData.data.result
        }
    } catch (err) {
        console.log(err, "AddSellLink__err")
        return {
            status: 'error',
            message: err.response,
        }
    }

}

export const getLink = async () => {

    try {
        const respData = await axios({
            'url': `/admin/getsellLink`,
            'method': 'get',
        })

        return {
            status: respData.data.status,
            message: respData.data.message,
            result: respData.data.result
        }
    } catch (err) {
        console.log(err, "listlink_err")
        return {
            status: 'error',
            message: err.response.data,
        }
    }

}

export const EditSelllink = async (data) => {


    try {
        const respData = await axios({
            'url': `/admin/editSellink`,
            'method': 'post',
            'data': data
        })
        return {
            status: respData.data.status,
            message: respData.data.message,
            result: respData.data.result
        }
    } catch (err) {
        console.log(err, "EditBuylink__err")
        return {
            status: 'error',
            message: err.response.data,
        }
    }
}


export const DeleteSellLink = async (data) => {

    try {
        const respData = await axios({
            'url': `/admin/DeleteSellLink`,
            'method': 'post',
            'data': data
        })
        console.log("DeleteCmsDeleteCms", respData.data.status);
        return {
            status: respData.data.status,
            message: respData.data.message,
            result: respData.data.result
        }
    } catch (err) {
        console.log(err, "DeleteSellLink__err")
        return {
            status: 'error',
            message: err.response.data,
        }
    }
}