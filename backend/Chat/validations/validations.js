const Joi = require('joi');
import { EncryptData, ParsingFunc } from '../../Helper/common';
import i18next from '../../i18n.js/validation';

// export const CreatechatValidation = async (req, res, next) => {
//     console.log("bodyssassd", req.body,req.files);
//     let baseSchema = Joi.object({
//         userId: Joi.string()
//             .required()
//             .label('userId'),

//         isGroupchat: Joi.boolean()
//             .required()
//             .label('isGroupchat'),

//         members: Joi.array()
//             .items(Joi.string().required())
//             .min(2)
//             .required()
//             .label('members')
//     });

//     let schema = baseSchema.when(Joi.object({ isGroupchat: Joi.valid(true) }).unknown(), {
//         then: baseSchema.keys({
//             chatName: Joi.string()
//                 .required()
//                 .label('chatName')
//         }),
//         otherwise: baseSchema.keys({
//             chatName: Joi.string().empty('').optional().label('chatName') // Allow chatName to be empty or not included
//         })
//     });
//     const { error } = schema.validate(req.body)

//     if (error) {
//         const errordetails = error.details[0].message
//         console.log("errordetails:", errordetails);
//         let message = errordetails.replace(/"/g, '')
//         return res.json(EncryptData({ status: false, message: message }));

//     }
//     next()
// }

export const CreatechatValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body, req.files);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // Parse the members field if it's a stringified array
    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }

    if (req.body.members.length > 250) {
        return res.json(EncryptData({ status: false, message: i18next.t("Too_many_members") }));
    }

    if (typeof req.body.isGroupchat === 'string') {
        try {
            req.body.isGroupchat = ParsingFunc(req.body.isGroupchat);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_isGroupchat_format") }));
        }
    }
    if (typeof req.body.isPrivate === 'string') {
        try {
            req.body.isPrivate = ParsingFunc(req.body.isPrivate);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_isPrivate_format") }));
        }
    }
    if (typeof req.body.hide_group === 'string') {
        try {
            req.body.hide_group = ParsingFunc(req.body.hide_group);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_hide_group_format") }));
        }
    }

    if (typeof req?.body?.grouphobbies === 'string') {
        try {
            req.body.grouphobbies = ParsingFunc(req.body.grouphobbies);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("only_five_hobbies") }));
        }
    }
    if (!req?.files?.groupImages || req?.files?.groupImages?.length <= 0) {

        const groupImages = req?.files && Array.isArray(req?.files?.groupImages)
            ? req?.files?.groupImages
            : [req?.files?.groupImages];

        if (groupImages?.length <= 0) {
            return res.json(
                EncryptData({ status: false, message: "Group Image is required" })
            );
        }
    }

    let baseSchema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        isGroupchat: Joi.boolean()
            .required()
            .label('isGroupchat')
            .messages({
                'boolean.base': 'isGroupchat_invalid',
                'any.required': 'isGroupchat_required',
            }),

        isPrivate: Joi.boolean()
            .required()
            .label('isPrivate')
            .messages({
                'boolean.base': 'isPrivate_invalid',
                'any.required': 'isPrivate_required',
            }),

        // members: Joi.array()
        //     .items(Joi.string().required().messages({
        //         'string.base': 'members_item_invalid',
        //         'any.required': 'members_item_required',
        //     }))
        //     .optional()
        //     .label('members')
        //     .messages({
        //         'array.base': 'members_invalid',
        //         'array.min': 'members_min',
        //         'any.required': 'members_required',
        //     }),

        hide_group: Joi.boolean()
            .required()
            .label('hide group')
            .messages({
                'boolean.base': 'hide_group_invalid',
                'any.required': 'hide_group_required',
            }),
        // grouphobbies:  Joi.array()
        //         .items(Joi.string().required().messages({
        //             'string.base': 'hobbies_item_invalid',
        //             'any.required': 'hobbies_item_required',
        //         }))
        //         .min(1)
        //         .max(5)
        //         .required()
        //         .messages({
        //             'array.base': 'hobbies_item_invalid',
        //             'array.min': 'hobbies_min',
        //             'any.required': 'hobbies_item_required',
        //         }),
        // otherwise: Joi.forbidden()



    }).unknown(true);

    let schema = baseSchema.when(Joi.object({ isGroupchat: Joi.valid(true) }).unknown(), {
        then: baseSchema.keys({
            chatName: Joi.any()
                .required()
                .label('chatName')
                .messages({
                    'string.base': 'chatName_invalid',
                    'string.empty': 'chatName_required',
                    'any.required': 'chatName_required'
                })
        })
    }).unknown(true);

    const { error } = schema.validate(req.body);

    if (error) {
        const errordetails = error.details[0].message;
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '');
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));
    }

    // File validation
    //     if (req.files && req.files.groupImages) {
    //         const file = req.files.groupImages;
    // console.log("filefilefile",file);

    //         // Validate file type
    //         // const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    //         // if (!allowedTypes.includes(file.mimetype)) {
    //         //     return res.json(EncryptData({ status: false, message: i18next.t("invalid_file_type") }));
    //         // }

    //         // You can also add more validations like checking dimensions, etc.
    //     } else 
    if (req.files && !req.files.groupImages) {
        return res.json(EncryptData({ status: false, message: i18next.t("no_file_uploaded") }));
    }

    next();
}


