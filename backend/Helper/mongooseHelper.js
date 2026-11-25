
import mongoose from "mongoose"
import { isEmpty } from "./common";
import User from "../UserController/Models/user_schema";
const ObjectId = mongoose.Types.ObjectId

export const Save = async (data) => {
  try {
    console.log("ddddddd", data)
    const { DBName, Data } = data;
    let savedata = new DBName(Data);
    let FindtheData = await savedata.save();
    return {
      status: FindtheData ? true : false,
      message: !isEmpty(FindtheData) ? "Saved Successfully" : "Try Again",
      data: FindtheData
    }
  } catch (err) {
    console.log("error", err)
  }

};

export const Find = async (data) => {
  const { table, findData, SelData, count, sort, limit, skip } = data;
  console.log("findData---->", findData);
  try {
    let finddata = {};
    if (count) {
      finddata = await table.find(findData ?? {}).count();
    } else {
      finddata = await table
        .find(findData ?? {}, SelData ?? {})
        .sort(sort ?? {})
        .skip(skip ?? 0)
        .limit(limit ?? Number.MAX_SAFE_INTEGER);
    }

    return {
      status: !isEmpty(finddata) ? true : false,
      success: !isEmpty(finddata) ? "success" : "error",
      data: !isEmpty(finddata) ? finddata : [],
    };
  } catch (e) {
    return { status: false, success: "error", message: e.toString() };
  }
};

export const Findone = async (data) => {
  const { table, findData, Seldata } = data;
  console.log("🚀 ~ Findone ~ data:", data);
  try {
    let findonedata = await table.findOne(findData, Seldata ?? {});
    return {
      status: !isEmpty(findonedata) ? true : false,
      data: !isEmpty(findonedata) ? findonedata : null,
      success: !isEmpty(findonedata) ? "success" : "error",
    };
  } catch (e) {
    return { status: false, message: e.toString(), success: "error" };
  }
};

export const FindOneAndUpdate = async (data) => {
  const { table, findData, UpdateData, Expr, push, pull } = data;
  console.log("adminfindupdate", data);

  try {
    // console.log( { ...{$set: UpdateData} ,...(push ? {$push:push} : {}),...(pull ? {$pull:pull} : {})})
    console.log(
      "FindOneAndUpdateFindOneAndUpdate",
      JSON.stringify(data, null, 2)
    );
    let updatedata = await table.findOneAndUpdate(
      findData,
      {
        ...(UpdateData ? { $set: UpdateData } : {}),
        ...(Expr ? Expr : {}),
        ...(push ? { $push: push } : {}),
        ...(pull ? { $pull: pull } : {}),
      },
      { new: true }
    );
    console.log("updatedata", updatedata);
    return {
      status: updatedata ? true : false,
      message: updatedata
        ? "Update Successfully"
        : "Nothing To Update.. Try Again",
      data: updatedata,
      success: updatedata ? "success" : "error",
    };
  } catch (e) {
    console.log("loogogog---->", e);
    return { success: "error", message: e.message.toString(), status: false };
  }
};

export const FindAndPopulate = async (data) => {
  try {
    var { table, findData, SelData, skip, limit, popu, sort } = data;
    console.log("datadatadatadata---->", data);
    (limit = Number(limit)), (skip = Number(skip));
    var FinOnData = await table
      .find(findData ?? {}, SelData ?? {})
      .sort(sort ?? {})
      .skip(skip ? skip : 0)
      .limit(limit ? limit : Number.MAX_SAFE_INTEGER)
      .populate(popu ?? {});
    return {
      status: !isEmpty(FinOnData) ? true : false,
      msg: !isEmpty(FinOnData) ? "Findall data" : "Data Not found",
      data: FinOnData,
      success: !isEmpty(FinOnData) ? "success" : "true",
    };
  } catch (e) {
    console.log("🚀 ~ FindAndPopulate ~ e:", e)
    return { status: false, message: e.toString(), success: "error" };
  }
};

export const Aggregate = async (data) => {
  const { DBName, Query, dataalone } = data;
  try {
    var Que = await DBName.aggregate(Query);
    if (dataalone) {
      return Que;
    }
    return {
      status: Que.length > 0 ? true : false,
      success: Que.length > 0 ? "success" : "error",
      message: "OK",
      data: Que,
    };
  } catch (e) {
    // Surface the real error so missing $geoNear indexes / bad operators are
    // visible in the backend log instead of being swallowed.
    console.error(
      "Aggregate error →",
      DBName?.collection?.name || DBName?.modelName,
      e?.message || e,
    );
    return { success: "error", message: e?.toString?.() ?? String(e) };
  }
};

export const getInstanceLastmessage = async (data) => {
  console.log("getInstanceLastmessage_234", data);
  try {
    const { DBName, uesrId, page, limit, type, latitude, longitude } = data
    const distanceKilometer = (data?.distanceKilometer && Number(data.distanceKilometer) > 0)
      ? Number(data.distanceKilometer)
      : 100000;
    const viewerHobbyObjectIds = (Array.isArray(data?.viewerHobbyIds) ? data.viewerHobbyIds : [])
      .map((id) =>
        id instanceof ObjectId
          ? id
          : ObjectId.isValid(String(id))
            ? new ObjectId(id)
            : null,
      )
      .filter(Boolean);

    let matchConditions = [
      { $eq: ["$isblocked", "unblocked"] },
    ];

    if (type === "groupchat") {
      matchConditions.push(
        { $eq: ["$isGroupchat", true] },
        { $eq: ["$iseventchat", false] }
      );
    }
    // if (type === "eventchat") {
    //   matchConditions.push(
    //   { $in: [new ObjectId(uesrId), "$members"] },
    //     { $eq: ["$isGroupchat", true] },
    //     { $eq: ["$iseventchat", true] }
    //   );
    // }
    // if (type === "eventchat") {
    //   matchConditions.push(
    //   { $in: [new ObjectId(uesrId), "$members"] },
    //     { $eq: ["$isGroupchat", true] },
    //     { $eq: ["$iseventchat", true] }
    //   );
    // }
    // let query = [

    //   // {
    //   //   $match: {
    //   //     $expr: {
    //   //       $and: [
    //   //         {
    //   //           $in: [new ObjectId(uesrId), "$members"]
    //   //         },
    //   //         {
    //   //           $eq: ["$isblocked", "unblocked"]
    //   //         },
    //   //         /* {
    //   //           $eq: ["$isGroupchat", true]
    //   //         }, */
    //   //         /* {
    //   //           $eq: ["$iseventchat", false]
    //   //         } */
    //   //       ]
    //   //     }
    //   //   },
    //   //   // $or: [
    //   //   //   { groupprivacystatus: false }, // Include public events/groups
    //   //   //   { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } } // Include followed users' events/groups
    //   //   // ]
    //   // },
    //   {
    //     $geoNear: {
    //       near: { type: "Point", coordinates: [longitude, latitude] },
    //       distanceField: "dist.calculated",
    //       spherical: true,
    //       key: "location",
    //       ...((type === "groupchat" && "$groupCreater" != userId) ? { maxDistance: 100000 } : {})
    //       // ...((type === "groupchat" && "$groupCreater" != new ObjectId(uesrId)) ? { maxDistance: 100000 } : {})
    //     }
    //   },
    //   {
    //     $match: {
    //       $expr: { $and: matchConditions }
    //     }
    //   },
    //   {
    //     $sort: { createdAt: -1 }
    //   },
    //   {
    //     $lookup: {
    //       from: "messages",
    //       let: { id: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {

    //               $eq: ["$instanceId", "$$id"]

    //             }
    //           }
    //         },
    //         {
    //           $sort: { createdAt: -1 }
    //         },

    //         {
    //           $limit: 1
    //         }
    //       ],
    //       as: "lastMessage"
    //     }
    //   },
    //   {
    //     $unwind:
    //     {
    //       path: "$lastMessage", preserveNullAndEmptyArrays: true
    //     }
    //   },
    //   {
    //     $sort: { "lastMessage.createdAt": -1 }
    //   },

    //   // {
    //   //   $lookup: {
    //   //     from: "users",
    //   //     localField: "members",
    //   //     foreignField: "_id",
    //   //     as: "membersDetails"
    //   //   }
    //   // },
    //   {
    //     $lookup: {
    //       from: "users",
    //       let: { members: { $ifNull: ["$members", []] } },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 {
    //                   $in: ["$_id", "$$members"]

    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
    //           }
    //         }
    //       ],
    //       as: "membersDetails"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       let: { requestUser: { $ifNull: ["$requestedUsers", []] } },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 {
    //                   $in: ["$_id", "$$requestUser"]

    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
    //           }
    //         }
    //       ],
    //       as: "requested_users"
    //     }
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "users",
    //   //     localField: "groupCreater",
    //   //     foreignField: "_id",
    //   //     as: "groupCreater"
    //   //   }
    //   // },
    //   {
    //     $lookup: {
    //       from: "users",
    //       let: { groupCreater: "$groupCreater" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 {
    //                   $eq: ["$_id", "$$groupCreater"]

    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
    //           }
    //         }
    //       ],
    //       as: "groupCreater"
    //     }
    //   },
    //   {
    //     $unwind:
    //     {
    //       path: "$groupCreater", preserveNullAndEmptyArrays: true
    //     }
    //   },
    //   //event
    //   // {
    //   //   $lookup: {
    //   //     from: "events",
    //   //     localField: "eventId",
    //   //     foreignField: "_id",
    //   //     as: "eventId"
    //   //   }
    //   // },
    //   {
    //     $lookup: {
    //       from: "events",
    //       let: { event_Id: "$eventId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 {
    //                   $eq: ["$_id", "$$event_Id"]

    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             _id: 1, eventTitle: 1, event_status: 1, eventRandomIndex: 1, eventprofile: 1
    //           }
    //         }
    //       ],
    //       as: "eventId"
    //     }
    //   },
    //   {
    //     $unwind:
    //     {
    //       path: "$eventId", preserveNullAndEmptyArrays: true
    //     }
    //   },
    //   //group hobbies
    //   {
    //     $lookup: {
    //       from: "adminHobbies",
    //       let: { grouphobbies: "$grouphobbies" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 {
    //                   $in: ["$_id", "$$grouphobbies"]
    //                 },
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             hobbyname: 1, plan: 1, planId: 1, _id: 1
    //           }
    //         }
    //       ],

    //       as: "grouphobbies"
    //     }
    //   },

    //   {
    //     $lookup: {
    //       from: "messages",
    //       let: { id: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$instanceId", "$$id"] },
    //                 { $in: [new ObjectId(uesrId), "$groupmembers"] },
    //                 { $not: { $in: [new ObjectId(uesrId), "$seenStatus.seen"] } },
    //               ]

    //             }
    //           }
    //         },
    //         {
    //           $count: "unread"
    //         }
    //       ],
    //       as: "UnreadMessageCount"
    //     }
    //   },
    //   {
    //     $unwind: {
    //       path: "$UnreadMessageCount",
    //       preserveNullAndEmptyArrays: true
    //     }
    //   },
    //   // {
    //   //   $addFields: {
    //   //     UnreadMessageCount: {
    //   //       $ifNull: [{ $arrayElemAt: ["$UnreadMessageCount.unread", 0] }, 0]
    //   //     }
    //   //   }
    //   // }
    //   // {
    //   //   $project: {
    //   //     UnreadMessageCount: 1
    //   //   }
    //   // }

    //   ...(page ? [{ $skip: page }] : []),
    //   ...(limit ? [{ $limit: limit }] : [])
    // ];
    let query = [

      // 1) Always run geoNear **without** maxDistance
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "dist.calculated",
          spherical: true,
          key: "location"
        }
      },

      // 2) Your base conditions
      {
        $match: {
          $expr: { $and: matchConditions }
        }
      },

      // 3) Apply distance rule:
      // Every group (including ones you created) must be within the
      // requested radius of the active search location. Previously own
      // groups were always shown, which caused groups created in another
      // city to leak into the feed when the user moved.
      // Private chats you are already a member of remain visible regardless
      // of distance so existing conversations aren't hidden when you travel.
      {
        $match: {
          $expr: {
            $or: [
              // 1. Public groups within the active radius
              {
                $and: [
                  { $eq: ["$isPrivate", false] },
                  { $lte: ["$dist.calculated", distanceKilometer] }
                ]
              },

              // 2. Private chat → only if you are a member
              {
                $and: [
                  { $eq: ["$isPrivate", true] },
                  { $in: [new ObjectId(uesrId), "$members"] }
                ]
              }
            ]
          }
        }
      },
      // {
      //   $match: {
      //     $expr: {
      //       $or: [
      //         { $eq: ["$groupCreater", new ObjectId(uesrId)] },  // your own groups = always show
      //         { $lte: ["$dist.calculated", 100000] }             // others <= 100km
      //       ]
      //     }
      //   }
      //       },

      {
        $addFields: {
          mutualHobbiesCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$grouphobbies", []] },
                viewerHobbyObjectIds.length ? viewerHobbyObjectIds : [],
              ],
            },
          },
        },
      },

      {
        $sort: { mutualHobbiesCount: -1 },
      },

      ...(page ? [{ $skip: page }] : []),
      ...(limit ? [{ $limit: limit }] : []),

      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$instanceId", "$$id"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "lastMessage"
        }
      },

      {
        $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true }
      },

      {
        $lookup: {
          from: "users",
          let: { members: { $ifNull: ["$members", []] } },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$members"] }
              }
            },
            { $project: { name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1 } }
          ],
          as: "membersDetails"
        }
      },

      {
        $lookup: {
          from: "users",
          let: { requestUser: { $ifNull: ["$requestedUsers", []] } },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$requestUser"] }
              }
            },
            { $project: { name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1 } }
          ],
          as: "requested_users"
        }
      },

      {
        $lookup: {
          from: "users",
          let: { groupCreater: "$groupCreater" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$groupCreater"] } } },
            { $project: { name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1 } }
          ],
          as: "groupCreater"
        }
      },

      {
        $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true }
      },

      {
        $lookup: {
          from: "events",
          let: { event_Id: "$eventId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$event_Id"] } } },
            { $project: { _id: 1, eventTitle: 1, event_status: 1, eventRandomIndex: 1, eventprofile: 1 } }
          ],
          as: "eventId"
        }
      },

      {
        $unwind: { path: "$eventId", preserveNullAndEmptyArrays: true }
      },

      {
        $lookup: {
          from: "adminHobbies",
          let: { grouphobbies: "$grouphobbies" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$grouphobbies"] } } },
            { $project: { hobbyname: 1, plan: 1, planId: 1, _id: 1 } }
          ],
          as: "grouphobbies"
        }
      },

      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$instanceId", "$$id"] },
                    { $in: [new ObjectId(uesrId), "$groupmembers"] },
                    { $not: { $in: [new ObjectId(uesrId), "$seenStatus.seen"] } }
                  ]
                }
              }
            },
            { $count: "unread" }
          ],
          as: "UnreadMessageCount"
        }
      },

      {
        $unwind: { path: "$UnreadMessageCount", preserveNullAndEmptyArrays: true }
      },

    ];
    //   query.push({
    //     $match: {
    //       $expr: {
    //         $and: [
    //           {
    //             $eq: ["$isGroupchat", true]
    //           },
    //           {
    //             $eq: ["$iseventchat", true]
    //           }
    //         ]
    //       }
    //     }
    //   })
    // }
    console.log("rrrrrrrrrrrrrrr", JSON.stringify(query, null, 2));

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    // console.log("QueryResult435436", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
};

