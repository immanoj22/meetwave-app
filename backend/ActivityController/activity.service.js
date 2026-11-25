import Userplan from "../UserController/Models/userplan_schema"
import Event from "../ActivityController/Models/event_schema"

import { Find } from "../Helper/mongooseHelper"

const EventTable = { table: Event }

export const UserPlanfindOneAndUpdateService = async (find, update,userId) => {
    return await Userplan.findOneAndUpdate(find, update, { new: true }).populate(userId)

}

export const EventfindOneAndUpdateService = async (find, update,userId) => {
    return await Event.findOneAndUpdate(find, update, { new: true }).populate(userId)

}

export const activityFind = async (data) => {
    let retData;
    retData = await Find({ ...EventTable,...data })
    return retData;
}