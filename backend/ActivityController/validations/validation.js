const Joi = require('joi');
import { EncryptData, ParsingFunc } from '../../Helper/common';
import i18next from '../../i18n.js/validation';

export const UserEventAddValidation = async (req, res, next) => {
    console.log("Request body and files:", req.body, "filesfiles", req.files);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let imageFiles = [];
    if (req.files?.image) {
        imageFiles = Array.isArray(req.files.image)
            ? req.files.image
            : [req.files.image];
    }
    if (typeof req.body.eventhobbies === 'string') {
        try {
            req.body.eventhobbies = ParsingFunc(req.body.eventhobbies);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid eventhobbies format" }));
        }
    }
    if (typeof req.body.inviteMembers === 'string') {
        try {
            req.body.inviteMembers = ParsingFunc(req.body.inviteMembers);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid inviteMembers format" }));
        }
    }
    let parsedBodyImages = null;
    if (req.body?.image != null && req.body.image !== '') {
        const parsed = ParsingFunc(req.body.image);
        if (Array.isArray(parsed)) {
            parsedBodyImages = parsed;
        } else if (parsed != null && parsed !== '') {
            parsedBodyImages = [parsed];
        }
    }

    const mergedData = {
        ...req.body,
        image: imageFiles.length > 0 ? imageFiles : parsedBodyImages,
    };

    // express-fileupload file objects (allow temp files without in-memory binary data)
    const imageObjectSchema = Joi.object({
        name: Joi.string().required().messages({
            'string.base': 'image_name_string',
            'any.required': 'image_name_required'
        }),
        mimetype: Joi.string()
            .valid('image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'image/heif')
            .required()
            .messages({
                'string.base': 'image_mimetype_string',
                'any.only': 'image_mimetype_invalid',
                'any.required': 'image_mimetype_required'
            }),
    }).unknown(true);

    const imageFilenameSchema = Joi.string()
        .pattern(/\.(webp|jpeg|jpg|png|heif|heic)$/)
        .required()
        .messages({
            'string.base': 'image_filename_string',
            'string.pattern.base': 'image_filename_invalid_format',
            'any.required': 'image_filename_required'
        });

    const schema = Joi.object({
        userId: Joi.string().required().messages({
            'string.base': 'userId_string',
            'any.required': 'userId_required'
        }),
        eventTitle: Joi.string().required().messages({
            'string.base': 'eventTitle_string',
            'any.required': 'eventTitle_required'
        }),
        startDate: Joi.string().required().messages({
            'string.base': 'startDate_string',
            'any.required': 'startDate_required'
        }),
        endDate: Joi.string().required().messages({
            'string.base': 'endDate_string',
            'any.required': 'endDate_required'
        }),
        description: Joi.string().required().messages({
            'string.base': 'description_string',
            'any.required': 'description_required'
        }),
        latitude: Joi.number().required().messages({
            'number.base': 'latitude_number',
            'any.required': 'latitude_required'
        }),
        longitude: Joi.number().required().messages({
            'number.base': 'longitude_number',
            'any.required': 'longitude_required'
        }),
        image: Joi.array()
            .items(Joi.alternatives().try(imageObjectSchema, imageFilenameSchema))
            .min(1)
            .required()
            .messages({
                'array.base': 'image_invalid_type',
                'array.min': 'image_required',
                'any.required': 'image_required',
            }),
        privacy_status: Joi.string().required().messages({
            'string.base': 'privacyStatus_string',
            'any.required': 'privacyStatus_required'
        }),
        eventAddress: Joi.string().required().messages({
            'string.base': 'eventAddress_string',
            'any.required': 'eventAddress_required'
        }),
        eventhobbies: Joi.array().items(Joi.string())
            .min(1)
            .max(5)
            .required()
            .label("Event Hobbies")
            .messages({
                'array.base': 'eventHobbies_array',
                'any.required': 'eventHobbies_required'
            }),
        inviteMembers: Joi.array().items(Joi.string()).optional().messages({
            'array.base': 'inviteMembers_array'
        })
    }).unknown(true);

    const { error } = schema.validate(mergedData);

    if (error) {
        const detail = error.details[0];
        console.log("Validation error details:", detail);
        let messageKey =
            detail.type === 'alternatives.match'
                ? 'image_invalid_type'
                : (detail.context?.label || detail.message).replace(/"/g, '');
        const translated = i18next.t(messageKey);
        return res.json(EncryptData({
            status: false,
            message: translated && translated !== messageKey ? translated : i18next.t('image_invalid_type'),
        }));
    }
    if (!req.files?.image && (!mergedData.image || mergedData.image.length === 0)) {
        return res.json(EncryptData({ status: false, message: i18next.t("image_required") }));
    }
    next();
}

export const UserEventEditValidation = async (req, res, next) => {
    // console.log("bodyssassd", req.body, req.files);
    console.log("Request UserEventEditValidation files:", typeof req.body?.image, req.body, req.body.image, (!req.files || (!req.body?.image && req.body?.image?.length <= 0)));
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.Delete === 'string') {
        try {
            req.body.Delete = ParsingFunc(req.body.Delete);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid members format" }));
        }
    }

    if (typeof req.body.eventhobbies === 'string') {
        try {
            req.body.eventhobbies = ParsingFunc(req.body.eventhobbies);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid eventhobbies format" }));
        }
    }
    if (typeof req.body.inviteMembers === 'string') {
        try {
            req.body.inviteMembers = ParsingFunc(req.body.inviteMembers);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid inviteMembers format" }));
        }
    }
    // let imageFiles = [];
    // if (req.files && req.files.image) {
    //     imageFiles = Array.isArray(req.files.image)
    //         ? req.files.image.map(file => file)
    //         : (req?.files?.image ? [req.files.image] : undefined);
    // }

    // // Merge body data with image files
    // const mergedData = {
    //     ...req.body,
    //     image: (imageFiles?.length > 0 ? imageFiles : ParsingFunc(req.body.image))
    // };
    // console.log("mergedData", mergedData, imageFiles, imageFiles?.length > 0, (imageFiles?.length > 0 ? imageFiles : ParsingFunc(req.body.image)));

    // // Define the schema
    // const imageObjectSchema = Joi.object({
    //     name: Joi.string().required(),
    //     data: Joi.binary().required(),
    //     size: Joi.number().required(),
    //     encoding: Joi.string().required(),
    //     tempFilePath: Joi.string().allow(''),
    //     truncated: Joi.boolean().required(),
    //     mimetype: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png', 'image/webp').required(),
    //     md5: Joi.string().required(),
    //     mv: Joi.function().required()
    // });

    // const imageFilenameSchema = Joi.string().pattern(/\.webp$|\.jpeg$|\.jpg$|\.png$/).required();


    const schema = Joi.object({
        userId: Joi.string().required().label('User ID').messages({
            'string.base': 'userId_string_base',
            'string.empty': 'userId_string_empty',
            'any.required': 'userId_any_required'
        }),
        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
            }),
        eventTitle: Joi.string().required().messages({
            'string.base': 'eventTitle_string',
            'any.required': 'eventTitle_required'
        }),
        startDate: Joi.string().required().messages({
            'string.base': 'startDate_string',
            'any.required': 'startDate_required'
        }),
        endDate: Joi.string().required().messages({
            'string.base': 'endDate_string',
            'any.required': 'endDate_required'
        }),
        description: Joi.string().required().messages({
            'string.base': 'description_string',
            'any.required': 'description_required'
        }),
        latitude: Joi.number().required().messages({
            'number.base': 'latitude_number',
            'any.required': 'latitude_required'
        }),
        longitude: Joi.number().required().messages({
            'number.base': 'longitude_number',
            'any.required': 'longitude_required'
        }),
        Delete: Joi.array().items(Joi.string()).label('Delete'),
        // Uncomment this block if image validation is needed
        // image: Joi.alternatives().try(
        //     Joi.array().items(imageObjectSchema).min(1),
        //     Joi.array().items(imageFilenameSchema).min(1)
        // ).required().label('Event Image').messages({
        //     'any.required': 'Please upload at least one event image.',
        //     'array.min': 'At least one event image is required.',
        //     'string.pattern.base': 'Only .jpeg, .jpg, .png, or .webp formats are allowed.'
        // }),
        privacy_status: Joi.string().required().messages({
            'string.base': 'privacyStatus_string',
            'any.required': 'privacyStatus_required'
        }),
        eventAddress: Joi.string().required().messages({
            'string.base': 'eventAddress_string',
            'any.required': 'eventAddress_required'
        }),
        eventhobbies: Joi.array().items(Joi.string()).required().messages({
            'array.base': 'eventHobbies_array',
            'any.required': 'eventHobbies_required'
        }),
        inviteMembers: Joi.array().items(Joi.string()).optional().messages({
            'array.base': 'inviteMembers_array'
        }),
        newMemberAdd: Joi.array().items(Joi.string()).optional().messages({
            'array.base': 'newMemberAdd_array'
        })

    }).unknown(true);

    const { error } = schema.validate(req.body);

    if (error) {
        const errorDetails = error.details[0].message;
        console.log("Validation error details:", errorDetails);
        const message = errorDetails.replace(/"/g, '');
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));
    }
    // if (!req.files && (!req.body?.image || req.body.image.length === 0)) {
    //     return res.json(
    //         EncryptData({ status: false, message: "Event Image is required" })
    //     );
    // }
    next();
}