export const getInstanceEventLastmessage = async (data) => {
  console.log("getInstanceEventLastmessage_234", data);
  try {
    const { DBName, uesrId, page, limit, type } = data
    // let matchConditions = [
    //   { $in: [new ObjectId(uesrId), "$members"] },
    //   { $eq: ["$isblocked", "unblocked"] },
    // ];
    let query = [

      // {
      //   $match: {
      //     $expr: {
      //       $and: [
      //         {
      //           $in: [new ObjectId(uesrId), "$members"]
      //         },
      //         {
      //           $eq: ["$isblocked", "unblocked"]
      //         },
      //         /* {
      //           $eq: ["$isGroupchat", true]
      //         }, */
      //         /* {
      //           $eq: ["$iseventchat", false]
      //         } */
      //       ]
      //     }
      //   },
      //   // $or: [
      //   //   { groupprivacystatus: false }, // Include public events/groups
      //   //   { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } } // Include followed users' events/groups
      //   // ]
      // },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$isblocked", "unblocked"] },
              { $in: [new ObjectId(uesrId), "$members"] },
              { $eq: ["$isGroupchat", true] },
              { $eq: ["$iseventchat", true] }
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {

                  $eq: ["$instanceId", "$$id"]

                }
              }
            },
            {
              $sort: { createdAt: -1 }
            },

            {
              $limit: 1
            }
          ],
          as: "lastMessage"
        }
      },
      {
        $unwind:
        {
          path: "$lastMessage", preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      },

      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "members",
      //     foreignField: "_id",
      //     as: "membersDetails"
      //   }
      // },
      {
        $lookup: {
          from: "users",
          let: { members: { $ifNull: ["$members", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$members"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "membersDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { requestUser: { $ifNull: ["$requestedUsers", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$requestUser"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "requested_users"
        }
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "groupCreater",
      //     foreignField: "_id",
      //     as: "groupCreater"
      //   }
      // },
      {
        $lookup: {
          from: "users",
          let: { groupCreater: "$groupCreater" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$groupCreater"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "groupCreater"
        }
      },
      {
        $unwind:
        {
          path: "$groupCreater", preserveNullAndEmptyArrays: true
        }
      },
      //event
      // {
      //   $lookup: {
      //     from: "events",
      //     localField: "eventId",
      //     foreignField: "_id",
      //     as: "eventId"
      //   }
      // },
      {
        $lookup: {
          from: "events",
          let: { event_Id: "$eventId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$event_Id"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, eventTitle: 1, event_status: 1, eventRandomIndex: 1, eventprofile: 1
              }
            }
          ],
          as: "eventId"
        }
      },
      {
        $unwind:
        {
          path: "$eventId", preserveNullAndEmptyArrays: true
        }
      },
      //group hobbies
      {
        $lookup: {
          from: "adminHobbies",
          let: { grouphobbies: "$grouphobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$grouphobbies"]
                    },
                  ]
                }
              }
            },
            {
              $project: {
                hobbyname: 1, plan: 1, planId: 1, _id: 1
              }
            }
          ],

          as: "grouphobbies"
        }
      },

      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$instanceId", "$$id"] },
                    { $in: [new ObjectId(uesrId), "$groupmembers"] },
                    { $not: { $in: [new ObjectId(uesrId), "$seenStatus.seen"] } },
                  ]

                }
              }
            },
            {
              $count: "unread"
            }
          ],
          as: "UnreadMessageCount"
        }
      },
      {
        $unwind: {
          path: "$UnreadMessageCount",
          preserveNullAndEmptyArrays: true
        }
      },
      // {
      //   $addFields: {
      //     UnreadMessageCount: {
      //       $ifNull: [{ $arrayElemAt: ["$UnreadMessageCount.unread", 0] }, 0]
      //     }
      //   }
      // }
      // {
      //   $project: {
      //     UnreadMessageCount: 1
      //   }
      // }

      ...(page ? [{ $skip: page }] : []),
      ...(limit ? [{ $limit: limit }] : [])
    ];


    if (type === "eventchat") {
      query.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isGroupchat", true]
              },
              {
                $eq: ["$iseventchat", true]
              }
            ]
          }
        }
      })
    }
    console.log("rrrrrrrrrrr111111rrrr", JSON.stringify(query, null, 2));

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    // console.log("QueryResult435436", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
};


export const getInstanceLastmessageSocket = async (data) => {
  console.log("getInstanceLastmessage_234", data);
  try {
    const { DBName, uesrId, page, limit, type } = data
    // let matchConditions = [
    //   { $in: [new ObjectId(uesrId), "$members"] },
    //   { $eq: ["$isblocked", "unblocked"] },
    // ];

    let matchConditions = [
      // { $in: [new ObjectId(uesrId), "$members"] },
      { $eq: ["$isblocked", "unblocked"] },
    ];

    if (type === "groupchat") {
      matchConditions.push(
        { $eq: ["$isGroupchat", true] },
        { $eq: ["$iseventchat", false] }
      );
    }

    if (type === "eventchat") {
      matchConditions.push(
        { $in: [new ObjectId(uesrId), "$members"] },
        { $eq: ["$isGroupchat", true] },
        { $eq: ["$iseventchat", true] }
      );
    }
    let query = [

      // {
      //   $match: {
      //     $expr: {
      //       $and: [
      //         {
      //           $in: [new ObjectId(uesrId), "$members"]
      //         },
      //         {
      //           $eq: ["$isblocked", "unblocked"]
      //         },
      //         /* {
      //           $eq: ["$isGroupchat", true]
      //         }, */
      //         /* {
      //           $eq: ["$iseventchat", false]
      //         } */
      //       ]
      //     }
      //   },
      //   // $or: [
      //   //   { groupprivacystatus: false }, // Include public events/groups
      //   //   { userId: { $in: followedUserIds.map(id => new ObjectId(id)) } } // Include followed users' events/groups
      //   // ]
      // },

      {
        $match: {
          $expr: { $and: matchConditions }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {

                  $eq: ["$instanceId", "$$id"]

                }
              }
            },
            {
              $sort: { createdAt: -1 }
            },

            {
              $limit: 1
            }
          ],
          as: "lastMessage"
        }
      },
      {
        $unwind:
        {
          path: "$lastMessage", preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      },

      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "members",
      //     foreignField: "_id",
      //     as: "membersDetails"
      //   }
      // },
      {
        $lookup: {
          from: "users",
          let: { members: { $ifNull: ["$members", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$members"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "membersDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { requestUser: { $ifNull: ["$requestedUsers", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$requestUser"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "requested_users"
        }
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "groupCreater",
      //     foreignField: "_id",
      //     as: "groupCreater"
      //   }
      // },
      {
        $lookup: {
          from: "users",
          let: { groupCreater: "$groupCreater" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$groupCreater"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1, username: 1, _id: 1, location: 1, randomIndex: 1, profile: 1
              }
            }
          ],
          as: "groupCreater"
        }
      },
      {
        $unwind:
        {
          path: "$groupCreater", preserveNullAndEmptyArrays: true
        }
      },
      //event
      // {
      //   $lookup: {
      //     from: "events",
      //     localField: "eventId",
      //     foreignField: "_id",
      //     as: "eventId"
      //   }
      // },
      {
        $lookup: {
          from: "events",
          let: { event_Id: "$eventId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$event_Id"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, eventTitle: 1, event_status: 1, eventRandomIndex: 1, eventprofile: 1
              }
            }
          ],
          as: "eventId"
        }
      },
      {
        $unwind:
        {
          path: "$eventId", preserveNullAndEmptyArrays: true
        }
      },
      //group hobbies
      {
        $lookup: {
          from: "adminHobbies",
          let: { grouphobbies: "$grouphobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$grouphobbies"]
                    },
                  ]
                }
              }
            },
            {
              $project: {
                hobbyname: 1, plan: 1, planId: 1, _id: 1
              }
            }
          ],

          as: "grouphobbies"
        }
      },

      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$instanceId", "$$id"] },
                    { $in: [new ObjectId(uesrId), "$groupmembers"] },
                    { $not: { $in: [new ObjectId(uesrId), "$seenStatus.seen"] } },
                  ]

                }
              }
            },
            {
              $count: "unread"
            }
          ],
          as: "UnreadMessageCount"
        }
      },
      {
        $unwind: {
          path: "$UnreadMessageCount",
          preserveNullAndEmptyArrays: true
        }
      },
      // {
      //   $addFields: {
      //     UnreadMessageCount: {
      //       $ifNull: [{ $arrayElemAt: ["$UnreadMessageCount.unread", 0] }, 0]
      //     }
      //   }
      // }
      // {
      //   $project: {
      //     UnreadMessageCount: 1
      //   }
      // }

      ...(page ? [{ $skip: page }] : []),
      ...(limit ? [{ $limit: limit }] : [])
    ];

    if (type === "groupchat") {
      query.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isGroupchat", true]
              },
              {
                $eq: ["$iseventchat", false]
              }

            ]
          }
        }

      })
    }

    if (type === "eventchat") {
      query.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isGroupchat", true]
              },
              {
                $eq: ["$iseventchat", true]
              }
            ]
          }
        }
      })
    }
    console.log("QueryResult435436", JSON.stringify(query, null, 2));

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    // console.log("QueryResult435436", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
};

export const UserPlandetails = async (data) => {
  console.log("datsss", data);
  try {
    const { DBName, page, limit, searchtext } = data
    let query = [
      {
        $match: { "delete": false }
      },
      {
        $lookup: {
          from: "plan",
          let: { planId: "$planId" },
          pipeline: [
            {
              $unwind: "$plan_days"
            },
            {
              $match: {
                $expr: {
                  $eq: ["$plan_days._id", "$$planId"]
                }
              }
            }
          ],
          as: "plandays"
        }
      },
      { $unwind: "$plandays" },

      {
        $lookup: {
          from: "users",
          let: { user_id: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$user_id"]
                }
              }
            },
            {
              $project: {
                _id: 1, username: 1, name: 1, email: 1
              }
            }
          ],
          as: "User"
        }
      },
      { $unwind: "$User" },
      ...(searchtext ? [{
        $match: {
          $or: [
            { "User.username": { $regex: new RegExp(`^${searchtext}`, "i") } },
            { "User.name": { $regex: new RegExp(`^${searchtext}`, "i") } },
            { "User.email": { $regex: new RegExp(`^${searchtext}`, "i") } },
            ...(ObjectId.isValid(searchtext) ? [{ _id: new ObjectId(searchtext) }] : []),
          ]
        }
      }] : []),
      // {
      //   $count: "User"
      // },
      // {
      //   $project: {
      //     "plandays": 1,
      //     "planDays": 1,
      //     "planPrice": 1,
      //     "startDate": 1,
      //     "EndDate": 1,
      //     "isActive": 1,
      //     "createdAt": 1,
      //     "User": {
      //       name: "$User.name",
      //       username: "$User.username"
      //     }
      //   }
      // },
      {
        $sort: { "createdAt": -1 }
      },
      {
        $facet: {
          data: [
            {
              $project: {
                plandays: 1,
                "planDays": 1,
                "planPrice": 1,
                startDate: 1,
                EndDate: 1,
                isActive: 1,
                subscriptionStatus: 1,
                createdAt: 1,
                User: 1,
                _id: 1
              }
            },
            ...(page ? [{ $skip: page }] : []),
            ...(limit ? [{ $limit: limit }] : [])
          ],
          totalCount: [{ $count: "count" }]
        }
      }

      // ...(page ? [{ $skip: page }] : []),
      // ...(limit ? [{ $limit: limit }] : [])
    ];
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    // console.log("QueryResult", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
}

export const UserHobbysearch = async (data) => {
  console.log("UserHobbysearch_datsss", data);
  try {
    const { DbName, hobbyname = "", page, skip, limit } = data;
    const regex = `^${hobbyname}`;

    const Matchfinddata = [
      {
        $match: {
          hideshow: "visible",
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                hideshow: "visible",
                $expr: {
                  $eq: ["$categoryId", "$$categoryId"]
                }
              }
            },
            {
              $lookup: {
                from: 'adminHobbies',
                let: { categoryId: '$$categoryId', subcategoryId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      hideshow: "visible",
                      $expr: {
                        $and: [
                          {
                            $eq: ['$categoryId', '$$categoryId'],
                          },
                          {
                            $eq: [{ $toObjectId: '$subcategoryId' }, '$$subcategoryId'],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $match: {

                      $or: [
                        { hobbyname: { $eq: "" } },
                        {
                          hobbyname: {
                            // $regex: new RegExp(`^${hobbyname}`, "i")
                            $regex: regex, $options: 'i'


                          }
                        }
                      ]
                    }
                  },
                  // ...(Object.keys(hobbyMatch).length ? [{ $match: hobbyMatch }] : []),
                  { $sort: { order: 1 } },
                ],

                as: 'Hobbies',
              },

            },
            { $sort: { order: 1 } },
          ],
          as: 'subcategory'
        },

      },
      {
        $lookup: {
          from: 'adminHobbies',
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                hideshow: "visible",
                $expr: {
                  $and: [
                    {
                      $eq: ['$categoryId', '$$categoryId']
                    },
                    {
                      $eq: ['$subcategoryId', '000000000000000000000000']
                    }
                  ]
                }
              }
            },
            {
              $match: {

                $or: [
                  { hobbyname: { $eq: "" } },
                  {
                    hobbyname: {
                      // $regex: new RegExp(`^${hobbyname}`, "i")
                      $regex: regex, $options: 'i'
                    }
                  }
                ]
              }
            },
            { $sort: { order: 1 } },
          ],
          as: "Hobbies"
        },

      },
      { $sort: { order: 1 } },
      {
        $project: {
          category: 1,
          description: 1,
          hideshow: 1,
          createdAt: 1,
          updatedAt: 1,
          subcategory: {
            $concatArrays: [
              "$subcategory", "$Hobbies"
            ]
          }
        }
      },
      ...(page && page != -1 && page != "all" ? [{ $skip: skip }] : []),
      ...(page && page != -1 && page != "all" ? [{ $limit: limit }] : [])
    ];

    const Agg = await Aggregate({ Query: Matchfinddata, DBName: DbName });
    // console.log("hobbbies", JSON.stringify(Agg, null, 2))
    return Agg;
  } catch (error) {
    console.error("Error in UserHobbysearch:", error);
  }
};

export const eventWithUserDetails = async (data) => {
  // console.log("datsss", data);
  try {
    const { DbName, eventId } = data
    const eventWithUserDetails = [
      { $match: { _id: new ObjectId(eventId) } },
      {
        $lookup: {
          from: "users",
          localField: "eventinterested.userId",
          foreignField: "_id",
          as: "eventinterestedUsers"
        }
      },
      {
        $unwind: {
          path: "$eventinterested",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "eventinterested.userId",
          foreignField: "_id",
          as: "eventinterested.userDetails"
        }
      },
      {
        $unwind: {
          path: "$eventinterested.userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      { $match: { "eventinterested.joinstatus": true } },
      {
        $project: {
          _id: 1,
          location: 1,
          userId: 1,
          eventTitle: 1,
          startDate: 1,
          endDate: 1,
          description: 1,
          image: 1,
          event_status: 1,
          privacy_status: 1,
          eventinterested: 1,
          eventAddress: 1,
          eventhobbies: 1,
          updatedAt: 1,
          createdAt: 1
        }
      }
    ];
    var Agg = await Aggregate({ Query: eventWithUserDetails, DBName: DbName });
    // console.log("QueryResult", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
}

// export const SubcategoryLists = async (data) => {
//   console.log("datsss", data);
//   try {
//     const { DbName, hobbyname } = data
//     const query = [
//       {
//         $match: {
//           $expr: {
//             $and: [
//               {
//                 $or: [
//                   {
//                     $eq: [hobbyname, ""]
//                   },
//                   {
//                     $regexMatch: {
//                       input: "$hobbyname",
//                       regex: new RegExp(`^${hobbyname}`, "i"),
//                     }
//                   },
//                   {
//                     $regexMatch: {
//                       input: "$plan",
//                       regex: new RegExp(`^${hobbyname}`, "i"),
//                     }
//                   },

//                 ]
//               }
//             ]
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: "categories",
//           let: { id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     {
//                       $in: ["$$id", "$subcategoryId"]
//                     },

//                   ]
//                 }
//               }
//             }
//           ],
//           as: "category"
//         },

//       },
//       {
//         $sort: { "createdAt": -1 }
//       }
//     ];
//     var Agg = await Aggregate({ Query: query, DBName: DbName });
//     // console.log("QueryResult", JSON.stringify(Agg, null, 2));
//     return Agg;
//   } catch (error) {
//     console.log("error", error);
//   }
// }


export const GetCurrentMessage = async (data) => {
  console.log("GetCurrentMessage", data);
  try {
    const { DbName, userId } = data
    let query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $in: [new ObjectId(userId), "$members"]
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [userId, "$$id"]
                }
              }
            },
            {
              $sort: { timestamp: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "lastMessage"
        }
      },
      {
        $unwind:
        {
          path: "$lastMessage", preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { "lastMessage.timestamp": -1 }
      },

      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "members",
      //     foreignField: "_id",
      //     as: "membersDetails"
      //   }
      // },

    ];

    var Agg = await Aggregate({ Query: query, DBName: DbName });
    console.log("QueryResult_Messagess", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error)
  }

}