export const creatMessageValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // let schema = Joi.object({


    //     chatId: Joi.string()
    //         .required()
    //         .label('chatId'),

    //     instanceId: Joi.string()
    //         .required()
    //         .label('instanceId'),
    //     text: Joi.string()
    //         .required()
    //         .label('text'),
    // })


    const schema = Joi.object({
        chatId: Joi.string()
            .required()
            .label('chatId')
            .messages({
                'string.base': 'chatId_invalid',
                'any.required': 'chatId_required',
                'string.empty': 'chatId_required'
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.base': 'instanceId_invalid_format',
                'any.required': 'instanceId_required',
                'string.empty': 'instanceId_required'
            })
        // text: Joi.string().optional().label('text'),
        // file: Joi.any().optional().label('image'),
    }).unknown(true);


    const payload = {
        chatId: req.body.chatId,
        instanceId: req.body.instanceId,
        // text: req.body.text,
        // file: req.files ? req.files.file : null
    };
    const { error } = schema.validate(payload)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const getMessagesValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'any.required': 'userId_required',
                'string.empty': 'userId_required'
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.base': 'instanceId_invalid_format',
                'any.required': 'instanceId_required',
                'string.empty': 'instanceId_required'
            }),

        page: Joi.number()
            .required()
            .label('page')
            .messages({
                'number.base': 'page_invalid',
                'any.required': 'page_required'
            }),

        limit: Joi.number()
            .required()
            .label('limit')
            .messages({
                'number.base': 'limit_invalid',
                'any.required': 'limit_required'
            })

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const editMessageValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.member === 'string') {
        try {
            req.body.member = ParsingFunc(req.body.member);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }
    let schema = Joi.object({


        messageid: Joi.string()
            .required()
            .label('messageid')
            .messages({
                'string.base': 'messageid_invalid',
                'any.required': 'messageid_required',
                'string.empty': 'messageid_required',
            }),

        member: Joi.array()
            .required()
            .label('member')
            .messages({
                'array.base': 'member_invalid_format',
                'any.required': 'member_required',
                'array.empty': 'member_required',
            }),

        text: Joi.string()
            .required()
            .label('text')
            .messages({
                'string.base': 'text_invalid',
                'any.required': 'text_required',
                'string.empty': 'text_required',
            }),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));
    }
    next()
}

export const deleteMessageValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.memberid === 'string') {
        try {
            req.body.memberid = JSON.parse(req.body.memberid);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_memberid_format") }));
        }
    }

    if (typeof req.body.id === 'string') {
        try {
            req.body.id = JSON.parse(req.body.id);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_messageId_format") }));
        }
    }
    let schema = Joi.object({


        id: Joi.array()
            .required()
            .label('id')
            .messages({
                'array.base': 'id_invalid_format',
                'any.required': 'id_required',
                'array.empty': 'id_required',
            }),

        memberid: Joi.array()
            .required()
            .label('memberid')
            .messages({
                'array.base': 'memberid_invalid_format',
                'any.required': 'memberid_required',
                'array.empty': 'memberid_required',
            }),

        delteperson: Joi.string()
            .required()
            .label('delteperson')
            .messages({
                'string.base': 'delteperson_invalid',
                'any.required': 'delteperson_required',
                'string.empty': 'delteperson_required',
            }),

        action: Joi.string()
            .required()
            .label('action')
            .messages({
                'string.base': 'action_invalid',
                'any.required': 'action_required',
                'string.empty': 'action_required',
            }),
    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));
    }
    next()
}

