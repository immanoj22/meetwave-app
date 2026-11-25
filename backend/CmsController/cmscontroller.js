import { EncryptData, catchErrorResponse } from "../Helper/common";
import Cms from "./Models/cms_schema"
import fs from 'fs'
import Faq from "./Models/Faq_schema"

/*
 * METHOD : GET
 * BODY: (data)
 * URL : /v1/cms/getcmslistData
 */
export const getcmslistData = async (req, res) => {
  console.log("requestlistss", req.query);

  try {
    const { data } = req.query

    let resp = await Cms.findOne({ identifier: data })
    console.log("response", resp);
    return res.status(200).json(EncryptData({ status: true, message: "All lists", data: resp }))

  }
  catch (e) {
    console.log("getcmslist _err", e);
    catchErrorResponse(res, e)
  }

}


export const getcmslist = async (req, res) => {
  console.log("requestlistss", req.query);

  try {
    const { page, limit } = req.query
    const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
    let [resp, count] = await Promise.all([
      Cms.find({}).skip(skip).limit(limit),
      Cms.countDocuments({}),
    ])
    console.log("response", resp);
    return res.status(200).json(EncryptData({ status: true, message: "All Cms lists", data: resp, count: count }))

  }
  catch (e) {
    console.log("getcmslist _err", e);
    catchErrorResponse(res, e)

  }

}

/*
 * METHOD : POST
 * BODY: ( Title, Content, id, Link, identifier)
 * URL : /v1/cms/CmsEdit
 */
export const CmsEdit = async (req, res) => {
  console.log("responses_cmsedit", req.body, req.files);
  try {
    const { Title, Content, id, Link, identifier } = req.body
    let files = req?.files?.file;
    console.log("filessdd", req.files);

    let arr = []
    if (files) {

      const filePath = `./public/cmsimages/`;
      fs.mkdir(filePath, { recursive: true }, async (err) => {
        if (!Array.isArray(files)) {
          files = [req?.files?.file]

        }
        // console.log("Array.isArray(files),",files);
        if (Array.isArray(files)) {
          await Promise.all(files.map(async (img, i) => {
            console.log("imnmfar", img);
            var multiimg = Date.now() + i + '.webp'
            arr.push(multiimg)
            img.mv(filePath + multiimg)
          }))
        }
        let resp = await Cms.findOneAndUpdate({ _id: id }, { Title: Title, Content: Content, Link: Link, "image": arr });
        if (resp) {
          console.log("Response after updating CMS:", resp);
          return res.status(200).json(EncryptData({ "status": true, message: "CMS updated successfully", "data": resp }));
        } else {
          return res.status(200).json(EncryptData({ "status": false, message: "Cannot update Cms!" }));
        }
      }
      )
    }
    else {
      // let resp = await FindOneAndUpdate({ DBName: Cms, FinData: { question: question }, Updata: { $set: payload }, save: { new: true } })
      let resp = await Cms.findOneAndUpdate({ identifier: identifier }, { Title: Title, Content: Content, Link: Link })
      if (resp) {

        return res.status(200).json(EncryptData({ "status": true, "message": "CMS updated successfully", data: resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "Cannot update Cms!" }))
    }

  } catch (error) {
    catchErrorResponse(res, error)
  }
}

//faq
export const getFaqList = async (req, res) => {
  console.log("get social links",req.query)
  try {
    const { languageType,page, limit } = req.query
    const skip = ((page <= 0 ? 1 : parseInt(page)) - 1) * limit
    let resp;
    let count = await Faq.countDocuments({})
    if (!req.query || !languageType) {
      resp = await Faq.find({})
      // .skip(skip).limit(limit)
    }
    else {
      resp = await Faq.find({ languageType: req.query.languageType }).skip(skip).limit(limit)
    }
    if (resp) {
      console.log("data", resp)
      return res.status(200).json(EncryptData({ "status": true, "data": resp, count:count }))
    }
    else
      return res.status(200).json(EncryptData({ "status": true, "data": resp }))
  } catch (error) {
    catchErrorResponse(res, error)
  }


}

/*
* METHOD : POST
* BODY: ( answer, question, id)
* URL : /v1/cms/AddEditDeleteFAq
*/
/* export const AddEditDeleteFAq = async (req, res) => {
  
  console.log("resdfs", req.body)
  try {
    var data = req.body;

    if (data.action == "add") {

      var payload = {
        "question": data.question,
        "answer": data.answer
      }

      var faq = new Faq(payload);
      var resp = await faq.save()
      if (resp) {
        console.log("resp faq", resp)
        return res.status(200).json(EncryptData({ "status": true, "message": "Faq added successfully!", "data": resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "Cannot Add Faq!", "data": resp }))


    }
    else if (data.action == "edit") {

      var resp = await Faq.findByIdAndUpdate({ "_id": data.id }, { "answer": data.answer, "question": data.question }, { new: true })
      if (resp) {
        console.log("resp edit", resp)
        return res.status(200).json(EncryptData({ "status": true, "message": "Faq edited successfully!", "data": resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "Cannot edit Faq!", "data": resp }))



    } else {
      var resp = await Faq.findOneAndDelete({ "question": data.question })
      if (resp) {
        console.log("socal success", resp)
        return res.status(200).json(EncryptData({ "status": true, "message": "Faq deleted successfully!", "data": resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "failed to delete", "data": resp }))

    }
  } catch (error) {
    catchErrorResponse(res, error)
  }

} */



export const AddEditDeleteFAq = async (req, res) => {
  console.log("resdfs", req.body)
  try {
    var data = req.body;

    if (data.action == "add") {

      var payload = {
        "question": data.question,
        "answer": data.answer,
        "languageType": data.languageType || "english"
      }

      var faq = new Faq(payload);
      var resp = await faq.save()
      if (resp) {
        console.log("resp faq", resp)
        return res.status(200).json(({ "status": true, "message": "Faq added successfully!", "data": resp }))
      } else
        return res.status(200).json(({ "status": false, "message": "Cannot Add Faq!", "data": resp }))


    }
    else if (data.action == "edit") {

      var resp = await Faq.findByIdAndUpdate({ "_id": data.id }, { "answer": data.answer, "question": data.question, "languageType": data.languageType || "english"}, { new: true })
      if (resp) {
        console.log("resp edit", resp)
        return res.status(200).json(EncryptData({ "status": true, "message": "FAQ updated successfully!", "data": resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "FAQ Cannot updated!", "data": resp }))

    } else {
      var resp = await Faq.findOneAndDelete({ "question": data.question })
      if (resp) {
        console.log("socal success", resp)
        return res.status(200).json(EncryptData({ "status": true, "message": "FAQ deleted successfully!", "data": resp }))
      } else
        return res.status(200).json(EncryptData({ "status": false, "message": "FAQ failed to delete", "data": resp }))

    }
  } catch (error) {
    catchErrorResponse(res, error)
  }

}