export const SingleUserDetails = async (data) => {
  console.log("dat_SingleUserDetails", data);
  try {
    const { from, to, myLocation, DbName } = data
    // const longitude = parseFloat(myLocation.coordinates[0]);
    // const latitude = parseFloat(myLocation.coordinates[1]);

    let respdata = await DbName.findOne({ _id: new ObjectId(to) })
    const fromId = from ? new ObjectId(from) : null;
    const toId = to ? new ObjectId(to) : null;
    let query = [
      // {
      //   $geoNear: {
      //     near: {
      //       type: "Point",
      //       coordinates: [longitude, latitude]
      //     },
      //     distanceField: "distanceInMeters",
      //     spherical: true,

      //   }
      // },
      // {
      //   $addFields: {
      //     distanceInKm: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 2] }
      //   }
      // },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$_id", new ObjectId(respdata?._id)],
              },
              {
                $eq: ["$delete", false]
              },
              // {
              //   $eq: ["$ishidehobbies", false]
              // },
              // {
              //   $eq: ["$ishideevent", false]
              // }
            ]
          }
        }
      },

      {
        $lookup: {
          from: "adminHobbies",
          let: { hobbiesData: "$hobbies", ishidehobbies: "$ishidehobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$hobbiesData"]
                    },
                    { $eq: ["$$ishidehobbies", false] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, hobbyname: 1, planId: 1, plan: 1
              }
            }
          ],
          as: "hobbies"
        }
      },
      {
        $lookup: {
          from: "userplan",
          let: { planData: "$plan" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$planData"]
                    }

                  ]
                }
              }
            },
          ],
          as: "plan"
        }
      },

      {
        $lookup: {
          from: "followuser",
          let: { user_Id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$from", new ObjectId(from)]
                    },
                    {
                      $eq: ["$to", new ObjectId(to)]
                    }
                  ]
                }
              }

            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
          ],
          as: "followingsDetails"
        }
      },
      {
        $unwind: {
          path: "$followingsDetails", preserveNullAndEmptyArrays: true
        }
      },
      //-------------------------
      /*   {
          $lookup: {
            from: "followuser",
            let: { user_Id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$status", "completed"]
                      },
                      {
                        $in: ["$from", [new ObjectId(from), new ObjectId(to)]]
                      }
  
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: "$to", // Group by the `from` field
                  // latestDocument: { $first: "$$ROOT" }, // Get the most recent document for each `from` value
                  count: { $sum: 1 }
                }
              },
              {
                $match: {
                  count: { $gt: 1 }
                },
  
              },
              // {
              //   $lookup: {
              //     from: "users",
              //     localField: "_id",
              //     foreignField: "_id",
              //     as: "toDetails"
              //   }
              // },
              {
                $lookup: {
                  from: "users",
                  let: { user_Id: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $ne: ["$_id", "$$user_Id"]
                            },
                            {
                              $ne: ["_id", new ObjectId(to)]
                            }
                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        name: 1, username: 1, profile: 1, randomIndex: 1, location: 1, blockStatus: 1
                      }
                    }
                  ],
                  as: "toDetails"
                }
              },
              {
                $unwind: {
                  path: "$toDetails", preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  _id: 1,
                  toDetails: 1
                }
              },
              // {
              //   $count:"followersDocs"
              // }
              // { $sort: { updatedAt: -1 } },
              // { $limit: 1 },
            ],
            as: "Mutualfriends"
          }
        }, */
      /*  {
         $lookup: {
           from: "followuser",
           pipeline: [
             {
               $match: {
                 status: "completed",
                 from: { $in: [fromId, toId] }
               }
             },
             {
               $group: {
                 _id: "$to",
                 count: { $sum: 1 }
               }
             },
             { $match: { count: { $gt: 1 } } },
             {
               $lookup: {
                 from: "users",
                 localField: "_id",
                 foreignField: "_id",
                 as: "user"
               }
             },
             { $unwind: "$user" },
             {
               $project: {
                 _id: 1,
                 "user.name": 1,
                 "user.username": 1,
                 "user.profile": 1,
                 "user.randomIndex": 1,
                 "user.location": 1
               }
             }
           ],
           as: "Mutualfriends"
         }
       }, */
      {
        $lookup: {
          from: "followuser",
          pipeline: [
            // 1️⃣ Only completed follows from both users
            {
              $match: {
                status: "completed",
                from: { $in: [fromId, toId] }
              }
            },

            // 2️⃣ Group by the followed user
            {
              $group: {
                _id: "$to",
                followers: { $addToSet: "$from" }
              }
            },

            // 3️⃣ Ensure BOTH users follow the same person
            {
              $match: {
                $expr: {
                  $setEquals: ["$followers", [fromId, toId]]
                }
              }
            },

            // 4️⃣ Get mutual friend user details
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "toDetails"
              }
            },

            // 5️⃣ Flatten user
            {
              $unwind: {
                path: "$toDetails",
                preserveNullAndEmptyArrays: false
              }
            },

            // 6️⃣ Final projection
            {
              $project: {
                _id: 1,
                toDetails: {
                  name: 1,
                  username: 1,
                  profile: 1,
                  randomIndex: 1,
                  location: 1,
                  blockStatus: 1
                }
              }
            }
          ],
          as: "Mutualfriends"
        }
      },
      // {
      //   $unwind: {
      //     path: "$Mutualfriends", preserveNullAndEmptyArrays: true
      //   }
      // },
      //---------------------------

      //event join and create
      {
        $lookup: {
          from: "events",
          let: { user_Id: "$_id", ishideevent: "$ishideevent" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$delete", false]
                    },
                    {
                      $eq: ["$userId", "$$user_Id"]
                    },
                    {
                      $eq: ["$$ishideevent", false]
                    },
                    {
                      $in: ["$event_status", ["comingsoon", "started"]]
                    }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "users",
                let: { eventUserId: "$eventinterested.userId", events: "$eventinterested" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $in: ["$_id", "$$eventUserId"]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      name: 1, username: 1, profile: 1, randomIndex: 1, location: 1
                    }
                  },
                  {
                    $addFields: {
                      // eventinterestId:{ $arrayElemAt: [ "$$events.userId", {$indexOfArray: [ "$$events.userId", "$_id" ]} ] },
                      joinstatus: { $arrayElemAt: ["$$events.joinstatus", { $indexOfArray: ["$$events.userId", "$_id"] }] },
                      join_Id: { $arrayElemAt: ["$$events._id", { $indexOfArray: ["$$events.userId", "$_id"] }] },
                    }
                  }

                ],
                as: "eventinterested"

              },
            },
            // {
            //   $lookup: {
            //     from: "users",
            //     localField: "eventinterested.userId",
            //     foreignField: "_id",
            //     as: "eventsDetails",
            //   },
            // },

          ],
          as: "createEventsData"
        }
      },

      {
        $lookup: {
          from: "events",
          let: { user_Id: "$_id", ishideevent: "$ishideevent" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $ne: ["$userId", "$$user_Id"]
                    },
                    {
                      $eq: ["$delete", false]
                    },
                    {
                      $eq: ["$$ishideevent", false]
                    },
                    {
                      $in: ["$event_status", ["comingsoon", "started"]]
                    },
                    {
                      $in: ["$$user_Id", "$eventinterested.userId"]
                    }
                  ]
                }
              }
            }],
          as: "joinedEvents"
        }
      },

      //group joined and create
      {
        $lookup: {
          from: "Instance",
          let: { user_Id: "$_id", ishideAllGroup: "$ishideAllGroup" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$groupCreater", "$$user_Id"]
                    },
                    {
                      $eq: ["$$ishideAllGroup", false]
                    },
                    {
                      $eq: ["$isGroupchat", true]
                    },
                    {
                      $eq: ["$iseventchat", false]
                    },
                    {
                      $in: ["$$user_Id", "$members"]
                    },
                    {
                      $eq: ["$isblocked", "unblocked"]
                    },
                  ]
                }
              }

            },
            { $sort: { createdAt: -1 } }
          ],
          as: "createGroup"
        }
      },

      {
        $lookup: {
          from: "Instance",
          let: { user_Id: "$_id", ishideAllGroup: "$ishideAllGroup" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$$user_Id", "$members"]
                    },
                    {
                      $eq: ["$$ishideAllGroup", false]
                    },
                    {
                      $ne: ["$groupCreater", "$$user_Id"]
                    },
                    {
                      $eq: ["$isGroupchat", true]
                    },
                    {
                      $eq: ["$iseventchat", false]
                    }
                  ]
                }
              }

            },
            { $sort: { createdAt: -1 } }
          ],
          as: "joinedGroup"
        }
      },

      // ============>

      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          ageconfirm_status: 1,
          OTP: 1,
          gender: 1,
          location: 1,
          profile: 1,
          verify_status: 1,
          TFA: 1,
          hobbies: 1,
          bio: 1,
          age: 1,
          privacy_status: 1,
          followersCount: 1,
          followingCount: 1,
          blockStatus: 1,
          blockedReason: 1,
          plan: 1,
          login_status: 1,
          emailUpdates: 1,
          pushNotification: 1,
          fcmToken: 1,
          showinterest: 1,
          showgroups: 1,
          delete: 1,
          MychatDiscription: 1,
          createdAt: 1,
          updatedAt: 1,
          dob: 1,
          online_status: 1,
          followingsDetails: "$followingsDetails",
          events: "$createEventsData",
          joinedEvents: "$joinedEvents",
          // {$map: {
          //   input: "$joinedEvents",
          //   as: "event",
          //   in: {
          //     eventTitle: "$$event.eventTitle",
          //     startDate: "$$event.startDate"
          //   }
          // }},
          createGroup: "$createGroup",
          joinedGroup: "$joinedGroup",
          NotificationCount: 1,
          bioimage: 1,
          randomIndex: 1,
          personalAddress: 1,
          Mutualfriends: 1,
          lastSeenDate: 1,
          userblocked: 1,
          ishidegroup: 1,
          ishideevent: 1,
          ishidehobbies: 1,
          ishideprofile: 1,
          // distanceInKm: 1

        }
      },
      //   {
      //     $lookup: {
      //         from: "users",
      //         localField: "events.eventinterested.userId",
      //         foreignField: "_id",
      //         as: "events.eventinterested.userId",
      //     },
      // },
      // }


    ];
    var Agg = await Aggregate({ Query: query, DBName: DbName });
    console.log("QueryResult_SingleUserDetails", JSON.stringify(query, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
}

export const ReportsData = async (data) => {
  console.log("dat_SReportsData", data);
  try {
    const { Data, DbName } = data
    let query = [
      {
        $lookup: {
          from: "users",
          localField: "report_from",
          foreignField: "_id",
          as: "reporter"
        }
      },
      {
        $unwind: {
          path: "$reporter", preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "report_to",
          foreignField: "_id",
          as: "reporter_to"
        }
      },
      {
        $unwind: {
          path: "$reporter_to", preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "report_to",
          foreignField: "_id",
          as: "UserDetails"
        }
      },
      {
        $unwind: {
          path: "$UserDetails", preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "events",
          localField: "report_to",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      {
        $unwind: {
          path: "$eventDetails", preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "Instance",
          localField: "report_to",
          foreignField: "_id",
          as: "instanceDetails"
        }
      },
      {
        $unwind: {
          path: "$instanceDetails", preserveNullAndEmptyArrays: true
        }
      }

    ]

    if (Data == "user") {
      query.push(
        {
          $match: {
            type: "user"
          }
        },

      )
    }
    else if (Data == "event") {
      query.push(
        {
          $match: {
            type: "event"
          }
        }

      )
    }
    else if (Data == "group") {
      query.push(
        {
          $match: {
            type: "group"
          }
        }
      )
    }

    else if (Data == "singlechat") {
      query.push(
        {
          $match: {
            type: "singlechat"
          }
        },
      )

    }
    else if (Data == "All") {
      query.push(
        {
          $lookup: {
            from: "users",
            localField: "report_to",
            foreignField: "_id",
            as: "UserDetails"
          }
        },
        {
          $unwind: {
            path: "$UserDetails", preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "events",
            localField: "report_to",
            foreignField: "_id",
            as: "eventDetails"
          }
        },
        {
          $unwind: {
            path: "$eventDetails", preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "Instance",
            localField: "report_to",
            foreignField: "_id",
            as: "instanceDetails"
          }
        },
        {
          $unwind: {
            path: "$instanceDetails", preserveNullAndEmptyArrays: true
          }
        }
      )
    }
    var Agg = await Aggregate({ Query: query, DBName: DbName });
    // console.log("QueryResult_SingleUserDetails", JSON.stringify(query, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
}


// //new
// export const getInstanceChatlistAndFollowerLists = async (data) => {
//   console.log("getInstanceChatlistAndFollowerLists", data);
//   try {
//     const { DBName, userId, page, limit } = data
//     let query = [
//       {
//           $match: {
//               $expr: {
//                   $and: [
//                       { $in: [new ObjectId(userId), "$members"] },
//                       { $eq: ["$isblocked", "unblocked"] }
//                   ]
//               }
//           }
//       },
//       {
//           $sort: { createdAt: -1 }
//       },
//       {
//           $lookup: {
//               from: "followuser",
//               let: { user_Id: "$groupCreater" },
//               pipeline: [
//                   {
//                       $match: {
//                           $expr: {
//                               $and: [
//                                   { $eq: ["$from", new ObjectId(userId)] }
//                               ]
//                           }
//                       }
//                   },
//                   {
//                       $lookup: {
//                           from: "users",
//                           localField: "to",
//                           foreignField: "_id",
//                           as: "to"
//                       }
//                   },
//                   {
//                     $unwind: {
//                         path: "$to",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//               ],
//               as: "followingsDetails"
//           }
//       },

//       {
//           $lookup: {
//               from: "users",
//               localField: "members",
//               foreignField: "_id",
//               as: "membersDetails"
//           }
//       },
//       {
//           $lookup: {
//               from: "users",
//               localField: "groupCreater",
//               foreignField: "_id",
//               as: "groupCreater"
//           }
//       },
//       {
//           $unwind: {
//               path: "$groupCreater",
//               preserveNullAndEmptyArrays: true
//           }
//       },
//       {
//           $project: {
//               _id: 1,
//               chatName: 1,
//               createdAt: 1,
//               isGroupchat: 1,
//               groupDiscription: 1,
//               groupIndex: 1,
//               Image: 1,
//               UnreadMessageCount: { $ifNull: ["$UnreadMessageCount.unread", 0] },
//               members:"$membersDetails._id",
//               "groupCreater._id": 1,
//               "groupCreater.name": 1,
//               "groupCreater.profile": 1,
//               "groupCreater.username": 1,
//               "followingsDetails.to._id": 1,
//               "followingsDetails.to.profile": 1,
//               "followingsDetails.to.name": 1,
//               "followingsDetails.to.MychatDiscription": 1,
//               "followingsDetails.from": 1,

//           }
//       }
//       // Add pagination if needed
//       // { $skip: page * limit },
//       // { $limit: limit }
//   ];


//     var Agg = await Aggregate({ Query: query, DBName: DBName });
//     console.log("QueryResult_12345", JSON.stringify(Agg, null, 2));
//     return Agg;
//   } catch (error) {
//     console.log("error", error);
//   }
// };

//Single chat format rows message
export const getSingleInstanceLastmessage = async (data) => {
  console.log("getSingleInstanceLastmessage_234", data);
  try {
    const { DBName, uesrId, page, limit, searchText } = data
    let findBlocUser = await User.findOne({ _id: new ObjectId(uesrId) });
    let blockUser = findBlocUser?.userblocked || [];
    let matchCondition = {
      $expr: {
        $and: [
          { $in: [new ObjectId(uesrId), "$members"] },
          { $eq: ["$isblocked", "unblocked"] },
          { $eq: ["$isGroupchat", false] },

        ]
      }
    };

    // if (searchText) {

    //   matchCondition.chatName = { $regex: `^${searchText}`, $options: "i" };

    // }
    let query = [
      { $match: matchCondition },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$instanceId", "$$id"]
                    },
                    { $in: [new ObjectId(uesrId), '$groupmembers'] },
                    // {
                    //   $ne: ["$text", ""]
                    // }
                    // { $nin: ["$senderId", blockUser] }
                    // ...(blockUser.length ? [
                    //   { $not: { $in: ["$senderId", blockUser] } }
                    // ] : [])
                  ]

                },
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "lastMessage"
        }
      },
      {
        $unwind:
        {
          path: "$lastMessage", preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      },

      {
        $lookup: {
          from: "users",
          let: { memberIds: "$members" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$memberIds"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profile: 1,
                userblocked: 1,
                language: 1,
                online_status: 1,
                randomIndex: 1
              }
            }
          ],
          as: "userDetails"
        }
      },

      // {
      //   $addFields: {
      //     members: {
      //       $map: {
      //         input: "$userDetails",
      //         as: "members",
      //         in: {
      //           $mergeObjects:
      //             ['$$members',
      //               {
      //                 'isblockedUser': {
      //                   $cond: [{ $in: ['$$members._id', blockUser] }, true, false]
      //                 }
      //               },
      //             ],
      //         },
      //       },
      //     },
      //   },
      // },
      {
        $lookup: {
          from: "users",
          let: { requestUser: { $ifNull: ["$requestedUsers", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$requestUser"]

                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profile: 1,
                userblocked: 1,
                language: 1,
                randomIndex: 1
              }
            }
          ],
          as: "requested_users"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { groupOwner: "groupCreater" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$groupOwner"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profile: 1,
                userblocked: 1,
                language: 1,
                online_status: 1,
                randomIndex: 1
              }
            }
          ],
          as: "groupCreater"
        }
      },
      {
        $unwind:
        {
          path: "$groupCreater", preserveNullAndEmptyArrays: true
        }
      },


      {
        $lookup: {
          from: "messages",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // { $nin: ["$senderId", blockUser] },
                    { $eq: ["$instanceId", "$$id"] },
                    // { $in: [new ObjectId(uesrId), '$groupmembers'] },
                    { $not: { $in: [new ObjectId(uesrId), "$seenStatus.seen"] } },
                    // ...(blockUser.length ? [
                    //   { $not: { $in: ["$senderId", blockUser] } }
                    // ] : [])
                  ]

                }
              }
            },
            {
              $count: "unread"
            }
          ],
          as: "UnreadMessageCount"
        }
      },
      {
        $unwind: {
          path: "$UnreadMessageCount",
          preserveNullAndEmptyArrays: true
        }
      },

      // {
      //   $addFields: {
      //     UnreadMessageCount: { $ifNull: [{ $arrayElemAt: ["$UnreadMessageCount.unread", 0] }, 0] }
      //   }
      // },
      // {
      //   $project: {
      //     UnreadMessageCount: 1
      //   }
      // }

      ...(page ? [{ $skip: page }] : []),
      ...(limit ? [{ $limit: limit }] : [])
    ];

    if (searchText) {
      query.push(
        {
          $lookup: {
            from: "users",
            let: { memberIds: "$members" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$memberIds"]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  profile: 1,
                  userblocked: 1,
                  language: 1,
                  online_status: 1,
                  randomIndex: 1
                }
              }
            ],
            as: "membersDetails"
          }
        },
        // /*  { $unwind: "$membersDetails" },
        //  {
        //    $match: {
        //      "membersDetails.username": { $regex: `^${searchText}`, $options: "i" }
        //    }

        //  } */
        {
          $match: {
            membersDetails: {
              $elemMatch: {
                username: { $regex: `^${searchText}`, $options: "i" }
              }
            }
          }
        },
      )
    }

    // console.log("QueryResult435436", JSON.stringify(query, null, 2));

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    // console.log("QueryResult435436", JSON.stringify(Agg, null, 2));
    return Agg;
  } catch (error) {
    console.log("error", error);
  }
};