export const SeenUserValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        chatId: Joi.string()
            .required()
            .label('chatId')
            .messages({
                'string.base': 'chatId_invalid',
                'any.required': 'chatId_required',
                'string.empty': 'chatId_required'
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.base': 'instanceId_invalid_format',
                'any.required': 'instanceId_required',
                'string.empty': 'instanceId_required'
            })
    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const getInitialchatdataValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        page: Joi.number()
            .required()
            .label('page')
            .messages({
                'number.base': 'page_invalid',
                'any.required': 'page_required',
            }),

        limit: Joi.number()
            .required()
            .label('limit')
            .messages({
                'number.base': 'limit_invalid',
                'any.required': 'limit_required',
            }),

        // Optional location scoping. The client sends these so the chat
        // feed can be centred on the device GPS / picked location instead
        // of the stale stored user profile coordinates. All three are
        // optional — when missing, the controller falls back to the
        // user's stored profile location.
        latitude: Joi.number()
            .min(-90)
            .max(90)
            .optional()
            .label('latitude')
            .messages({
                'number.base': 'latitude_invalid',
            }),

        longitude: Joi.number()
            .min(-180)
            .max(180)
            .optional()
            .label('longitude')
            .messages({
                'number.base': 'longitude_invalid',
            }),

        distance: Joi.number()
            .min(0)
            .optional()
            .label('distance')
            .messages({
                'number.base': 'distance_invalid',
            }),

        // Some clients send the lat/long packaged inside a latLong object
        // instead of (or in addition to) the flat keys. Allow the object
        // here so requests aren't rejected.
        latLong: Joi.object()
            .optional()
            .label('latLong'),

    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const AddGroupAdminValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),

        members: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required()
            .label('members')
            .messages({
                'array.base': 'members_invalid',
                'array.min': 'members_min',
                'any.required': 'members_required',
            }),
    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const DeleteGroupAdminValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),

        members: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required()
            .label('members')
            .messages({
                'array.base': 'members_invalid',
                'array.min': 'members_min',
                'any.required': 'members_required',
            }),
    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const EditGroupchatNameValidation = async (req, res, next) => {
    console.log("bodyssassd", req.files ,req.body, req.files?.groupImag);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);

    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }
    if (typeof req.body.isPrivate === 'string') {
        try {
            req.body.isPrivate = ParsingFunc(req.body.isPrivate);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_isPrivate_format") }));
        }
    }
    if (typeof req.body.hide_group === 'string') {
        try {
            req.body.hide_group = ParsingFunc(req.body.hide_group);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_hide_group_format") }));
        }
    }
    if (typeof req?.body?.grouphobbies === 'string') {
        try {
            req.body.grouphobbies = ParsingFunc(req.body.grouphobbies);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("only_five_hobbies") }));
        }
    }

    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),
        grouphobbies: Joi.array()
            .items(Joi.string().required().messages({
                'string.base': 'hobbies_item_invalid',
                'any.required': 'hobbies_item_required',
            }))
            .min(1)
            .max(5)
            .optional()
            .label('members')
            .messages({
                'array.base': 'hobbies_item_invalid',
                'array.min': 'hobbies_min',
                'any.required': 'hobbies_item_required',
            }),
    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    // if (!req.files && (!req.body?.groupImages || req.body?.groupImages?.length === 0)) {
    //     return res.json(
    //         EncryptData({ status: false, message: "Group Image is required" })
    //     );
    // }
   
    next()
}

