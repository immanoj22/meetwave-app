// import config
// import axiosFunc from '../config/axiosFunc';

import axios from 'axios';
import { axiosFunc } from "../config/common";
import config from "../config/config"


const jwttoken = localStorage.getItem("token")
console.log("jwttoken", jwttoken);



//my axiosFunc


export const Getuserlists = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.BACK_URL}/Userlists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const GetBlockuserlists = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/blockeduser`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("respData", respData.data);
        // const response = DecryptData(respData?.data)
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const GetUnBlockuserlists = async (data) => {
    console.log("datadatadatadata", data);

    try {

        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/unblockeduser`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("respData", respData.data);
        // const response = DecryptData(respData?.data)
        // console.log("respData", response);

        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const Blockuser = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/Adminblockusers`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const adminAddcategory = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/adminAddcategory`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const categorylist = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/categorylist`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}


export const categorylistadmin = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/categorylistadmin`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const subcategorylist = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/subcategorylists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}


export const adminAddsubcategory = async (data) => {
    console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/adminAddsubcategory`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

//plans
export const PlansList = async () => {
    // console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'GET',
            'url': `${config.ADMIN_URL}/plansLists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            }
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const getplanlists = async () => {
    // console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'GET',
            'url': `${config.ADMIN_URL}/plansListsAdmin`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            }
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const Addplans = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/planAdd`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const Editplans = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/planEdit`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


export const deleteData = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/planDelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const planlistDelete = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/planlistDelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const hideshowplan = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/hideshowplan`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


//gender add
export const AddEditGender = async (data) => {
    console.log("AddEditGender", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/AddEditGender`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


export const Genderlists = async () => {
    // console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'GET',
            'url': `${config.ADMIN_URL}/Genderlists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            }
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

//email updates
export const addbulkusers = async (data) => {
    console.log("dafatata", data);
    try {
        var resp = await axiosFunc({

            'method': 'post',
            'url': `${config.ADMIN_URL}/exceltomail`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            'data': data
        })

        return resp.data;
    }
    catch (err) { console.log("err in bulk users", err) }
}

export const changeMaySent = async (data) => {
    console.log("token data", data)
    try {
        var resp = await axiosFunc({
            "method": "POST",
            "url": `${config.ADMIN_URL}/changemaysent`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data,
        })

        return resp.data;
    }
    catch (err) {
        console.log('add token err', err)
    }
}

export const sendSubscriberMail = async (data) => {
    console.log("sklfs", data)
    try {
        let respData = await axiosFunc({
            'method': 'POST',
            //   'url': `${config.ADMIN_URL}/SendMailsinissueUser`,
            'url': `${config.ADMIN_URL}/sendSubscribeMail`,

            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data,
        });

        //   let response = Decryptdata(respData?.data)
        return respData.data;
    } catch (error) {
        console.log('add token err', error)

    }
}

export const sendHelpAndfeedbackmail = async (data) => {
    console.log("sklfs", data)
    try {
        let respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/SendMailsinissueUser`,
            // 'url': `${config.ADMIN_URL}/sendSubscribeMail`,

            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data,
        });

        //   let response = Decryptdata(respData?.data)
        return respData.data;
    } catch (error) {
        console.log('add token err', error)

    }
}

export const getSubscribers = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/getSubscribers`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const getHelplists = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/getHelplists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const getfeedbacklist = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/getfeedbacklist`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const userhelpdelete = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/UserHelpdelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const userfeedbackdelete = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/Userfeedbackdelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

//Group lists
export const UnblockGrouplists = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/UnblockGrouplists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data

        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const BlockGrouplists = async (data) => {

    try {
        var resp = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/BlockGrouplists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data

        })
        console.log("tokonwer resp", resp.data)


        return resp.data;
    }
    catch (err) { console.log("err in gettok owner", err) }
}

export const BlockGroups = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/Adminblockgroups`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const editemailTemplateList = async (data) => {
    const resp = await axiosFunc({
        method: 'POST',
        url: `${config.ADMIN_URL}/editemailtemplate`,
        "headers": {
            "Content-Type": 'application/json',
            'Authorization': jwttoken

        },
        data: data,
    })
    console.log("ressss", resp.data);
    // let response = Decryptdata(resp?.data)
    return resp.data;

}

export const getemailTemplateList = async (data) => {
    const resp = await axiosFunc({
        method: 'GET',
        url: `${config.ADMIN_URL}/getEmailTemplateList`,
        "headers": {
            "Content-Type": 'application/json',
            'Authorization': jwttoken

        },
        "params":data
    })
    console.log("ressss", resp.data);
    return resp.data;
}

export const UserplanDetails = async (data) => {
    const resp = await axiosFunc({
        method: 'GET',
        url: `${config.ADMIN_URL}/userplanlists`,
        "headers": {
            "Content-Type": 'application/json',
            'Authorization': jwttoken

        },
        "params":data
    })
    console.log("ressss", resp.data);
    return resp.data;
}

export const GetEvents = async (data) => {
    console.log("datadatadatadata", data);

    try {

        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/Eventlists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params":data
        })
        console.log("respData", respData.data);
        // const response = DecryptData(respData?.data)
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const GetblockEvents = async (data) => {
    console.log("datadatadatadata", data);

    try {

        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/BlockEventlists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params":data
        })
        console.log("respData", respData.data);
        // const response = DecryptData(respData?.data)
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}


export const Adminblockevents = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/Adminblockevents`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const SubhobbyDelete = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/HobbiesDelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


export const EventDelete = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/eventdelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const PlansubscribeDelete = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/plansubscribelistdelete`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


//report
export const GetReportData = async (data) => {
    console.log("datadatadatadata", data);

    try {

        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/getReportData`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "params": data
        })
        console.log("respData", respData.data);
        // const response = DecryptData(respData?.data)
        // console.log("respData", response);

        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}


export const ReportGroup = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'POST',
            'url': `${config.ADMIN_URL}/GroupReport`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}


export const getsubcategorylist = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/subcategorylist`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const adminAddSubcategory = async (data) => {
    console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/adminAddSubcategory`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}

export const getGroupcategorylists = async (data) => {
    console.log("datadatadatadata", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/Groupcategorylists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const adminAddGroupCategory = async (data) => {
    console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/adminAddGroupCategory`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


export const getHobbieslists = async (data) => {
    console.log("datadatadatadataHobbieslists", data);

    try {
        const respData = await axiosFunc({

            'method': 'GET',
            'url': `${config.ADMIN_URL}/Hobbieslists`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken

            },

        })
        console.log("respData", respData.data);
        return respData.data;



    } catch (err) {
        console.log(err, "login__err")
        return err


    }

}

export const adminAddHobbies = async (data) => {
    console.log("datadatadatadata", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/adminAddHobbies`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}


export const getPrivacyPolicylists = async () => {
    try {
        const response = await axios.get(`${config.BACK_URL}/privacy-policy`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("Privacy Policy Response:", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching privacy policy:", error);
        throw error;
    }
};

export const refundUpdateStatus = async (data) => {
    console.log("Addplans", data);
    try {
        const respData = await axiosFunc({
            'method': 'POST',
            'url': `${config.ADMIN_URL}/refundUpdate`,
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': jwttoken
            },
            "data": data
        })
        console.log("respData", respData.data);
        return respData.data;
    } catch (err) {
        console.log(err, "login__err")
        return err
    }
}