//PrivateMessageChatCounts
export const PrivateMessageChatCounts = async (data) => {
  try {
    const { userId, DBName } = data
    let query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isGroupchat", false]
              },
              {
                $in: [new ObjectId(userId), "$members"]
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { instanceid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$instanceId", "$$instanceid"]
                    },
                    {
                      $not: { $in: [new ObjectId(userId), "$seenStatus.seen"] }
                    }

                  ]
                }
              }
            },
            {
              $count: "ChatCounts"
            }
          ],
          as: "PrivateChatCounts"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("PrivateMessageChatCounts_error", error);

  }
}


export const UserNearByLocation = async (data) => {
  console.log("datassss", data);
  try {
    const { DBName, parsedLongitude, parsedLatitude, distanceKilometer, userId, page, limit } = data
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const matchFilter = {
      _id: { $ne: new ObjectId(userId) }, // Exclude the current user
      delete: false,
      blockStatus: "unblocked",
      ishideprofile: false,
    };


    const pipeline = [

      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parsedLongitude, parsedLatitude]
          },
          distanceField: "distanceFromQuery",
          maxDistance: distanceKilometer, // meters
          spherical: true,
          key: 'location'
        }
      },
      {
        $match: matchFilter
      },
      {
        $addFields: {
          distanceInKm: { $divide: ["$distanceFromQuery", 1000] }, // meters to kilometers

        }
      }
    ];

    //available is remove comment
    /*   if (page !== -1) {
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
        pipeline.push({ $limit: pageSize });
      } */

    if (pageNumber) {
      pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
    }

    if (pageSize) {
      pipeline.push({ $limit: parseInt(pageSize) });
    }

    pipeline.push({

      $lookup: {
        from: "adminHobbies",
        let: { userhobbies: "$hobbies" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$userhobbies"]
                  },
                ]
              }
            }
          },
          {
            $project: {
              _id: 1, hobbyname: 1, planId: 1, plan: 1
            }
          }
        ],

        as: "hobbies"
      }

    })

    pipeline.push({

      $lookup: {
        from: "followuser",
        let: { user_Id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$from", new ObjectId(userId)]
                  },
                  {
                    $eq: ["$to", "$$user_Id"]
                  }

                ]
              }
            }

          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
        ],
        as: "followingsDetails"
      }

    },
      {
        $unwind: {
          path: "$followingsDetails", preserveNullAndEmptyArrays: true
        }
      },

    )

    pipeline.push({

      $lookup: {
        from: "followuser",
        let: { user_Id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$status", "completed"]
                  },
                  {
                    $in: ["$from", [new ObjectId(userId), "$$user_Id"]]
                  }


                ]
              }
            }
          },
          {
            $group: {
              _id: "$to", // Group by the `from` field
              // latestDocument: { $first: "$$ROOT" }, // Get the most recent document for each `from` value
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              count: { $gt: 1 }
            },

          },
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "_id",
          //     foreignField: "_id",
          //     as: "toDetails"
          //   }
          // },
          {
            $lookup: {
              from: "users",
              let: { user_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["_id", "$$user_id"]
                        },
                        {
                          $ne: ["_id", new ObjectId(userId)]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    username: 1, randomIndex: 1, profile: 1, email: 1, _id: 1, location: 1, blockStatus: 1
                  }
                }
              ],
              as: "toDetails"
            }
          },
          {
            $unwind: {
              path: "$toDetails", preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              toDetails: 1
            }
          },
          // {
          //   $count:"followersDocs"
          // }

        ],
        as: "Mutualfriends"
      }

    })

    pipeline.push({
      $project: {
        "name": 1,
        "username": 1,
        "email": 1,
        "ageconfirm_status": 1,
        "OTP": 1,
        "gender": 1,
        "location": {
          "type": "$Point",
          "coordinates": [
            { $arrayElemAt: ["$location.coordinates", 1] },
            { $arrayElemAt: ["$location.coordinates", 0] }
          ]
        },
        "profile": 1,
        "verify_status": 1,
        "TFA": 1,
        "hobbies": 1,
        "bio": 1,
        "age": 1,
        "privacy_status": 1,
        "followersCount": 1,
        "followingCount": 1,
        "blockStatus": 1,
        "blockedReason": 1,
        "plan": 1,
        "login_status": 1,
        "emailUpdates": 1,
        "pushNotification": 1,
        "fcmToken": 1,
        "showinterest": 1,
        "showgroups": 1,
        // "homeAddress": 1,
        // "homeType": 1,
        "delete": 1,
        // "MychatDiscription": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "dob": 1,
        "online_status": 1,
        "bioimage": 1,
        "randomIndex": 1,
        "locationDistance": 1,
        "followingsDetails": "$followingsDetails",
        "personalAddress": 1,
        "lastSeenDate": 1,
        "Mutualfriends": 1,
        "userblocked": 1,
        "ishidegroup": 1,
        "ishideevent": 1,
        "ishidehobbies": 1,
        "ishideprofile": 1
      }

    })
    var Agg = await Aggregate({ Query: pipeline, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error);

  }

}


export const EventNearByLocation = async (data) => {
  // console.log("evntDatssss", data);
  try {
    const { DBName, parsedLongitude, parsedLatitude, distanceKilometer, userId, page, limit } = data
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const matchFilter = {
      userId: { $ne: new ObjectId(userId) },
      event_status: { $in: ["comingsoon", "started"] },
      delete: false,
      isblocked: "unblocked"
    };

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parsedLongitude, parsedLatitude]
          },
          distanceField: "distanceFromQuery",
          maxDistance: distanceKilometer, // meters
          spherical: true,
          key: 'location'
        }
      },
      {
        $match: matchFilter
      },
      {
        $addFields: {
          distanceInKm: { $divide: ["$distanceFromQuery", 1000] } // meters to kilometers
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_ID: "$userId" },
          pipeline: [

            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$user_ID"]
                    }

                  ]
                }
              }
            },
            {
              $lookup: {
                from: "adminHobbies",
                localField: "hobbies",
                foreignField: "_id",
                as: "hobbies"
              }
            }

          ],

          as: 'userId'
        },
      },
      {
        $unwind: {
          path: "$userId", preserveNullAndEmptyArrays: true
        }
      },
    ];

    //available is remove comment
    /*     if (page !== -1) {
          const pageNumber = parseInt(page);
          const pageSize = parseInt(limit);
          pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
          pipeline.push({ $limit: pageSize });
        } */
    // pipeline.push({
    //   ...(page ? [{ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize }] : []),
    //   ...(limit ? [{ $limit: pageSize }] : [])
    // })
    if (pageNumber) {
      pipeline.push({ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize });
    }

    if (pageSize) {
      pipeline.push({ $limit: parseInt(pageSize) });
    }
    pipeline.push({

      $lookup: {
        from: "users",
        let: { eventUserId: "$eventinterested.userId", events: "$eventinterested" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$eventUserId"]
                  }
                ]
              }
            }
          },
          {
            $addFields: {
              joinstatus: { $arrayElemAt: ["$$events.joinstatus", { $indexOfArray: ["$$events.userId", "$_id"] }] },
              join_Id: { $arrayElemAt: ["$$events._id", { $indexOfArray: ["$$events.userId", "$_id"] }] },


            }
          }

        ],
        as: "eventinterested"

      },

    })

    pipeline.push({
      $project: {
        "_id": 1,
        "userId": 1,
        "eventTitle": 1,
        "startDate": 1,
        "endDate": 1,
        "description": 1,
        "image": 1,
        "event_status": 1,
        "location": {
          "type": "$Point",
          "coordinates": [
            { $arrayElemAt: ["$location.coordinates", 1] },
            { $arrayElemAt: ["$location.coordinates", 0] }
          ]
        },
        "privacy_status": 1,
        "isblocked": 1,
        "blockedReason": 1,
        "delete": 1,
        "eventinterested": 1,
        "isSaved": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "eventAddress": 1,
        "eventhobbies": 1
      }

    })
    var Agg = await Aggregate({ Query: pipeline, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error);

  }
}


/* export const UserListAndSearchfunc = async (data) => {
  console.log("User_search", data);
  try {
    const { DBName, userId, page, limit, skip, matchStage, hobbyname, username, longitude, latitude, search } = data
    console.log("SDbanamesss", DBName, userId, page, limit, skip, matchStage, hobbyname, username, longitude, latitude, search)
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const query = [];

    query.push(
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude] // [longitude, latitude]
          },
          distanceField: "dist.calculated",
          maxDistance: 10000,
          spherical: true,
          // query: {
          //   _id: { $ne: new ObjectId(userId) },
          //   ...matchStage
          // }
        }
      },
      {$match:matchStage},
      {
        $lookup: {
          from: "adminHobbies",  // Assuming "hobbies" is the name of the hobbies collection
          let: { hobbiesData: "$hobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$hobbiesData"]
                    }

                  ]
                }
              }
            },
          ],
          as: "hobbies"
        }
      },
      {
        $lookup: {
          from: "userplan",
          let: { planData: "$plan" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$planData"]
                    }

                  ]
                }
              }
            },
          ],
          as: "plan"
        }
      },

      {
        $lookup: {
          from: "followuser",
          let: { user_Id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$from", new ObjectId(userId)]
                    },
                    {
                      $eq: ["$to", "$$user_Id"]
                    }
                    // {
                    //     $eq: ["$from", "$$user_Id"]
                    // },
                    // {
                    //     $eq: ["$to", new objectid(userId)]
                    // }
                  ]
                }
              }

            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
          ],
          as: "followingsDetails"
        }
      },
      {
        $unwind: {
          path: "$followingsDetails", preserveNullAndEmptyArrays: true
        }
      },


      {
        $lookup: {
          "from": "users",
          "localField": "_id",
          "foreignField": "_id",
          "pipeline": [
            {
              "$lookup": {
                "from": "likes",
                "localField": "_id",
                "foreignField": "userId",
                "as": "usersLookup"
              }
            },
            {
              "$unwind": "$usersLookup"
            },
            {
              $project: {
                usersLookup: "$usersLookup"
              }
            }

          ],
          as: "likeDetails"
        }
      },
      {
        $unwind: {
          path: "$likeDetails", preserveNullAndEmptyArrays: true
        }
      },
      // ----------------------------
      {
        $lookup: {
          from: "followuser",
          let: { user_Id: "$_id" },
          pipeline: [


            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$status", "completed"]
                    },
                    {
                      $in: ["$from", [new ObjectId(userId), "$$user_Id"]]
                    }


                  ]
                }
              }

            },
            {
              $group: {
                _id: "$to", // Group by the `from` field
                // latestDocument: { $first: "$$ROOT" }, // Get the most recent document for each `from` value
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                count: { $gt: 1 }
              },

            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "toDetails"
              }
            },
            {
              $unwind: {
                path: "$toDetails", preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 0,
                toDetails: 1
              }
            },
            // {
            //   $count:"followersDocs"
            // }

          ],
          as: "Mutualfriends"
        }
      },

      // ------------------------------
      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          ageconfirm_status: 1,
          OTP: 1,
          gender: 1,
          location: 1,
          profile: 1,
          verify_status: 1,
          TFA: 1,
          hobbies: 1,
          authToken: 1,
          bio: 1,
          age: 1,
          privacy_status: 1,
          followersCount: 1,
          followingCount: 1,
          likesCount: 1,
          blockStatus: 1,
          blockedReason: 1,
          plan: 1,
          socketId: 1,
          login_status: 1,
          emailUpdates: 1,
          pushNotification: 1,
          fcmToken: 1,
          showinterest: 1,
          showgroups: 1,
          delete: 1,
          MychatDiscription: 1,
          createdAt: 1,
          updatedAt: 1,
          dob: 1,
          online_status: 1,
          homeAddress: 1,
          homeType: 1,
          followingsDetails: "$followingsDetails",
          usersLookup: "$likeDetails.usersLookup",
          randomIndex: 1,
          bioimage: 1,
          locationDistance: 1,
          personalAddress: 1,
          lastSeenDate: 1,
          Mutualfriends: 1,
          userblocked: 1,
          ishidegroup: 1,
          "ishidegroup": 1,
          "ishideevent": 1,
          "ishidehobbies": 1,
          "ishideprofile": 1
        }
      },
      ...(page ? [{ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize }] : []),
      ...(limit ? [{ $limit: pageSize }] : [])

    );

    if (hobbyname) {
      query.push(
        {
          $match: {
            hobbies: {
              $elemMatch: {
                hobbyname: { $regex: `^${hobbyname}`, $options: "i" }
              }
            }
          }
        },
      )
    }

    console.log("queryqueryquery", JSON.stringify(query, null, 2));

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error);

  }

} */