export const UserEventinterestValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),

        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
            }),

        type: Joi.string()
            .required()
            .messages({
                'any.required': 'type_required',
                'string.empty': 'type_required',
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


export const UserEventjoinValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),

        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
            }),

        type: Joi.string()
            .required()
            .messages({
                'any.required': 'type_required',
                'string.empty': 'type_required',
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

export const UserFilterValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.eventhobbies === 'string') {
        try {
            req.body.eventhobbies = ParsingFunc(req.body.eventhobbies);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid eventhobbies format" }));
        }
    }
    let schema = Joi.object({


        // longitude: Joi.number()
        //     .required()
        //     .label('longitude'),
        // latitude: Joi.number()
        //     .required()
        //     .label('latitude'),
        // distance: Joi.number()
        //     .required()
        //     .label('distance'),

        distance: Joi.number()
            .required()
            .label('distance')
            .messages({
                'number.base': 'Distance must be a number.',
                'any.required': 'Distance is required.',
            }),

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'User ID must be a string.',
                'any.required': 'User ID is required.',
                'string.empty': 'User ID cannot be empty.',
            }),

        eventhobbies: Joi.array()
            .items(Joi.string())
            .min(1)
            .required()
            .label('eventhobbies')
            .messages({
                'array.base': 'Event hobbies must be an array.',
                'array.min': 'Please provide at least one event hobby.',
                'any.required': 'Event hobbies are required.',
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


export const UserEventPublicOrPrivateValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'User ID must be a string.',
                'any.required': 'User ID is required.',
                'string.empty': 'User ID cannot be empty.',
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

export const UserEventCommentsValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),

        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
            }),
        comments: Joi.string()
            .required()
            .messages({
                'string.base': 'Comments must be a string.',
                'any.required': 'Comments are required.',
                'string.empty': 'Comments cannot be empty.'
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

export const UserDeleteEventCommentsValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        commentId: Joi.string()
            .required()
            .messages({
                'string.base': 'Comment ID must be a string.',
                'any.required': 'Comment ID is required.',
                'string.empty': 'Comment ID cannot be empty.'
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

export const UserGetcommentslistValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
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

export const UserEventCreatedlistsValidation = async (req, res, next) => {
    console.log("bodyssassd", req.query);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),
        // eventId: Joi.string()
        //     .required()
        //     .label('eventId'),
        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),

    }).unknown(true)
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

export const UserEventWhishValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),
        // eventId: Joi.string()
        //     .required()
        //     .label('eventId'),
        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
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

