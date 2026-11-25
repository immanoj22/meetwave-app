import { Find, FindAndPopulate, FindOneAndUpdate, Findone } from "../Helper/mongooseHelper";
import User from "./Models/user_schema"


const userTable = { table: User }

export const userFind = async (data) => {
    let retData;
    retData = await Find({ ...userTable,...data })
    return retData;
}

export const userFindOne = async (data) => {
    let retData;
    retData = await Findone({ ...userTable,...data })
    return retData;
}


export const userFindOneAndUpdate = async (data) => {
    let retData;
    retData = await FindOneAndUpdate({ ...userTable, ...data })
    return retData;
}


export const userFindAndPopulate = async (data) => {
    let retData;
    retData = await FindAndPopulate({ ...userTable, ...data })
    return retData;
}