export const UserListAndSearchfunc = async (data) => {
  // console.log("fffffffdata", JSON.stringify(data, null, 2));

  try {
    const {
      DBName,
      userId,
      page,
      limit,
      skip,
      matchStage,
      longitude,
      latitude,
      viewerHobbyIds = [],
      distanceKilometer,
    } = data;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const loginUserId = userId ? new ObjectId(userId) : null;
    const viewerHobbyObjectIds = Array.isArray(viewerHobbyIds)
      ? viewerHobbyIds.map((id) => (id instanceof ObjectId ? id : new ObjectId(id)))
      : [];
    const maxDistanceMeters =
      Number.isFinite(Number(distanceKilometer)) && Number(distanceKilometer) > 0
        ? Number(distanceKilometer)
        : 100000;
    const query = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "dist.calculated",
          maxDistance: maxDistanceMeters,
          spherical: true,
          key: "location",
        },
      },
      { $match: matchStage },
      {
        $addFields: {
          mutualHobbiesCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$hobbies", []] },
                viewerHobbyObjectIds.length ? viewerHobbyObjectIds : [],
              ],
            },
          },
        },
      },
      {
        $addFields: {
          distanceInKm: {
            //  $divide: ["$dist.calculated", 1000] 
            $round: [{ $divide: ["$dist.calculated", 1000] }]
          }
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          let: { hobbiesData: "$hobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$hobbiesData"],
                },
              },
            },
            {
              $project: {
                _id: 1, hobbyname: 1, planId: 1, plan: 1
              }
            }
          ],
          as: "hobbies",
        },
      },
      {
        $lookup: {
          from: "userplan",
          let: { planData: "$plan" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$planData"],
                },
              },
            },
          ],
          as: "plan",
        },
      },
      {
        $lookup: {
          from: "followuser",
          let: { user_Id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$from", new ObjectId(userId)] },
                    { $eq: ["$to", "$$user_Id"] },
                  ],
                },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
          ],
          as: "followingsDetails",
        },
      },
      { $unwind: { path: "$followingsDetails", preserveNullAndEmptyArrays: true } },
      /* {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "userId",
                as: "usersLookup",
              },
            },
            { $unwind: "$usersLookup" },
            { $project: { usersLookup: "$usersLookup" } },
          ],
          as: "likeDetails",
        },
      },
      { $unwind: { path: "$likeDetails", preserveNullAndEmptyArrays: true } }, */
      /*   {
          $lookup: {
            from: "followuser",
            let: { user_Id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$status", "completed"] },
                      { $in: ["$from", [new ObjectId(userId), "$$user_Id"]] }
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$to",
                  count: { $sum: 1 },
                },
              },
              { $match: { count: { $gt: 1 } } },
              // {
              //   $lookup: {
              //     from: "users",
              //     localField: "_id",
              //     foreignField: "_id",
              //     as: "toDetails",
              //   },
              // },
              {
                $lookup: {
                  from: "users",
                  let: { user_id: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $eq: ["_id", "$$user_id"]
                            }
                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        username: 1, randomIndex: 1, profile: 1, email: 1, _id: 1, location: 1, blockStatus: 1
                      }
                    }
                  ],
                  as: "toDetails"
                }
              },
              { $unwind: { path: "$toDetails", preserveNullAndEmptyArrays: true } },
              { $project: { _id: 1, toDetails: 1 } },
            ],
            as: "Mutualfriends",
          },
        }, */
      {
        $lookup: {
          from: "followuser",
          let: { profileUserId: "$_id" },
          pipeline: [
            // 1️⃣ Only completed follows from both users
            {
              $match: {
                status: "completed",
                // from: { $in: [loginUserId, "$_id"] }
                $expr: {
                  $or: [
                    { $eq: ["$from", new ObjectId(userId)] },
                    { $eq: ["$from", "$$profileUserId"] }
                  ]
                }
              }
            },

            // 2️⃣ Group by followed user
            {
              $group: {
                _id: "$to",
                followers: { $addToSet: "$from" }
              }
            },

            // 3️⃣ Ensure BOTH users follow same person
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [new ObjectId(userId), "$followers"] },
                    { $in: ["$$profileUserId", "$followers"] }
                  ]
                }
              }
            },

            // 4️⃣ Get mutual friend details
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "toDetails"
              }
            },

            // 5️⃣ Flatten result
            {
              $unwind: {
                path: "$toDetails",
                preserveNullAndEmptyArrays: false
              }
            },

            // 6️⃣ Final shape
            {
              $project: {
                _id: 1,
                toDetails: {
                  username: 1,
                  randomIndex: 1,
                  profile: 1,
                  email: 1,
                  location: 1,
                  blockStatus: 1
                }
              }
            }
          ],
          as: "Mutualfriends"
        }
      },
      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          // ageconfirm_status: 1,
          // OTP: 1,
          gender: 1,
          location: 1,
          profile: 1,
          // verify_status: 1,
          TFA: 1,
          hobbies: 1,
          // authToken: 1,
          // bio: 1,
          age: 1,
          privacy_status: 1,
          followersCount: 1,
          followingCount: 1,
          // likesCount: 1,
          blockStatus: 1,
          // blockedReason: 1,
          plan: 1,
          // emailUpdates: 1,
          // pushNotification: 1,
          // fcmToken: 1,
          showinterest: 1,
          showgroups: 1,
          delete: 1,
          // MychatDiscription: 1,
          createdAt: 1,
          updatedAt: 1,
          // dob: 1,
          online_status: 1,
          // homeAddress: 1,
          // homeType: 1,
          followingsDetails: 1,
          /* usersLookup: "$likeDetails.usersLookup", */
          randomIndex: 1,
          bioimage: 1,
          locationDistance: 1,
          personalAddress: 1,
          lastSeenDate: 1,
          Mutualfriends: 1,
          userblocked: 1,
          ishidegroup: 1,
          ishideevent: 1,
          ishidehobbies: 1,
          ishideprofile: 1,
          distanceInKm: 1,
          mutualHobbiesCount: 1,
        },
      },
      { $sort: { mutualHobbiesCount: -1, distanceInKm: 1 } },
      ...(page ? [{ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize }] : []),
      ...(limit ? [{ $limit: pageSize }] : [])
    ];

    // if (hobbyname) {
    //   query.push({
    //     $match: {
    //       hobbies: {
    //         $elemMatch: {
    //           hobbyname: { $regex: `^${hobbyname}`, $options: "i" },
    //         },
    //       },
    //     },
    //   });
    // }

    // Pagination
    // query.push({ $skip: (pageNumber - 1) * pageSize });
    // query.push({ $limit: pageSize });

    const Agg = await Aggregate({ Query: query, DBName });
    console.log("🚀 ~ UserListAndSearchfunc ~ Agg:", Agg)
    return Agg;
  } catch (error) {
    console.error("UserListAndSearchfunc error:", error);
    return [];
  }
};


export const UserPeoplesNearLocation = async (data) => {
  console.log("dd_user_near_location", JSON.stringify(data));
  try {
    const {
      DBName,
      userId,
      page,
      limit,
      matchFilter,
      distanceKilometer,
      longitude,
      latitude,
      sortByHobbyIds = [],
    } = data;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const sortHobbyObjectIds = Array.isArray(sortByHobbyIds)
      ? sortByHobbyIds
          .map((id) =>
            id instanceof ObjectId
              ? id
              : ObjectId.isValid(String(id))
                ? new ObjectId(id)
                : null
          )
          .filter(Boolean)
      : [];

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance.calculated",
          maxDistance: distanceKilometer, // meters
          spherical: true,
          key: 'location'
        }
      },
      {
        $match: matchFilter
      },
      {
        $addFields: {
          distanceInKm: {
            // $divide: ["$distanceFromQuery", 1000] 
            $round: [{ $divide: ["$distance.calculated", 1000] }, 2]
          } // meters to kilometers

        }
      },
      {
        $addFields: {
          mutualHobbiesCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$hobbies", []] },
                sortHobbyObjectIds.length ? sortHobbyObjectIds : [],
              ],
            },
          },
        },
      },
      { $sort: { mutualHobbiesCount: -1, distanceInKm: 1 } },
    ];

    if (pageNumber) {
      pipeline.push({ $skip: (Math.max(1, parseInt(pageNumber) || 1) - 1) * pageSize });
    }

    if (pageSize) {
      pipeline.push({ $limit: parseInt(pageSize) });
    }
    pipeline.push({

      $lookup: {
        from: 'adminHobbies',
        localField: 'hobbies',
        foreignField: '_id',
        as: 'hobbies'
      }

    })
    pipeline.push({

      $lookup: {
        from: "followuser",
        let: { user_Id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$from", new ObjectId(userId)]
                  },
                  {
                    $eq: ["$to", "$$user_Id"]
                  }

                ]
              }
            }

          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
        ],
        as: "followingsDetails"
      }

    },
      {
        $unwind: {
          path: "$followingsDetails", preserveNullAndEmptyArrays: true
        }
      },
    )
    // -------------------------------
    pipeline.push({

      $lookup: {
        from: "followuser",
        let: { user_Id: "$_id" },
        pipeline: [


          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$status", "completed"]
                  },
                  {
                    $in: ["$from", [new ObjectId(userId), "$$user_Id"]]
                  }


                ]
              }
            }

          },
          {
            $group: {
              _id: "$to", // Group by the `from` field
              // latestDocument: { $first: "$$ROOT" }, // Get the most recent document for each `from` value
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              count: { $gt: 1 }
            },

          },
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "_id",
          //     foreignField: "_id",
          //     as: "toDetails"
          //   }
          // },
          {
            $lookup: {
              from: "users",
              let: { user_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["_id", "$$user_id"]
                        },
                        {
                          $ne: ["_id", new ObjectId(userId)]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    username: 1, randomIndex: 1, profile: 1, email: 1, _id: 1, location: 1, blockStatus: 1, name: 1
                  }
                }
              ],
              as: "toDetails"
            }
          },
          {
            $unwind: {
              path: "$toDetails", preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              toDetails: 1
            }
          },
          // {
          //   $count:"followersDocs"
          // }

        ],
        as: "Mutualfriends"
      }

    })
    // ------------------------------
    pipeline.push({
      $project: {
        "name": 1,
        "username": 1,
        "email": 1,
        "ageconfirm_status": 1,
        "OTP": 1,
        "gender": 1,
        "location": {
          "type": "$Point",
          "coordinates": [
            { $arrayElemAt: ["$location.coordinates", 1] },
            { $arrayElemAt: ["$location.coordinates", 0] }
          ]
        },
        "profile": 1,
        "verify_status": 1,
        "TFA": 1,
        "hobbies": 1,
        "bio": 1,
        "age": 1,
        "privacy_status": 1,
        "followersCount": 1,
        "followingCount": 1,
        "blockStatus": 1,
        "blockedReason": 1,
        "plan": 1,
        "socketId": 1,
        "login_status": 1,
        "emailUpdates": 1,
        "pushNotification": 1,
        "fcmToken": 1,
        "showinterest": 1,
        "showgroups": 1,
        "delete": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "dob": 1,
        "online_status": 1,
        "bioimage": 1,
        "randomIndex": 1,
        "followingsDetails": "$followingsDetails",
        "locationDistance": 1,
        "personalAddress": 1,
        "lastSeenDate": 1,
        "Mutualfriends": 1,
        "userblocked": 1,
        "ishidegroup": 1,
        "ishideevent": 1,
        "ishidehobbies": 1,
        "ishideprofile": 1,
        "distanceInKm": 1,
        "mutualHobbiesCount": 1
      }

    })
    console.log("piepepeppepeepep", JSON.stringify(pipeline, null, 2));

    var Agg = await Aggregate({ Query: pipeline, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error);

  }

}

export const UserNotifications = async (data) => {
  console.log("data_notifications", data);

  try {
    const { DBName, userId, findUser, page = "", limit = "", skip = "" } = data;

    const pipeline = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$display", true]
              },
              {
                $eq: ["$to", new ObjectId(userId)]
              },
              {
                $not: { $in: ["$from", findUser.map(id => new ObjectId(id))] }
              }
            ]

          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "followuser",
          localField: "followUserId",
          foreignField: "_id",
          as: "followUserId"

        },


      },
      {
        $unwind: {
          path: "$followUserId", preserveNullAndEmptyArrays: true
        }
      },


      // {
      //     $lookup: {
      //         from: "followuser",
      //         let: { from_notify: "$from", to_notify: "$to" },
      //         pipeline: [
      //             {
      //                 $match: {
      //                     $expr: {
      //                         $and: [
      //                             {
      //                                 $ne: ["$status", "unfollowed"]
      //                             },
      //                             {
      //                                 $eq: ["$from", "$$from_notify"]
      //                             },
      //                             {
      //                                 $eq: ["$to", "$$to_notify"]
      //                             }
      //                         ]
      //                     }
      //                 }
      //             },
      //             { $limit: 1 }

      //         ],
      //         as: "notificationsDetails"
      //     }
      // },

      // {
      //     $unwind: {
      //         path: "$notificationsDetails", preserveNullAndEmptyArrays: true
      //     }
      // },
      {
        $lookup: {
          from: "followuser",
          let: { from_notify: "$from", to_notify: "$to" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $ne: ["$status", "unfollowed"]
                    },
                    {
                      $eq: ["$from", "$$to_notify"]
                    },
                    {
                      $eq: ["$to", "$$from_notify"]
                    }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: "notificationsDetails"
        }
      },

      {
        $unwind: {
          path: "$notificationsDetails", preserveNullAndEmptyArrays: true
        }
      },


      {
        // $lookup: {
        //   from: "users",
        //   localField: "from",
        //   foreignField: "_id",
        //   as: "From_Details"

        // },
        $lookup: {
          from: "users",
          let: { fromId: "$from" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fromId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, hobbies: 1, username: 1, profile: 1, randomIndex: 1
              }
            }
          ],
          as: "From_Details"

        },
      },
      {
        $unwind: {
          path: "$From_Details", preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          localField: "From_Details.hobbies",
          foreignField: "_id",
          as: "From_Details.hobbies"
        }
      },
      ...(page ? [{ $skip: skip }] : []),
      ...(limit ? [{ $limit: limit }] : [])

    ]

    var Agg = await Aggregate({ Query: pipeline, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error_UserNotifications", error);

  }
}