export const UserEventWhishListsValidation = async (req, res, next) => {
    console.log("bodyssassd", req.query);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
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

export const DeleteEventValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
            }),
        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
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


export const EventImageDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema;
    if (req.body.type == "event") {
        schema = Joi.object({

            userId: Joi.string()
                .required()
                .messages({
                    'any.required': 'userId_required',
                    'string.empty': 'userId_required',
                }),
            eventId: Joi.string()
                .required()
                .messages({
                    'any.required': 'eventId_required',
                    'string.empty': 'eventId_required',
                }),
            type: Joi.string()
                .required()
                .label('type')
                .messages({
                    'string.base': 'type_invalid',
                    'string.empty': 'type_required',
                    'any.required': 'type_required',
                }),
            Imagename: Joi.string()
                .required()
                .messages({
                    'string.base': 'Image name must be a string.',
                    'any.required': 'Image name is required.',
                    'string.empty': 'Image name cannot be empty.',
                }),


        })
    }
    else if (req.body.type == "profile") {
        schema = Joi.object({

            userId: Joi.string()
                .required()
                .messages({
                    'any.required': 'userId_required',
                    'string.empty': 'userId_required',
                }),
            type: Joi.string()
                .required()
                .label('type')
                .messages({
                    'string.base': 'type_invalid',
                    'string.empty': 'type_required',
                    'any.required': 'type_required',
                }),
            Imagename: Joi.string()
                .required()
                .messages({
                    'string.base': 'Image name must be a string.',
                    'any.required': 'Image name is required.',
                    'string.empty': 'Image name cannot be empty.',
                }),

        })
    }
    else if (req.body.type == "group") {
        schema = Joi.object({

            instanceId: Joi.string()
                .required()
                .messages({
                    'string.base': 'Instance ID must be a string.',
                    'any.required': 'Instance ID is required.',
                    'string.empty': 'Instance ID cannot be empty.',
                }),

            userId: Joi.string()
                .required()
                .messages({
                    'any.required': 'userId_required',
                    'string.empty': 'userId_required',
                }),
            type: Joi.string()
                .required()
                .label('type')
                .messages({
                    'string.base': 'type_invalid',
                    'string.empty': 'type_required',
                    'any.required': 'type_required',
                }),
            Imagename: Joi.string()
                .required()
                .messages({
                    'string.base': 'Image name must be a string.',
                    'any.required': 'Image name is required.',
                    'string.empty': 'Image name cannot be empty.',
                }),
        })
    }
    else {
        return res.json(EncryptData({ status: false, message: "Invalid type provided" }));
    }

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