export const InstanceDetailsValidation = async (req, res, next) => {
    console.log("InstaceDetailsValidationbodyssassd", req.query, req?.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),

    })
    const { error } = schema.validate(req.query)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const EditMydescriptionValidation = async (req, res, next) => {
    console.log("InstaceDetailsValidationbodyssassd", req?.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const AddRemoveGroupMembersValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }



    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),

        members: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required()
            .label('members')
            .messages({
                'array.base': 'members_invalid',
                'array.min': 'members_min',
                'any.required': 'members_required',
            }),
        oldMembRemove: Joi.string()
            .required()
            .label('oldMembRemove')
            .messages({
                'string.empty': 'oldMembRemove_required',
                'any.required': 'oldMembRemove_required',
            }),

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),
    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const ExitGroupValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),


    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const NewGroupMembersAddValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.members === 'string') {
        try {
            req.body.members = ParsingFunc(req.body.members);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("Invalid_members_format") }));
        }
    }
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),

        members: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required()
            .label('members')
            .messages({
                'array.base': 'members_invalid',
                'array.min': 'members_min',
                'any.required': 'members_required',
            }),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const InstanceDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.instanceId === 'string') {
        try {
            req.body.instanceId = ParsingFunc(req.body.instanceId);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: i18next.t("invalid_instanceId_format") }));
        }
    }
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.array()
            .required()
            .label('instanceId')
            .messages({
                'array.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),


    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const clearchatValidation = async (req, res, next) => {
    console.log("clearchatValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),


    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const GroupJoinandUnjoinValidation = async (req, res, next) => {
    console.log("GroupJoinandUnjoinValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),


    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const UserSearchHobbyBasedGroupFilterValidation = async (req, res, next) => {
    console.log("UserSearchHobbyBasedGroupFilterValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),
        // distance: Joi.number()
        //     .required()
        //     .label('page')
        //     .messages({
        //         'number.base': 'distance_invalid',
        //         'any.required': 'distance_required',
        //     }),
        // latitude: Joi.number()
        //     .required()
        //     .label('latitude')
        //     .messages({
        //         'number.base': 'latitude_invalid',
        //         'any.required': 'latitude_required',
        //     }),

        // longitude: Joi.number()
        //     .required()
        //     .label('longitude')
        //     .messages({
        //         'number.base': 'longitude_invalid',
        //         'any.required': 'longitude_required',
        //     }),
        page: Joi.number()
            .required()
            .label('page')
            .messages({
                'number.base': 'page_invalid',
                'any.required': 'page_required',
            }),

        limit: Joi.number()
            .required()
            .label('limit')
            .messages({
                'number.base': 'limit_invalid',
                'any.required': 'limit_required',
            }),
    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const PrivateGroupAcceptRejectValidation = async (req, res, next) => {
    console.log("PrivateGroupAcceptRejectValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),
        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),
        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),

    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const getChatersAndFollowersListValidation = async (req, res, next) => {
    console.log("getChatersAndFollowersList123", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        page: Joi.number()
            .required()
            .label('page')
            .messages({
                'number.base': 'page_invalid',
                'any.required': 'page_required',
            }),

        limit: Joi.number()
            .required()
            .label('limit')
            .messages({
                'number.base': 'limit_invalid',
                'any.required': 'limit_required',
            }),

        // type: Joi.string() // 
        // .required()
        // .label('type')

    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}


export const getSingleInitialchatdataValidation = async (req, res, next) => {
    // console.log("getSingleInitialchatdataValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        page: Joi.number()
            .required()
            .label('page')
            .messages({
                'number.base': 'page_invalid',
                'any.required': 'page_required',
            }),

        limit: Joi.number()
            .required()
            .label('limit')
            .messages({
                'number.base': 'limit_invalid',
                'any.required': 'limit_required',
            }),


    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const HideGroupValidation = async (req, res, next) => {
    console.log("HideGroupHideGroup", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),
        instanceId: Joi.string()
            .required()
            .label('instanceId')
            .messages({
                'string.empty': 'instanceId_required',
                'any.required': 'instanceId_required',
            }),
        hide_group: Joi.boolean()
            .required()
            .label('hide group')
            .messages({
                'boolean.base': 'hide_group_invalid',
                'any.required': 'hide_group_required',
            }),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}