export const EventslistSearchfuncAgg = async (data) => {
  try {
    const { DBName, hideEventCondition, regex, followedUserIds, page, skip, limit, userId } = data
    const pipeline = [
      // {
      //   $match: {
      //     ...hideEventCondition,
      //     event_status: { $in: ["comingsoon", "started"] },
      //     isblocked: "unblocked",
      //     delete: false,
      //     eventTitle: { $regex: regex, $options: 'i' },
      //     $or: [
      //       { privacy_status: 'public' },
      //       { userId: { $in: followedUserIds } }
      //     ]
      //   }
      // },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$userId", new ObjectId(userId)]
              }
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "adminHobbies",
          localField: "userId.hobbies",
          foreignField: "_id",
          as: "userId.hobbies"
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          localField: "eventhobbies",
          foreignField: "_id",
          as: "eventhobbies"
        }
      },
      {
        $lookup: {
          from: "Instance",
          localField: "_id",
          foreignField: "eventId",
          as: "group"
        }
      },
      {
        $unwind: {
          path: "$group",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "eventinterested.userId",
          foreignField: "_id",
          as: "eventinterested"
        }
      },

      // { 
      //   $unwind: {
      //     path: "$eventinterested",
      //     preserveNullAndEmptyArrays: true
      //   }
      // },

      { $unwind: "$eventinterested" },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "eventinterested.userId",
      //     foreignField: "_id",
      //     as: "eventinterestedUser"
      //   }
      // },
      {
        $unwind: {
          path: "$eventinterestedUser",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $set: {
          eventinterested: {
            _id: "$eventinterested._id",
            joinstatus: "$eventinterested.joinstatus",
            userId: {
              _id: "$eventinterestedUser._id",
              name: "$eventinterestedUser.name",
              username: "$eventinterestedUser.username",
              profile: "$eventinterestedUser.profile",
              randomIndex: "$eventinterestedUser.randomIndex"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          eventTitle: { $first: "$eventTitle" },
          eventhobbies: { $first: "$eventhobbies" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          description: { $first: "$description" },
          event_status: { $first: "$event_status" },
          location: { $first: "$location" },
          privacy_status: { $first: "$privacy_status" },
          createdAt: { $first: "$createdAt" },
          isSaved: { $first: "$isSaved" },
          group: { $first: "$group" },
          joinedStatus: { $first: "$eventinterested.joinstatus" },
          eventinterested: { $push: "$eventinterested" }

        }
      },

      // {
      //   $project: {
      //     "_id": 1,
      //     "eventTitle": 1,
      //     "startDate": 1,
      //     "endDate": 1,
      //     "description": 1,
      //     "event_status": 1,
      //     "location": 1,
      //     "privacy_status": 1,
      //     "isblocked": 1,
      //     "delete": 1,
      //     "eventAddress": 1,
      //     "eventhobbies": {_id:1, hobbyname:1},
      //     "isSaved": 1,
      //     "createdAt": 1,
      //     "eventinterested":1,
      //     "group": {_id:1}
      //   }
      // }
    ];

    if (page != Number(-1) && page != "all") {
      pipeline.push(
        { $skip: skip },
        { $limit: parseInt(limit) }
      );
    }

    var Agg = await Aggregate({ Query: pipeline, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error)
  }
}


export const CommonSearchUserListAndfunc = async (data) => {
  console.log("User_search", data, { $regex: `^${data.hobbyname}`, $options: "i" });
  try {
    const { DBName, userId, page, limit, matchStage, hobbyname, longitude, latitude } = data
    const pageNumber = (page == "all") ? "all" : parseInt(page);
    const pageSize = parseInt(limit);

    const query = [];
    query.push(
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "dist.calculated",
          maxDistance: 100000,
          spherical: true,
          key: "location",
        },
      },
      { $match: matchStage },
      {
        $addFields: {
          distanceInKm: {
            //  $divide: ["$dist.calculated", 1000] 
            $round: [{ $divide: ["$dist.calculated", 1000] }, 2]
          }
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          let: { hobbiesData: "$hobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$hobbiesData"]
                }
              }
            }
          ],
          as: "hobbies"
        }
      },
      {
        $lookup: {
          from: "userplan",
          let: { planData: "$plan" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$planData"]
                }
              }
            }
          ],
          as: "plan"
        }
      },
      {
        $lookup: {
          from: "followuser",
          let: { user_Id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$from", new ObjectId(userId)] },
                    { $eq: ["$to", "$$user_Id"] }
                  ]
                }
              }
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 }
          ],
          as: "followingsDetails"
        }
      },
      {
        $unwind: {
          path: "$followingsDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "userId",
                as: "usersLookup"
              }
            },
            { $unwind: "$usersLookup" },
            {
              $project: {
                usersLookup: "$usersLookup"
              }
            }
          ],
          as: "likeDetails"
        }
      },
      {
        $unwind: {
          path: "$likeDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        /** Same semantics as UserListAndSearchfunc: shared follow of a third user (both in $addToSet), not count>1 on duplicate edges. */
        $lookup: {
          from: "followuser",
          let: { profileUserId: "$_id" },
          pipeline: [
            {
              $match: {
                status: "completed",
                $expr: {
                  $or: [
                    { $eq: ["$from", new ObjectId(userId)] },
                    { $eq: ["$from", "$$profileUserId"] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$to",
                followers: { $addToSet: "$from" }
              }
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [new ObjectId(userId), "$followers"] },
                    { $in: ["$$profileUserId", "$followers"] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "toDetails"
              }
            },
            {
              $unwind: {
                path: "$toDetails",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $project: {
                _id: 1,
                toDetails: {
                  username: 1,
                  randomIndex: 1,
                  profile: 1,
                  email: 1,
                  location: 1,
                  blockStatus: 1
                }
              }
            }
          ],
          as: "Mutualfriends"
        }
      },
      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          ageconfirm_status: 1,
          OTP: 1,
          gender: 1,
          location: 1,
          profile: 1,
          verify_status: 1,
          TFA: 1,
          hobbies: 1,
          bio: 1,
          age: 1,
          privacy_status: 1,
          followersCount: 1,
          followingCount: 1,
          blockStatus: 1,
          blockedReason: 1,
          plan: 1,
          login_status: 1,
          emailUpdates: 1,
          pushNotification: 1,
          fcmToken: 1,
          showinterest: 1,
          showgroups: 1,
          delete: 1,
          MychatDiscription: 1,
          createdAt: 1,
          updatedAt: 1,
          dob: 1,
          online_status: 1,
          followingsDetails: "$followingsDetails",
          usersLookup: "$likeDetails.usersLookup",
          randomIndex: 1,
          bioimage: 1,
          locationDistance: 1,
          personalAddress: 1,
          lastSeenDate: 1,
          Mutualfriends: 1,
          userblocked: 1,
          ishidegroup: 1,
          ishideevent: 1,
          ishidehobbies: 1,
          ishideprofile: 1,
          distanceInKm: 1
        }
      },
      ...((page && page != "all") ? [{ $skip: ((pageNumber <= 0 ? 1 : parseInt(pageNumber)) - 1) * pageSize }] : []),
      ...((page != "all" && limit) ? [{ $limit: pageSize }] : [])
    );

    // if (hobbyname) {
    //   query.push(
    //     {
    //       $match: {
    //         hobbies: {
    //           $elemMatch: {
    //             hobbyname: { $regex: `^${hobbyname}`, $options: "i" }
    //           }
    //         }
    //       }
    //     },
    //   )
    // }
    if (hobbyname) {
      query.push(
        {
          $lookup: {
            from: "adminHobbies",
            localField: "hobbies",
            foreignField: "_id",
            as: "hobbiesData"
          }
        },
        {
          $match: {
            "hobbiesData.hobbyname": { $regex: hobbyname.trim().replace(/\s+/g, '\\s*'), $options: "i" }
          }
        }
      );
    } else if (page === "all") {
      query.push(
        {
          $lookup: {
            from: "adminHobbies",
            localField: "hobbies",
            foreignField: "_id",
            as: "hobbiesData"
          }
        }
      );
    }

    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error", error);

  }

}


export const groupInfoDetails = async (data) => {
  try {
    const { DBName, groupId } = data
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$_id", new ObjectId(groupId)] },
              { $eq: ["$isGroupchat", true] },
              { $eq: ["$isblocked", "unblocked"] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { membersList: "$members" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$membersList"]
                    }
                  ]
                }

              }
            },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, bioimage: 1, online_status: 1, name: 1 } },
          ],
          as: "groupMembers"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { groupAdminList: "$groupAdmin" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$groupAdminList"]
                }
              }
            },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1 } },
          ],
          as: "groupAdmin"
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          let: { grouphobbiesList: "$grouphobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$grouphobbiesList"]
                }
              }
            },
            { $project: { _id: 1, name: 1, plan: 1, hobbyname: 1, hideshow: 1 } },

          ],
          as: "grouphobbies"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { groupCreaterList: "$groupCreater" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$groupCreaterList"]
                }
              }
            },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1 } },
          ],
          as: "groupCreater"
        }
      },
      { $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { requestedUsersList: "$requestedUsers" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$requestedUsersList"]
                    }
                  ]
                }

              }
            },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, bioimage: 1, online_status: 1, name: 1 } },
          ],
          as: "requestedUsers"
        }
      },
      {
        $project: {
          _id: 1,
          // members: 1,
          eventId: 1,
          iseventchat: 1,
          isGroupchat: 1,
          Image: 1,
          groupImages: 1,
          chatName: 1,
          groupAdmin: 1,
          groupCreater: 1,
          groupDiscription: 1,
          deleteProfile: 1,
          isblocked: 1,
          blockedReason: '',
          groupIndex: 1,
          joinMembers: 1,
          grouphobbies: 1,
          isPrivate: 1,
          requestedUsers: 1,
          ishidegroup: 1,
          location: 1,
          groupAddress: 1,
          createdAt: 1,
          updatedAt: 1,
          members: "$groupMembers",
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("error in groupInfoDetails", error)
  }
}

export const upcomingEventDetails = async (data) => {
  console.log("upcomingEventDetails", data);

  try {
    const { DBName, userId, searchText } = data

    const matchCondition = {
      userId: { $ne: new ObjectId(userId) },
      // event_status: "comingsoon",
      upcomingEvent_status: { $in: ["comingsoon", "started"] },
      eventinterested: {
        $elemMatch: {
          userId: new ObjectId(userId),
          joinstatus: true
        }
      }
    };

    if (searchText && searchText.trim().length > 0) {
      matchCondition.eventTitle = {
        $regex: searchText.trim(),
        $options: "i"
      };
    }

    const query = [
      { $match: matchCondition },
      {
        $lookup: {
          from: "hobbies",
          localField: "eventhobbies",
          foreignField: "hobbyId",
          as: "eventhobbies"
        }
      },
      {
        $addFields: {
          eventinterested: {
            $filter: {
              input: "$eventinterested",
              as: "ei",
              cond: {
                $and: [
                  { $eq: ["$$ei.userId", new ObjectId(userId)] },
                  { $eq: ["$$ei.joinstatus", true] },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$eventinterested" },
      {
        $lookup: {
          from: "users",
          let: { userId: "$eventinterested.userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                age: 1,
                profile: 1,
                location: 1,
                randomIndex: 1,
                username: 1
              }
            }
          ],
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $addFields: {
          "eventinterested.userId": "$userDetails",
        },
      },
      { $project: { userDetails: 0 } }, // remove temp field
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          eventinterested: { $push: "$eventinterested" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { eventinterested: "$eventinterested" }],
          },
        },
      },
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    console.log("🚀 ~ upcomingEventDetails ~ Agg:", Agg)

    return Agg;
  } catch (error) {
    console.log("error in upcomingEventDetails", error)
  }
}

export const createEventListsAggre = async (data) => {
  console.log("sdfgdgdfgfdgfdgfg", data);
  try {
    const { DBName, toUserId } = data
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$_id", new ObjectId(toUserId)],
              },
              {
                $eq: ["$delete", false]
              },
            ]
          }
        }
      },
      {
        $lookup: {
          from: "events",
          let: { user_Id: "$_id", ishideevent: "$ishideevent" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$delete", false]
                    },
                    {
                      $eq: ["$userId", "$$user_Id"]
                    },
                    {
                      $eq: ["$$ishideevent", false]
                    },
                    {
                      $in: ["$event_status", ["comingsoon", "started"]]
                    }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "users",
                let: { eventUserId: "$eventinterested.userId", events: "$eventinterested" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $in: ["$_id", "$$eventUserId"]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      name: 1, username: 1, profile: 1, randomIndex: 1, location: 1
                    }
                  },
                  {
                    $addFields: {
                      joinstatus: { $arrayElemAt: ["$$events.joinstatus", { $indexOfArray: ["$$events.userId", "$_id"] }] },
                      join_Id: { $arrayElemAt: ["$$events._id", { $indexOfArray: ["$$events.userId", "$_id"] }] },
                    }
                  }

                ],
                as: "eventinterested"

              },
            },
          ],
          as: "createEventsData"
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          createEvents: "$createEventsData"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("createEventLists error", error)
  }

}

export const joinEventListsAggre = async (data) => {
  console.log("joinEventListsAggre", data);
  try {
    const { DBName, toUserId } = data
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$_id", new ObjectId(toUserId)],
              },
              {
                $eq: ["$delete", false]
              },
            ]
          }
        }
      },
      {
        $lookup: {
          from: "events",
          let: { user_Id: "$_id", ishideevent: "$ishideevent" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $ne: ["$userId", "$$user_Id"]
                    },
                    {
                      $eq: ["$delete", false]
                    },
                    {
                      $eq: ["$$ishideevent", false]
                    },
                    {
                      $in: ["$event_status", ["comingsoon", "started"]]
                    },
                    {
                      $in: ["$$user_Id", "$eventinterested.userId"]
                    }
                  ]
                }
              }
            }],
          as: "joinedEvents"
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          joinEvents: "$joinedEvents"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("joinEventListsAggre error", error)
  }
}

export const createGroupListsAggre = async (data) => {
  console.log("createGroupListsAggre", data);
  try {
    const { DBName, toUserId } = data
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$_id", new ObjectId(toUserId)],
              },
              {
                $eq: ["$delete", false]
              },
            ]
          }
        }
      },
      {
        $lookup: {
          from: "Instance",
          let: { user_Id: "$_id", ishideAllGroup: "$ishideAllGroup" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$groupCreater", "$$user_Id"]
                    },
                    {
                      $eq: ["$$ishideAllGroup", false]
                    },
                    {
                      $eq: ["$isGroupchat", true]
                    },
                    {
                      $eq: ["$iseventchat", false]
                    },
                    {
                      $in: ["$$user_Id", "$members"]
                    },
                    {
                      $eq: ["$isblocked", "unblocked"]
                    },
                  ]
                }
              }
            },
            // {
            //   $lookup: {
            //     from: "users",
            //     let: { members_id: "$members" },
            //     pipeline: [
            //       {
            //         $match: {
            //           $expr: {
            //             $and: [
            //               { $in: ["$_id", "$$members_id"] }
            //             ]
            //           }
            //         }
            //       },
            //       {
            //         $project: {
            //           _id: 1, username: 1, profile: 1, randomIndex: 1
            //         }
            //       }
            //     ],
            //     as: "members"
            //   }
            // },
            { $sort: { createdAt: -1 } }
          ],
          as: "createGroup"
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          createGroup: "$createGroup"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("createGroupListsAggre error", error)
  }
}

export const joinGroupListsAggre = async (data) => {
  console.log("joinGroupListsAggre", data);
  try {
    const { DBName, toUserId } = data
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$_id", new ObjectId(toUserId)],
              },
              {
                $eq: ["$delete", false]
              },
            ]
          }
        }
      },
      {
        $lookup: {
          from: "Instance",
          let: { user_Id: "$_id", ishideAllGroup: "$ishideAllGroup" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$$user_Id", "$members"]
                    },
                    {
                      $eq: ["$$ishideAllGroup", false]
                    },
                    {
                      $ne: ["$groupCreater", "$$user_Id"]
                    },
                    {
                      $eq: ["$isGroupchat", true]
                    },
                    {
                      $eq: ["$iseventchat", false]
                    }
                  ]
                }
              }

            },
            { $sort: { createdAt: -1 } }
          ],
          as: "joinedGroup"
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          joinGroups: "$joinedGroup"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("joinGroupListsAggre error", error)
  }
}