export const FilterUsersNearLocationValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    if (typeof req.body.gender === 'string') {
        try {
            req.body.gender = ParsingFunc(req.body.gender);
        } catch (error) {
            return res.json(EncryptData({ status: false, message: "Invalid gender format" }));
        }
    }
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
                'string.base': 'userId_must_be_string',
            }),

        gender: Joi.array()
            .items(Joi.string().required())
            .required()
            .messages({
                'array.base': 'gender_must_be_array',
                'array.min': 'gender_is_required',
                'any.required': 'gender_is_required',
                'string.base': 'gender_items_must_be_string',
                'string.empty': 'gender_items_cannot_be_empty',
            }),

        agestart: Joi.number()
            .required()
            .messages({
                'any.required': 'agestart_required',
                'number.base': 'agestart_must_be_number',
            }),

        ageend: Joi.number()
            .required()
            .messages({
                'any.required': 'ageend_required',
                'number.base': 'ageend_must_be_number',
            }),

        hobbies: Joi.array()
            .items(Joi.string())
            .optional()
            .allow(null)
            .default([])
            .messages({
                'array.base': 'hobbies_must_be_array',
                'string.base': 'hobbies_items_must_be_string',
                'string.empty': 'hobbies_items_cannot_be_empty',
            }),

        distance: Joi.number()
            .required()
            .messages({
                'any.required': 'distance_required',
                'number.base': 'distance_must_be_number',
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

export const EventDetailsValidation = async (req, res, next) => {
    console.log("EventDetailsValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        eventId: Joi.string()
            .required()
            .messages({
                'any.required': 'eventId_required',
                'string.empty': 'eventId_required',
                'string.base': 'eventId_must_be_string',
            }),

        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',
                'string.empty': 'userId_required',
                'string.base': 'userId_must_be_string',
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