export const eventMessageChatCounts = async (data) => {
  try {
    const { userId, DBName } = data
    let query = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$iseventchat", true]
              },
              {
                $in: [new ObjectId(userId), "$members"]
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { instanceid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$instanceId", "$$instanceid"]
                    },
                    {
                      $not: { $in: [new ObjectId(userId), "$seenStatus.seen"] }
                    }

                  ]
                }
              }
            },
            {
              $count: "ChatCounts"
            }
          ],
          as: "eventChatCounts"
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("eventChatCounts_error", error);

  }
}

export const messageDetails = async (data) => {
  try {
    const { DBName, savedMessageId } = data
    const query = [
      {
        $match: {
          $expr: {
            $eq: ["$_id", savedMessageId]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { user_Id: "$chatId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$user_Id"]
                }
              }
            },
            {
              $project: { _id: 1, name: 1, username: 1, profile: 1, randomIndex: 1 }
            }
          ],
          as: "chatId"
        }
      },
      { $unwind: { path: "$chatId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "Instance",
          let: { instance_Id: "$instanceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$instance_Id"]
                }
              }
            }
          ],
          as: "instanceId"
        }
      },
      { $unwind: { path: "$instanceId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "messages",
          let: { replyMessage_Id: "$replyMessage" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$replyMessage_Id"]
                }
              }
            },
            {
              $project: {
                instanceId: 1,
                chatId: 1,
                text: 1,
                file: 1,
                createdAt: 1,
                compressfile: 1,
                voicerecord: 1,
                messageData: 1,
                seenStatus: 1,
                messageDelete: 1
              }
            }
          ],
          as: "replyMessage"
        }
      },
      { $unwind: { path: "$replyMessage", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { chat_Id: "$replyMessage.chatId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$chat_Id"] }
              }
            },
            {
              $project: {
                _id: 1, username: 1, profile: 1, randomIndex: 1
              }
            }
          ],
          as: "replyMessageUser"
        }
      },
      { $unwind: { path: "$replyMessageUser", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "replyMessage.chatId": "$replyMessageUser"
        }
      },
      { $project: { replyMessageUser: 0 } }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("eventChatCounts_error", error);

  }
}

export const eventListSearchAggregation = async (data) => {
  console.log("eventListSearchAggregation", data);
  try {
    let { DBName, eventQuery, page, limit, skip, longitude, latitude } = data;
    limit = parseInt(limit);
    page = parseInt(page);
    skip = parseInt(skip);
    const query = [
      // {
      //   $geoNear: {
      //     near: {
      //       type: "Point",
      //       coordinates: [longitude, latitude],
      //     },
      //     distanceField: "dist.calculated",
      //     maxDistance: 10000,
      //     spherical: true,
      //     key: "location"
      //   }
      // },
      {
        $match: eventQuery
      },
      {
        $sort: {
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: "users",
          let: { user_Id: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$user_Id"] } } },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, hobbies: 1 } }
          ],
          as: "userId"
        }
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "adminHobbies",
          let: { hobbiesId: "$userId.hobbies" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", { $ifNull: ["$$hobbiesId", []] }] } } },
            { $project: { _id: 1, hobbyname: 1 } }
          ],
          as: "userId.hobbies"
        }
      },

      { $unwind: { path: "$eventinterested", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          let: { interestedUserId: "$eventinterested.userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", { $ifNull: ["$$interestedUserId", []] }] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                age: 1,
                profile: 1,
                location: 1,
                randomIndex: 1,
                username: 1
              }
            }
          ],
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          "eventinterested.userId": "$userDetails"
        }
      },
      { $project: { userDetails: 0 } },

      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          eventinterested: {
            $push: {
              $cond: [
                { $gt: [{ $size: { $objectToArray: "$eventinterested" } }, 0] },
                "$eventinterested",
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { eventinterested: "$eventinterested" }]
          }
        }
      },

      {
        $lookup: {
          from: "adminHobbies",
          let: { eventhobbiesId: "$eventhobbies" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", { $ifNull: ["$$eventhobbiesId", []] }] }
              }
            },
            { $project: { _id: 1, hobbyname: 1 } }
          ],
          as: "eventhobbies"
        }
      },
      ...(page && page != -1 && page != "all" ? [{ $skip: skip }] : []),
      ...(page && page != -1 && page != "all" ? [{ $limit: limit }] : [])
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("eventListSearchAggregation_error", error);
  }
}

export const allChatsGroups = async (data) => {
  try {
    const { DBName, page, skip, limit } = data;
    const query = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$isGroupchat", true] },
              { $eq: ["$isblocked", "unblocked"] },
              { $eq: ["$ishidegroup", false] },
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { requestuserId: "$requestedUsers" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", { $ifNull: ["$$requestuserId", []] }]
                }
              }
            },
            {
              $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, userblocked: 1 }
            }
          ],
          as: "requestedUsers"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { membersId: "$members" },
          pipeline: [
            {
              // $match: {}
              $match: {
                $expr: {
                  $in: ["$_id", { $ifNull: ["$$membersId", []] }]
                }
              }
            },
            {
              $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, userblocked: 1 }
            }
          ],
          as: "members"
        }
      },
      ...(page && page != -1 && page != "all" ? [{ $skip: skip }] : []),
      ...(page && page != -1 && page != "all" ? [{ $limit: limit }] : [])
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("AllChatsGroups_error", error);

  }
}
// old code
// export const filterNearbyGroupLists = async (data) => {
//   console.log("BBBBBBBBBB", data);

//   try {
//     let {
//       DBName,
//       userId,
//       matchFilter = {},
//       validHobbies,
//       page,
//       skip = 0,
//       limit = 10,
//       type = "",
//       longitude = 0,
//       latitude = 0,
//       chatName,
//       iseventchat
//     } = data;

//     const andConditions = [];
//     // validHobbies = Array.isArray(validHobbies) ? validHobbies : [];
//     // matchFilter = matchFilter && typeof matchFilter === "object" ? matchFilter : {};
//     if (validHobbies.length > 0) {
//       andConditions.push({
//         $gt: [
//           {
//             $size: {
//               $setIntersection: [
//                 "$grouphobbies",
//                 validHobbies.map((v) => new ObjectId(v))
//               ]
//             }
//           },
//           0
//         ]
//       });
//     }

//     andConditions.push(
//       {
//         $not: { $in: [new ObjectId(userId), "$members"] },
//       }
//     )
//     andConditions.push(
//          { $eq: ["$$user_Id", "$groupCreater"] },
//     )
//     for (const [key, value] of Object.entries(matchFilter)) {
//       if (value && typeof value === "object") {
//         if ("$ne" in value) {
//           andConditions.push({ $ne: [`$${key}`, new ObjectId(value.$ne)] });
//         }
//       } else {
//         andConditions.push({ $eq: [`$${key}`, value] });
//       }
//     }
//     let geoNearStage = {
//       $geoNear: {
//         near: { type: "Point", coordinates: [longitude, latitude] },
//         distanceField: "dist.calculated",
//         spherical: true,
//         key: "location"
//       }
//     };

//     if (type === "notactiveplan") {
//       geoNearStage.$geoNear.maxDistance = 100000; // 100 km
//     }

//     let query = [
//       geoNearStage,
//       { $match: { _id: { $ne: new ObjectId(userId) } } },
//       {
//         $lookup: {
//           from: "Instance",
//           let: { user_Id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: andConditions
//                 }
//               }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 let: { createrId: "$groupCreater" },
//                 pipeline: [
//                   { $match: { $expr: { $eq: ["$_id", "$$createrId"] } } },
//                   { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
//                 ],
//                 as: "groupCreater"
//               }
//             },
//             { $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true } },

//             {
//               $lookup: {
//                 from: "users",
//                 let: { membersId: "$members" },
//                 pipeline: [
//                   { $match: { $expr: { $in: ["$_id", "$$membersId"] } } },
//                   { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
//                 ],
//                 as: "members"
//               }
//             },

//             {
//               $lookup: {
//                 from: "users",
//                 let: { groupAdminId: "$groupAdmin" },
//                 pipeline: [
//                   { $match: { $expr: { $in: ["$_id", "$$groupAdminId"] } } },
//                   { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
//                 ],
//                 as: "groupAdmin"
//               }
//             },

//             {
//               $lookup: {
//                 from: "users",
//                 let: { requestedUsersId: "$requestedUsers" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $in: ["$_id", { $ifNull: ["$$requestedUsersId", []] }]
//                       }
//                     }
//                   },
//                   { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
//                 ],
//                 as: "requestedUsers"
//               }
//             },
//             {
//               $lookup: {
//                 from: "adminHobbies",
//                 let: { grouphobbiesId: "$grouphobbies" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $in: ["$_id", { $ifNull: ["$$grouphobbiesId", []] }]
//                       }
//                     }
//                   },
//                   { $project: { _id: 1, hobbyname: 1, plan: 1 } }
//                 ],
//                 as: "grouphobbies"
//               }
//             },

//             {
//               $project: {
//                 _id: 1,
//                 members: 1,
//                 eventId: 1,
//                 iseventchat: 1,
//                 isGroupchat: 1,
//                 Image: 1,
//                 groupImages: 1,
//                 chatName: 1,
//                 groupAdmin: 1,
//                 groupCreater: 1,
//                 groupDiscription: 1,
//                 deleteProfile: 1,
//                 isblocked: 1,
//                 blockedReason: 1,
//                 groupIndex: 1,
//                 joinMembers: 1,
//                 grouphobbies: 1,
//                 isPrivate: 1,
//                 requestedUsers: 1,
//                 ishidegroup: 1,
//                 createdAt: 1,
//                 updatedAt: 1
//               }
//             }
//           ],
//           as: "groupUsers"
//         }
//       },
//       { $unwind: { path: "$groupUsers", preserveNullAndEmptyArrays: false } },

//       {
//         $project: {
//           // distanceInKm: "$dist.calculated",
//           // location: 1,
//           _id: "$groupUsers._id",
//           isGroupchat: "$groupUsers.isGroupchat",
//           Image: "$groupUsers.Image",
//           groupImages: "$groupUsers.groupImages",
//           chatName: "$groupUsers.chatName",
//           groupDiscription: "$groupUsers.groupDiscription",
//           deleteProfile: "$groupUsers.deleteProfile",
//           isblocked: "$groupUsers.isblocked",
//           blockedReason: "$groupUsers.blockedReason",
//           groupIndex: "$groupUsers.groupIndex",
//           joinMembers: "$groupUsers.joinMembers",
//           grouphobbies: "$groupUsers.grouphobbies",
//           isPrivate: "$groupUsers.isPrivate",
//           ishidegroup: "$groupUsers.ishidegroup",
//           createdAt: "$groupUsers.createdAt",
//           updatedAt: "$groupUsers.updatedAt",
//           members: "$groupUsers.members",
//           groupAdmin: "$groupUsers.groupAdmin",
//           groupCreater: "$groupUsers.groupCreater",
//           requestedUsers: "$groupUsers.requestedUsers"
//         }
//       },
//       {
//         $group: {
//           _id: "$_id",
//           isGroupchat: { $first: "$isGroupchat" },
//           Image: { $first: "$Image" },
//           groupImages: { $first: "$groupImages" },
//           chatName: { $first: "$chatName" },
//           groupDiscription: { $first: "$groupDiscription" },
//           deleteProfile: { $first: "$deleteProfile" },
//           isblocked: { $first: "$isblocked" },
//           blockedReason: { $first: "$blockedReason" },
//           groupIndex: { $first: "$groupIndex" },
//           joinMembers: { $first: "$joinMembers" },
//           grouphobbies: { $first: "$grouphobbies" },
//           isPrivate: { $first: "$isPrivate" },
//           ishidegroup: { $first: "$ishidegroup" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           members: { $first: "$members" },
//           groupAdmin: { $first: "$groupAdmin" },
//           groupCreater: { $first: "$groupCreater" },
//           requestedUsers: { $first: "$requestedUsers" }
//         }
//       }
//     ];

//     if (page && page != -1 && page != "all") {
//       query.push({ $skip: skip }, { $limit: limit });
//     }

//     console.log("Aggregation Pipeline:", JSON.stringify(query, null, 2));

//     const Agg = await Aggregate({ Query: query, DBName });
//     return Agg;
//   } catch (error) {
//     console.log("AllChatsGroups_error", error);

//   }
// }

// new code
export const filterNearbyGroupLists = async (data) => {
  console.log("BBBBBBBBBB", data);

  try {
    let {
      DBName,
      userId,
      matchFilter = {},
      validHobbies,
      page,
      skip = 0,
      limit = 10,
      type = "",
      longitude = 0,
      latitude = 0,
      distanceKilometer,
      chatName,
      iseventchat
    } = data;

    const andConditions = [];
    const viewerGroupHobbyObjectIds = (Array.isArray(validHobbies) ? validHobbies : []).map((v) =>
      v instanceof ObjectId ? v : new ObjectId(v)
    );
    const viewerProfileHobbyObjectIds = (Array.isArray(data?.viewerProfileHobbyIds) ? data.viewerProfileHobbyIds : [])
      .map((v) =>
        v instanceof ObjectId
          ? v
          : ObjectId.isValid(String(v))
            ? new ObjectId(v)
            : null,
      )
      .filter(Boolean);
    const sortHobbyObjectIds = viewerProfileHobbyObjectIds.length
      ? viewerProfileHobbyObjectIds
      : viewerGroupHobbyObjectIds;
    // validHobbies = Array.isArray(validHobbies) ? validHobbies : [];
    // matchFilter = matchFilter && typeof matchFilter === "object" ? matchFilter : {};
    if (viewerGroupHobbyObjectIds.length > 0) {
      andConditions.push({
        $gt: [
          {
            $size: {
              $setIntersection: [
                { $ifNull: ["$grouphobbies", []] },
                viewerGroupHobbyObjectIds
              ]
            }
          },
          0
        ]
      });
    }

    // NOTE: previously this excluded every group the requester was already a
    // member of (`$not: $in: [userId, $members]`).  That also dropped groups
    // the user CREATED (since the creator is auto-added to `members`), which
    // made the filtered search return [] whenever the only matches in range
    // were own / joined groups — while Reset still showed them via the
    // default feed.  We now include all groups the user can see, mirroring
    // `getInstanceLastmessage`, and rely on the hobby + $geoNear conditions
    // below to do the actual filtering.
    for (const [key, value] of Object.entries(matchFilter)) {
      if (value && typeof value === "object") {
        if ("$ne" in value) {
          andConditions.push({ $ne: [`$${key}`, new ObjectId(value.$ne)] });
        }
      } else {
        andConditions.push({ $eq: [`$${key}`, value] });
      }
    }
    let geoNearStage = {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "dist.calculated",
        maxDistance: distanceKilometer,
        spherical: true,
        key: "location"
      }
    };

    // if (type === "notactiveplan") {
    //   geoNearStage.$geoNear.maxDistance = 100000; // 100 km
    // }

    // ── Diagnostics ────────────────────────────────────────────────────
    // Counts per pipeline stage so we can pinpoint where rows are dropped
    // when filtered search returns 0.  Attached to the function's return
    // value (and logged) so it can be surfaced through the API response.
    let diag = {
      center: [longitude, latitude],
      distanceKilometer,
      validHobbyIds: viewerGroupHobbyObjectIds.map(String),
      matchFilter,
      geoOnlyCount: null,
      withBaseFiltersCount: null,
      withHobbiesCount: null,
      diagnosticError: null,
    };
    try {
      const baseConditions = andConditions.filter(
        (c) => !c?.$gt, // strip the hobby-intersection condition
      );
      const diagGeoOnly = await DBName.aggregate([
        geoNearStage,
        { $count: "n" },
      ]);
      const diagWithBase = baseConditions.length
        ? await DBName.aggregate([
            geoNearStage,
            { $match: { $expr: { $and: baseConditions } } },
            { $count: "n" },
          ])
        : diagGeoOnly;
      const diagWithHobbies = await DBName.aggregate([
        geoNearStage,
        { $match: { $expr: { $and: andConditions } } },
        { $count: "n" },
      ]);
      diag.geoOnlyCount = diagGeoOnly?.[0]?.n ?? 0;
      diag.withBaseFiltersCount = diagWithBase?.[0]?.n ?? 0;
      diag.withHobbiesCount = diagWithHobbies?.[0]?.n ?? 0;
      console.log("filterNearbyGroupLists DIAGNOSTIC →", diag);
    } catch (diagErr) {
      diag.diagnosticError = diagErr?.message || String(diagErr);
      console.log("filterNearbyGroupLists DIAGNOSTIC error", diag.diagnosticError);
    }

    let query = [
      geoNearStage,
      {
        $match: {
          $expr: {
            $and:
              andConditions
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { createrId: "$groupCreater" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$createrId"] } } },
            { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
          ],
          as: "groupCreater"
        }
      },
      { $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { membersId: "$members" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$membersId"] } } },
            { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
          ],
          as: "members"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { groupAdminId: "$groupAdmin" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$groupAdminId"] } } },
            { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
          ],
          as: "groupAdmin"
        }
      },

      {
        $lookup: {
          from: "users",
          let: { requestedUsersId: "$requestedUsers" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", { $ifNull: ["$$requestedUsersId", []] }]
                }
              }
            },
            { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
          ],
          as: "requestedUsers"
        }
      },
      {
        $lookup: {
          from: "adminHobbies",
          let: { grouphobbiesId: "$grouphobbies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", { $ifNull: ["$$grouphobbiesId", []] }]
                }
              }
            },
            { $project: { _id: 1, hobbyname: 1, plan: 1 } }
          ],
          as: "grouphobbies"
        }
      },
      {
        $project: {
          _id: 1,
          members: 1,
          eventId: 1,
          iseventchat: 1,
          isGroupchat: 1,
          Image: 1,
          groupImages: 1,
          chatName: 1,
          groupAdmin: 1,
          groupCreater: 1,
          groupDiscription: 1,
          deleteProfile: 1,
          isblocked: 1,
          blockedReason: 1,
          groupIndex: 1,
          joinMembers: 1,
          grouphobbies: 1,
          isPrivate: 1,
          requestedUsers: 1,
          ishidegroup: 1,
          location: 1,
          groupAddress: 1,
          createdAt: 1,
          updatedAt: 1,
          dist: 1,
        }
      },
      {
        $addFields: {
          mutualHobbiesCount: {
            $size: {
              $setIntersection: [
                {
                  $map: {
                    input: { $ifNull: ["$grouphobbies", []] },
                    as: "gh",
                    in: "$$gh._id",
                  },
                },
                sortHobbyObjectIds.length ? sortHobbyObjectIds : [],
              ],
            },
          },
        },
      },
        {
        $sort: {
          mutualHobbiesCount: -1,
        },
      },

    ];

    if (page && page != -1 && page != "all") {
      query.push({ $skip: skip }, { $limit: limit });
    }

    console.log("Aggregation Pipeline:", JSON.stringify(query, null, 2));

    const Agg = await Aggregate({ Query: query, DBName });
    const result = {
      ...Agg,
      _debug: { ...diag, aggregateError: Agg?.success === "error" ? Agg?.message : null },
    };
    console.log("filterNearbyGroupLists RESULT →", {
      success: Agg?.success,
      status: Agg?.status,
      message: Agg?.message,
      dataLength: Array.isArray(Agg?.data) ? Agg.data.length : null,
    });
    return result;
  } catch (error) {
    console.error("filterNearbyGroupLists ERROR →", error?.message || error);
    return {
      success: "error",
      message: error?.message || String(error),
      data: [],
      _debug: { ...diag, fatalError: error?.message || String(error) },
    };
  }
}


export const nearbyGroupLists = async (data) => {
  console.log("BBBBBBBBBB", data);

  try {
    const {
      DBName,
      userId,
      validHobbies = [],
      page,
      skip = 0,
      limit = 10,
      type = "",
      longitude = 0,
      latitude = 0,
      chatName,
      iseventchat
    } = data;
    // Search radius (metres). Honours the value the caller passed in so
    // the chat-name search respects the active filter / device location;
    // falls back to 100km otherwise.
    const distanceKilometer = (data?.distanceKilometer && Number(data.distanceKilometer) > 0)
      ? Number(data.distanceKilometer)
      : 100000;

    let andConditions = [];

    if (chatName && chatName.trim() !== "") {
      andConditions.push({
        $regexMatch: { input: "$chatName", regex: chatName, options: "i" }
      });
    }

    if (type == "searchgroup") {
      andConditions.push(
        { $eq: ["$groupCreater", "$$user_Id"] },
        { $eq: ["$isblocked", "unblocked"] },
        { $eq: ["$ishidegroup", false] },
        { $eq: ["$isGroupchat", true] },
        { $eq: ["$iseventchat", false] },

      );
    }
    if (type == "searcheventgroup") {
      andConditions.push(
        // { $eq: ["$groupCreater", "$$user_Id"] },
        { $eq: ["$isblocked", "unblocked"] },
        { $eq: ["$ishidegroup", false] },
        { $eq: ["$isGroupchat", true] },
        { $eq: ["$iseventchat", true] },

      );
    }

    let query = [];
    if (type === "searchgroup") {
      query.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "dist.calculated",
          maxDistance: distanceKilometer,
          spherical: true,
          key: "location"
        },
      },
        // {
        //   $match: { _id: { $ne: new ObjectId(userId) } } // unable to search the group created by the creator.
        // }
      );
    }

    if (type === "searcheventgroup") {
      query.push({
        $match: { _id: { $eq: new ObjectId(userId) } }
      });
    }

    query.push({
      $lookup: {
        from: "Instance",
        let: { user_Id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: andConditions
              }
            }
          },
          {
            $lookup: {
              from: "users",
              let: { createrId: "$groupCreater" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$createrId"] } } },
                { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
              ],
              as: "groupCreater"
            }
          },
          { $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true } },

          {
            $lookup: {
              from: "users",
              let: { membersId: "$members" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$membersId"] } } },
                { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
              ],
              as: "members"
            }
          },

          {
            $lookup: {
              from: "users",
              let: { groupAdminId: "$groupAdmin" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$groupAdminId"] } } },
                { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
              ],
              as: "groupAdmin"
            }
          },

          {
            $lookup: {
              from: "users",
              let: { requestedUsersId: "$requestedUsers" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", { $ifNull: ["$$requestedUsersId", []] }]
                    }
                  }
                },
                { $project: { _id: 1, username: 1, location: 1, profile: 1 } }
              ],
              as: "requestedUsers"
            }
          },
          {
            $lookup: {
              from: "adminHobbies",
              let: { grouphobbiesId: "$grouphobbies" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", { $ifNull: ["$$grouphobbiesId", []] }]
                    }
                  }
                },
                { $project: { _id: 1, hobbyname: 1, plan: 1 } }
              ],
              as: "grouphobbies"
            }
          },

          {
            $project: {
              _id: 1,
              members: 1,
              eventId: 1,
              iseventchat: 1,
              isGroupchat: 1,
              Image: 1,
              groupImages: 1,
              chatName: 1,
              groupAdmin: 1,
              groupCreater: 1,
              groupDiscription: 1,
              deleteProfile: 1,
              isblocked: 1,
              blockedReason: 1,
              groupIndex: 1,
              joinMembers: 1,
              grouphobbies: 1,
              isPrivate: 1,
              requestedUsers: 1,
              ishidegroup: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        ],
        as: "groupUsers"
      }
    },
      { $unwind: { path: "$groupUsers", preserveNullAndEmptyArrays: true } },
      { $match: { groupUsers: { $ne: null } } },
      {
        $project: {
          distanceInKm: "$dist.calculated",
          location: 1,
          _id: "$groupUsers._id",
          isGroupchat: "$groupUsers.isGroupchat",
          Image: "$groupUsers.Image",
          groupImages: "$groupUsers.groupImages",
          chatName: "$groupUsers.chatName",
          groupDiscription: "$groupUsers.groupDiscription",
          deleteProfile: "$groupUsers.deleteProfile",
          isblocked: "$groupUsers.isblocked",
          blockedReason: "$groupUsers.blockedReason",
          groupIndex: "$groupUsers.groupIndex",
          joinMembers: "$groupUsers.joinMembers",
          grouphobbies: "$groupUsers.grouphobbies",
          isPrivate: "$groupUsers.isPrivate",
          ishidegroup: "$groupUsers.ishidegroup",
          createdAt: "$groupUsers.createdAt",
          updatedAt: "$groupUsers.updatedAt",
          members: "$groupUsers.members",
          groupAdmin: "$groupUsers.groupAdmin",
          groupCreater: "$groupUsers.groupCreater",
          requestedUsers: "$groupUsers.requestedUsers"
        }
      }
    );
    if (page && page != -1 && page != "all") {
      query.push({ $skip: skip }, { $limit: limit });
    }

    console.log("Aggregation Pipeline:", JSON.stringify(query, null, 2));

    const Agg = await Aggregate({ Query: query, DBName });
    return Agg;
  } catch (error) {
    console.error("AllChatsGroups_error", error);
    throw error;
  }
};


export const chatMessages = async (data) => {
  console.log("deeeeeee", data);

  try {
    const {
      DBName,
      instanceId,
      userId,
      skip,
      limit
    } = data;
    const query = [
      {
        $match: {
          instanceId: new ObjectId(instanceId),
          groupmembers: { $in: [new ObjectId(userId)] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: parseInt(skip)
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: "users",
          let: { chat_Id: "$chatId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$chat_Id"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, username: 1, randomIndex: 1, profile: 1, userblocked: 1
              }
            }
          ],
          as: "chatId"
        }
      },
      {
        $unwind: {
          path: "$chatId",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "Instance",
          let: { instance_Id: "$instanceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$instance_Id"]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, groupCreater: 1, isGroupchat: 1
              }
            },
            {
              $lookup: {
                from: "users",
                let: { groupCreater_Id: "$groupCreater" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$_id", "$$groupCreater_Id"]
                          }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 1, username: 1, profile: 1, randomIndex: 1
                    }
                  }
                ],
                as: "groupCreater"
              }
            },
            { $unwind: { path: "$groupCreater", preserveNullAndEmptyArrays: true } },
          ],
          as: "creator"
        }
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { rplyMsgId: "$replyMessage" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$rplyMsgId"]
                }
              }
            },
            {
              $project: {
                instanceId: 1,
                chatId: 1,
                text: 1,
                file: 1,
                compressfile: 1,
                voicerecord: 1,
                messageData: 1,
                seenStatus: 1,
                messageDelete: 1,

              }
            }
          ],
          as: "replyMessage"
        }
      },
      {
        $unwind: {
          path: "$replyMessage",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          replyMessage: {
            $ifNull: ["$replyMessage", {}]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { chat_Id: "$replyMessage.chatId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$chat_Id"] }
              }
            },
            {
              $project: {
                _id: 1, username: 1, profile: 1, randomIndex: 1
              }
            }
          ],
          as: "replyMessageUser"
        }
      },
      { $unwind: { path: "$replyMessageUser", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "replyMessage.chatId": "$replyMessageUser"
        }
      },
      { $project: { replyMessageUser: 0 } },
      {
        $project: {
          instanceId: 1,
          groupmembers: 1,
          text: 1,
          file: 1,
          compressfile: 1,
          voicerecord: 1,
          createdAt: 1,
          chatId: 1,
          messageData: 1,
          replyMessage: 1,
          seenStatus: 1,
          messageDelete: 1,
          creator: 1,
        }
      }
    ]

    const Agg = await Aggregate({ Query: query, DBName });
    return Agg;
  } catch (error) {
    console.error("chatMessages_error", error);
    throw error;
  }
};

export const eventListSearchWithRadiusAggregation = async (data) => {
  console.log("eventListSearchAggregation", data);
  try {
    let { DBName, eventQuery, page, limit, skip, longitude, latitude, viewerHobbyIds = [], distanceKilometer } = data;
    limit = parseInt(limit);
    page = parseInt(page);
    skip = parseInt(skip);
    const lng = Number(longitude);
    const lat = Number(latitude);
    const hasValidViewerCoords =
      Number.isFinite(lng) &&
      Number.isFinite(lat) &&
      !(lng === 0 && lat === 0);
    const maxDistanceMeters =
      Number.isFinite(Number(distanceKilometer)) && Number(distanceKilometer) > 0
        ? Number(distanceKilometer)
        : 100000;

    const viewerEventHobbyObjectIds = [];
    for (const id of Array.isArray(viewerHobbyIds) ? viewerHobbyIds : []) {
      if (id != null && ObjectId.isValid(String(id))) {
        viewerEventHobbyObjectIds.push(id instanceof ObjectId ? id : new ObjectId(id));
      }
    }

    const geoNearStage = hasValidViewerCoords
      ? [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat],
              },
              distanceField: "dist.calculated",
              maxDistance: maxDistanceMeters,
              spherical: true,
              key: "location",
            },
          },
        ]
      : [];

    const sortStage = hasValidViewerCoords
      ? {
          $sort: {
            mutualHobbiesCount: -1,
            "dist.calculated": 1,
          },
        }
      : {
          $sort: {
            mutualHobbiesCount: -1,
          },
        };

    const query = [
      ...geoNearStage,
      {
        $match: eventQuery
      },
      {
        $addFields: {
          mutualHobbiesCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$eventhobbies", []] },
                viewerEventHobbyObjectIds.length ? viewerEventHobbyObjectIds : [],
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { user_Id: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$user_Id"] } } },
            { $project: { _id: 1, username: 1, profile: 1, randomIndex: 1, hobbies: 1 } }
          ],
          as: "userId"
        }
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "adminHobbies",
          let: { hobbiesId: "$userId.hobbies" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", { $ifNull: ["$$hobbiesId", []] }] } } },
            { $project: { _id: 1, hobbyname: 1 } }
          ],
          as: "userId.hobbies"
        }
      },

      { $unwind: { path: "$eventinterested", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          let: { interestedUserId: "$eventinterested.userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", { $ifNull: ["$$interestedUserId", []] }] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                age: 1,
                profile: 1,
                location: 1,
                randomIndex: 1,
                username: 1
              }
            }
          ],
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          "eventinterested.userId": "$userDetails"
        }
      },
      { $project: { userDetails: 0 } },

      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          eventinterested: {
            $push: {
              $cond: [
                { $gt: [{ $size: { $objectToArray: "$eventinterested" } }, 0] },
                "$eventinterested",
                "$$REMOVE"
              ]
            }
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { eventinterested: "$eventinterested" }]
          }
        }
      },

      sortStage,

      {
        $lookup: {
          from: "adminHobbies",
          let: { eventhobbiesId: "$eventhobbies" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", { $ifNull: ["$$eventhobbiesId", []] }] }
              }
            },
            { $project: { _id: 1, hobbyname: 1 } }
          ],
          as: "eventhobbies"
        }
      },
      ...(page && page != -1 && page != "all" ? [{ $skip: skip }] : []),
      ...(page && page != -1 && page != "all" ? [{ $limit: limit }] : [])
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("eventListSearchAggregation_error", error);
    return { status: false, success: "error", message: error?.message || String(error), data: [] };
  }
}

export const getGroupCreaterDetails = async (data) => {
  try {
    const { instanceId, DBName } = data;
    let query = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$isGroupchat", true] },
              { $eq: ["$_id", new ObjectId(instanceId)] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { groupCreaterId: "$groupCreater" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", { $ifNull: ["$$groupCreaterId", ""] }] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profile: 1
              }
            }
          ],
          as: "groupCreaterDetail"
        }
      },
      {
        $unwind: {
          path: "$groupCreaterDetail",
          preserveNullAndEmptyArrays: true
        }
      }
    ]
    var Agg = await Aggregate({ Query: query, DBName: DBName });
    return Agg;
  } catch (error) {
    console.log("🚀 ~ getGroupCreaterDetails ~ error:", error)
  }
}