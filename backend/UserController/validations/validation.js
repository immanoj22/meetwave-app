const Joi = require('joi');
import { EncryptData } from '../../Helper/common';
import i18next from '../../i18n.js/validation';

export const UserEmailValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // let schema = Joi.object({
    //     email: Joi.string()
    //         .email({ tlds: { allow: ['com', 'net', 'org'] } }) 
    //         .required()
    //         .label('Email')
    //         .messages({
    //             'string.email': "The email must be a valid email address.",
    //             'any.required': "Email is a required field."
    //         }),

    //     ageconfirm_status: Joi.boolean()
    //         .required()
    //         .label('Age Confirmation Status'),
    //     fcmtoken: Joi.string()
    //         .required()
    //         .label('FCM Token'),
    //     password: Joi.string()
    //         .trim()
    //         .min(5)
    //         .max(15)
    //         .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{5,15}$"))
    //         .required()
    //         .label('Password')
    //         .messages({
    //             'string.pattern.base': "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    //             'string.min': "Password must be at least 5 characters long.",
    //             'string.max': "Password must be at most 15 characters long.",
    //             'any.required': "Password is required."
    //         }),

    // }).unknown(true)
    let schema = Joi.object({
        email: Joi.string()
            // .email({ tlds: { allow: ['com', 'net', 'org'] } })
            .email({ tlds: { allow: false } })
            .required()
            .messages({
                'string.email': 'email_invalid',
                'any.required': 'email_required',
                'string.empty': 'email_required'
            }),

        ageconfirm_status: Joi.boolean()
            .required()
            .messages({
                'any.required': 'age_required',
                'boolean.base': 'age_required'
            }),

        fcmtoken: Joi.string()
            .required()
            .messages({
                'any.required': 'fcmtoken_required',
                'string.empty': 'fcmtoken_required'
            }),

        password: Joi.string()
            .trim()
            .min(8)
            .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~])[A-Za-z\d!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'password_pattern',
                'string.min': 'password_min',
                'string.max': 'password_max',
                'any.required': 'password_required',
                'string.empty': 'password_required'
            })
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


export const UserOtpValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // let schema = Joi.object({

    //     email: Joi.string()
    //         .email({ tlds: { allow: false } }).trim()
    //         .required()
    //         .label('Email'),

    //     OTP: Joi.string()
    //         .min(4)
    //         .max(4)  // Assuming OTP is a 4-digit number
    //         .required()
    //         .label('OTP'),

    // })
    let schema = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .trim()
            .required()
            .label('Email')
            .messages({
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required'
            }),

        OTP: Joi.string()
            .min(4)
            .max(4)
            .required()
            .label('OTP')
            .messages({
                'string.empty': 'otp_required',
                'any.required': 'otp_required',
                'string.min': 'otp_invalid',
                'string.max': 'otp_invalid'
            })
    });
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

export const UserProfileValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // let schema = Joi.object({
    //     name: Joi.string().trim()
    //         .min(1)
    //         .max(100)
    //         .required()
    //         .label('Name'),
    //     username: Joi.string().trim()
    //         .min(1)
    //         .max(100)
    //         .required()
    //         .label('username'),

    //     dob: Joi.date()
    //         .iso()
    //         .required()
    //         .label('Date of Birth'),

    //     gender: Joi.string()
    //         .required()
    //         .label('Gender'),
    //     //     privacy_status: Joi.string()
    //     // .required()
    //     // .label('Privacy Status'),
    //     email: Joi.string()
    //         .email({ tlds: { allow: false } }).trim()
    //         .required()
    //         .label('Email'),
    //     latitude: Joi.number()
    //         .required()
    //         .label('latitude'),
    //     longitude: Joi.number()
    //         .required()
    //         .label('longitude'),
    //     personalAddress: Joi.string()
    //         .required()
    //         .label('personal address'),
    //     age: Joi.number()
    //         .required()
    //         .label('age'),

    // }).unknown(true)
    const schema = Joi.object({
        // name: Joi.string().trim()
        //     .min(1)
        //     .max(100)
        //     .required()
        //     .label('Name')
        //     .messages({
        //         'string.empty': 'name_required',
        //         'any.required': 'name_required',
        //         'string.min': 'name_min',
        //         'string.max': 'name_max',
        //     }),

        username: Joi.string().trim()
            .min(1)
            .max(100)
            .required()
            .label('Username')
            .messages({
                'string.empty': 'username_required',
                'any.required': 'username_required',
                'string.min': 'username_min',
                'string.max': 'username_max',
            }),

        dob: Joi.date().iso()
            .required()
            .label('Date of Birth')
            .messages({
                'date.base': 'dob_invalid',
                'any.required': 'dob_required'
            }),

        gender: Joi.string()
            .required()
            .label('Gender')
            .messages({
                'any.required': 'gender_required',
                'string.empty': 'gender_required'
            }),

        email: Joi.string().email({ tlds: { allow: false } }).trim()
            .required()
            .label('Email')
            .messages({
                'string.email': 'email_invalid',
                'any.required': 'email_required',
                'string.empty': 'email_required'
            }),
        latitude: Joi.number()
            .required()
            .messages({
                'number.base': 'latitude_invalid',
                'any.required': 'latitude_required'
            }),

        longitude: Joi.number()
            .required()
            .messages({
                'number.base': 'longitude_invalid',
                'any.required': 'longitude_required'
            }),

        personalAddress: Joi.string()
            .required()
            .label('Personal Address')
            .messages({
                'any.required': 'address_required',
                'string.empty': 'address_required'
            }),

        age: Joi.number()
            .required()
            .label('Age')
            .messages({
                'number.base': 'age_invalid',
                'any.required': 'age_required'
            }),
    }).unknown(true);
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


export const EditRegisterProfileValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // let schema = Joi.object({
    //     name: Joi.string().trim()
    //         .min(1)
    //         .max(100)
    //         .required()
    //         .label('Name'),
    //     username: Joi.string().trim()
    //         .min(1)
    //         .max(100)
    //         .required()
    //         .label('Username'),
    //     dob: Joi.date()
    //         .iso()
    //         .required()
    //         .label('Date of Birth'),
    //     gender: Joi.string()
    //         .required()
    //         .label('Gender'),
    //     email: Joi.string()
    //         .email({ tlds: { allow: false } })
    //         .trim()
    //         .required()
    //         .label('Email'),
    //     // privacy_status: Joi.string()
    //     // .required()
    //     // .label('Privacy Status'),
    //     /*     latitude: Joi.number()
    //             .optional()
    //             .label('Latitude'),
    //         longitude: Joi.number()
    //             .optional()
    //             .label('Longitude'), */
    //     personalAddress: Joi.string()
    //         .required()
    //         .label('personal address'),
    //     age: Joi.number()
    //         .required()
    //         .label('age'),
    // }).unknown(true);
    const schema = Joi.object({
        // name: Joi.string().trim()
        //     .min(1).max(100).required()
        //     .label('Name')
        //     .messages({
        //         'string.empty': 'name_required',
        //         'string.min': 'name_min',
        //         'string.max': 'name_max',
        //         'any.required': 'name_required'
        //     }),

        username: Joi.string().trim()
            .min(1).max(100).required()
            .label('Username')
            .messages({
                'string.empty': 'username_required',
                'string.min': 'username_min',
                'string.max': 'username_max',
                'any.required': 'username_required'
            }),

        dob: Joi.date().iso().required()
            .label('Date of Birth')
            .messages({
                'date.base': 'dob_invalid',
                'date.format': 'dob_invalid',
                'any.required': 'dob_required'
            }),

        gender: Joi.string().required()
            .label('Gender')
            .messages({
                'any.required': 'gender_required',
                'string.empty': 'gender_required'
            }),

        email: Joi.string().email({ tlds: { allow: false } }).trim().required()
            .label('Email')
            .messages({
                'string.email': 'email_invalid',
                'any.required': 'email_required',
                'string.empty': 'email_required'
            }),

        personalAddress: Joi.string().required()
            .label('Personal address')
            .messages({
                'string.empty': 'address_required',
                'any.required': 'address_required'
            }),

        age: Joi.number().required()
            .label('Age')
            .messages({
                'number.base': 'age_invalid',
                'any.required': 'age_required'
            }),
    }).unknown(true);
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

export const UserResendValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        // email: Joi.string()
        //     .email({ tlds: { allow: false } })
        //     .required()
        //     .label('Email'),
        email: Joi.string().email({ tlds: { allow: false } }).required()
            .label('Email')
            .messages({
                'string.email': 'email_invalid',
                'any.required': 'email_required',
                'string.empty': 'email_required'
            }),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        const message = errordetails.replace(/"/g, '')
        const translated = i18next.t(message);
        return res.json(EncryptData({ status: false, message: translated || message }));

    }
    next()
}

export const UserLoginValidation = async (req, res, next) => {
    console.log("Request_UserLoginValidation_Body:", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    // const schema = Joi.object({

    //     email: Joi.string()
    //         .email()  // Start with basic email validation first
    //         .required()
    //         .label('Email')
    //         .messages({
    //             'string.email': "The email must be a valid email address.",
    //             'any.required': "Email is a required field."
    //         }),

    //     fcmtoken: Joi.string()
    //         .required()
    //         .label('Fcm token')
    //         .messages({
    //             'any.required': "Fcm token is required."
    //         }),
    //     password: Joi.string()
    //         .required()
    //         .label('Password'),
    // }).unknown(true);
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .label('Email')
            .messages({
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required'
            }),

        fcmtoken: Joi.string()
            .required()
            .label('Fcm token')
            .messages({
                'string.empty': 'fcmtoken_required',
                'any.required': 'fcmtoken_required'
            }),

        password: Joi.string()
            .required()
            .label('Password')
            .messages({
                'string.empty': 'password_required',
                'any.required': 'password_required'
            }),
    }).unknown(true);

    // Validate request body
    const { error } = schema.validate(req.body);

    if (error) {
        const messageKey = error.details[0].message;
        console.log("Validation Error Key:", messageKey);
        const message = messageKey.replace(/"/g, '')
        const translatedMessage = i18next.t(message);
        return res.status(200).json(EncryptData({ status: false, message: translatedMessage }));
    }

    next();
}


export const UserLoginverifyValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email').messages({
            'string.email': 'email_invalid',
            'any.required': 'email_required'
        }),
        OTP: Joi.string().length(4).required().label('OTP').messages({
            'string.length': 'otp_invalid',
            'any.required': 'otp_required'
        }),
        fcmtoken: Joi.string().required().label('Fcm token').messages({
            'any.required': 'fcmtoken_required'
        })
    });
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

export const UserHobbiesValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',    // Correct error code for string type error
                'any.required': 'userId_required',
                'string.empty': 'userId_required',  // Also good to handle empty strings explicitly
            }),
        subcategoryId: Joi.array()
            .items(Joi.string().required())
            .required()
            .label('subcategoryId')
            .messages({
                'array.base': 'subcategoryId_invalid',   // array type error
                'any.required': 'subcategoryId_required',
                'array.includesRequiredUnknowns': 'subcategoryId_invalid', // for invalid array items
                'array.min': 'subcategoryId_required',   // if you want min items validation
            }),
        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
                'any.required': 'type_required',
                'string.empty': 'type_required',
            }),
    });
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


export const UserHobbiesDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        userId: Joi.string()
            .required()
            .messages({
                'any.required': 'userId_required',  // your translation key
                'string.empty': 'userId_required',
                'string.base': 'userId_invalid',
            }),
        hobbyId: Joi.string()
            .required()
            .messages({
                'any.required': 'hobbyId_required',
                'string.empty': 'hobbyId_required',
                'string.base': 'hobbyId_invalid',
            }),
    });
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



export const Userfollow = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        from: Joi.string()
            .required()
            .label('from')
            .messages({
                'string.base': 'from_invalid',
                'string.empty': 'from_required',
                'any.required': 'from_required',
            }),
        to: Joi.string()
            .required()
            .label('to')
            .messages({
                'string.base': 'to_invalid',
                'string.empty': 'to_required',
                'any.required': 'to_required',
            }),
    }).unknown(true);
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


export const Userunfollow = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        from: Joi.string()
            .required()
            .label('from')
            .messages({
                'string.base': 'from_invalid',
                'string.empty': 'from_required',
                'any.required': 'from_required',
            }),
        to: Joi.string()
            .required()
            .label('to')
            .messages({
                'string.base': 'to_invalid',
                'string.empty': 'to_required',
                'any.required': 'to_required',
            }),
        request_id: Joi.string()
            .required()
            .label('request_id')
            .messages({
                'string.base': 'request_id_invalid',
                'string.empty': 'request_id_required',
                'any.required': 'request_id_required',
            }),
        accept: Joi.string()
            .required()
            .label('accept')
            .messages({
                'string.base': 'accept_invalid',
                'string.empty': 'accept_required',
                'any.required': 'accept_required',
            }),
    });
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

// from, to, request_id, accept 
export const privateuserfollow = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        // userId: Joi.string()  
        // .required()
        // .label('userId'),
        from: Joi.string()
            .required()
            .label('from')
            .messages({
                'string.base': 'from_invalid',
                'string.empty': 'from_required',
                'any.required': 'from_required',
            }),
        to: Joi.string()
            .required()
            .label('to')
            .messages({
                'string.base': 'to_invalid',
                'string.empty': 'to_required',
                'any.required': 'to_required',
            }),

        accept: Joi.string()
            .required()
            .label('accept')
            .messages({
                'string.base': 'accept_invalid',
                'string.empty': 'accept_required',
                'any.required': 'accept_required',
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

// from, to, request_id, accept 
export const privateUnuserfollow = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        from: Joi.string()
            .required()
            .label('from')
            .messages({
                'string.base': 'from_invalid',
                'string.empty': 'from_required',
                'any.required': 'from_required',
            }),
        to: Joi.string()
            .required()
            .label('to')
            .messages({
                'string.base': 'to_invalid',
                'string.empty': 'to_required',
                'any.required': 'to_required',
            }),
        request_id: Joi.string()
            .required()
            .label('request_id')
            .messages({
                'string.base': 'request_id_invalid',
                'string.empty': 'request_id_required',
                'any.required': 'request_id_required',
            }),
        accept: Joi.string()
            .required()
            .label('accept')
            .messages({
                'string.base': 'accept_invalid',
                'string.empty': 'accept_required',
                'any.required': 'accept_required',
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


export const userlike = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        likeId: Joi.string()
            .required()
            .label('likeId')
            .messages({
                'string.base': 'likeId_invalid',
                'string.empty': 'likeId_required',
                'any.required': 'likeId_required'
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

export const userunlike = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        likeId: Joi.string()
            .required()
            .label('likeId')
            .messages({
                'string.base': 'likeId_invalid',
                'string.empty': 'likeId_required',
                'any.required': 'likeId_required'
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

export const GetuserFollower = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
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
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
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

export const GetuserFollowing = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
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
        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
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


export const UsersecurityAccountValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        privacy_status: Joi.boolean()
            .required()
            .label('privacy_status')
            .messages({
                'boolean.base': 'privacy_status_invalid',
                'any.required': 'privacy_status_required',
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

export const ParticulateuserProfile = async (req, res, next) => {
    console.log("bodyssassd", req.query);
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

export const userplanadd = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        planId: Joi.string()
            .required()
            .label('planId')
            .messages({
                'string.base': 'planId_invalid',
                'string.empty': 'planId_required',
                'any.required': 'planId_required',
            }),

        planarrId: Joi.string()
            .required()
            .label('planarrId')
            .messages({
                'string.base': 'planarrId_invalid',
                'string.empty': 'planarrId_required',
                'any.required': 'planarrId_required',
            }),

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_invalid',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
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

export const useremailupdate = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    const schema = Joi.object({
        id: Joi.string()
            .required()
            .label('id')
            .messages({
                'string.base': 'id_invalid',
                'string.empty': 'id_required',
                'any.required': 'id_required',
            }),

        emailupdate: Joi.boolean()
            .required()
            .label('emailupdate')
            .messages({
                'boolean.base': 'emailupdate_invalid',
                'any.required': 'emailupdate_required',
            }),
    });
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

export const UserAccDelete = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

export const UserHelpvalidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        feature: Joi.string()
            .required()
            .label('feature')
            .messages({
                'string.base': 'feature_invalid',
                'string.empty': 'feature_required',
                'any.required': 'feature_required',
            }),

        description: Joi.string()
            .required()
            .label('description')
            .messages({
                'string.base': 'description_invalid',
                'string.empty': 'description_required',
                'any.required': 'description_required',
            }),

        email: Joi.string()
            .email()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
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

export const Userfeedbackvalidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        feedback: Joi.string()
            .required()
            .label('feedback')
            .messages({
                'string.base': 'feedback_invalid',
                'string.empty': 'feedback_required',
                'any.required': 'feedback_required',
            }),
        email: Joi.string()
            .email()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
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

export const UserLogoutvalidation = async (req, res, next) => {
    console.log("bodyssassd_logout", req.body);
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

        fcmtoken: Joi.string()
            .required()
            .label('fcmtoken')
            .messages({
                'string.base': 'fcmtoken_invalid',
                'string.empty': 'fcmtoken_required',
                'any.required': 'fcmtoken_required',
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

export const UserEnableDisableTFAvalidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        TFA: Joi.boolean()
            .required()
            .label('TFA')
            .messages({
                'boolean.base': 'TFA_invalid',
                'any.required': 'TFA_required',
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

export const UserEnableDisableInEmailUpdatevalidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        emailUpdates: Joi.string()
            .required()
            .label('emailUpdates')
            .messages({
                'string.base': 'emailUpdates_invalid',
                'string.empty': 'emailUpdates_required',
                'any.required': 'emailUpdates_required',
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

export const Pushnotificationvalidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        pushNotification: Joi.string()
            .required()
            .label('Push Notification')
            .messages({
                'string.base': 'pushNotification_invalid',
                'string.empty': 'pushNotification_required',
                'any.required': 'pushNotification_required',
            }),
        fcmtoken: Joi.string()
            .optional()
            .allow('')
            .label('fcmtoken'),

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


export const UserHobbiesDeleteDataValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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
        subcategoryId: Joi.array()
            .items(
                Joi.string()
                    .required()
                    .messages({
                        'string.base': 'subcategoryId_item_invalid',
                        'string.empty': 'subcategoryId_item_required',
                        'any.required': 'subcategoryId_item_required',
                    })
            )
            .required()
            .label('subcategoryId')
            .messages({
                'array.base': 'subcategoryId_invalid',
                'any.required': 'subcategoryId_required',
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

export const AccountDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .trim()
            .required()
            .label('Email')
            .messages({
                'string.base': 'email_invalid',
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        OTP: Joi.string()
            .min(4)
            .max(4)
            .required()
            .label('OTP')
            .messages({
                'string.base': 'otp_invalid',
                'string.min': 'otp_invalid',
                'string.max': 'otp_invalid',
                'string.empty': 'otp_required',
                'any.required': 'otp_required',
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

export const UserCreateProfileDetailsValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        from: Joi.string()
            .required()
            .label('from')
            .messages({
                'string.base': 'from_invalid',
                'string.empty': 'from_required',
                'any.required': 'from_required',
            }),

        to: Joi.string()
            .required()
            .label('to')
            .messages({
                'string.base': 'to_invalid',
                'string.empty': 'to_required',
                'any.required': 'to_required',
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

export const UserEventNearbyLocationValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
                'string.empty': 'type_required',
                'any.required': 'type_required',
            }),

        latitude: Joi.number()
            .required()
            .label('latitude')
            .messages({
                'number.base': 'latitude_invalid',
                'any.required': 'latitude_required',
            }),

        longitude: Joi.number()
            .required()
            .label('longitude')
            .messages({
                'number.base': 'longitude_invalid',
                'any.required': 'longitude_required',
            }),

        distance: Joi.number()
            .required()
            .label('distance')
            .messages({
                'number.base': 'distance_invalid',
                'any.required': 'distance_required',
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

export const UserEmailTransfrerValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
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



export const transferEmailverifyValidation = async (req, res, next) => {
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

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        OTP: Joi.string()
            .required()
            .label('OTP')
            .messages({
                'string.base': 'otp_invalid',
                'string.empty': 'otp_required',
                'any.required': 'otp_required',
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

export const ChangeEmailTransferValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

        email: Joi.string()
            .email({ tlds: { allow: ['com', 'net', 'org'] } })
            .required()
            .label('email')
            .messages({
                'string.email': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        alternativeEmail: Joi.string()
            .required()
            .label('alternativeEmail')
            .messages({
                'string.base': 'alternativeEmail_invalid',
                'string.empty': 'alternativeEmail_required',
                'any.required': 'alternativeEmail_required',
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



export const TransferEmailCancelValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        transferAction: Joi.string()
            .required()
            .label('transferAction')
            .messages({
                'string.base': 'transferAction_invalid',
                'string.empty': 'transferAction_required',
                'any.required': 'transferAction_required',
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


export const ResidentialAddressValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

        homeType: Joi.string()
            .required()
            .label('homeType')
            .messages({
                'string.base': 'homeType_invalid',
                'string.empty': 'homeType_required',
                'any.required': 'homeType_required',
            }),

        latitude: Joi.number()
            .required()
            .label('latitude')
            .messages({
                'number.base': 'latitude_invalid',
                'any.required': 'latitude_required',
            }),

        longitude: Joi.number()
            .required()
            .label('longitude')
            .messages({
                'number.base': 'longitude_invalid',
                'any.required': 'longitude_required',
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



export const GetJoinedGroupAndCreateGroupValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
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

export const UserBlockandUnblockValidation = async (req, res, next) => {
    console.log("UserBlockandUnblocksds", req.body);
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

        toUserId: Joi.string()
            .required()
            .label('toUserId')
            .messages({
                'string.base': 'toUserId_invalid',
                'string.empty': 'toUserId_required',
                'any.required': 'toUserId_required',
            }),

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_invalid',
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


export const NewUserJoinerValidation = async (req, res, next) => {
    console.log("NewUserJoinerValidation", req.body);
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

        range: Joi.number()
            .required()
            .label('range')
            .messages({
                'number.base': 'range_invalid',
                'any.required': 'range_required',
            }),

        newjoinerstatus: Joi.boolean()
            .required()
            .label('newjoinerstatus')
            .messages({
                'boolean.base': 'newjoinerstatus_invalid',
                'any.required': 'newjoinerstatus_required',
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

export const RequestedUserslistsValidation = async (req, res, next) => {
    console.log("RequestedUserslists_validation", req.body);
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



export const ForgetPasswordValidation = async (req, res, next) => {
    console.log("CreateAndForgetPassword_validation", req.body);

    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({


        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        newpassword: Joi.string()
            .trim()
            .min(5)
            .required()
            .label('New Password')
            .messages({
                'string.base': 'newpassword_invalid',
                'string.empty': 'newpassword_required',
                'string.min': 'newpassword_min',
                'any.required': 'newpassword_required',
            }),

        confirmpassword: Joi.any()
            .equal(Joi.ref('newpassword'))
            .required()
            .label('Confirm password')
            .messages({
                'any.only': '{{#label}} does not match',
                'any.required': 'confirmpassword_required',
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


export const UserchangepasswordValidation = async (req, res, next) => {
    console.log("Userchangepassword_validation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        oldpassword: Joi.string()
            .required()
            .label('Old Password')
            .messages({
                'string.empty': 'oldpassword_required',
                'any.required': 'oldpassword_required',
            }),

        newpassword: Joi.string()
            .trim()
            .min(5)
            .required()
            .label('New Password')
            .messages({
                'string.empty': 'newpassword_required',
                'string.min': 'newpassword_min_5',
                'any.required': 'newpassword_required',
            }),

        confirmpassword: Joi.any()
            .equal(Joi.ref('newpassword'))
            .required()
            .label('Confirm password')
            .messages({
                'any.only': '{{#label}} does not match',
                'any.required': 'confirmpassword_required',
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


export const VerifyOtpfuncValidation = async (req, res, next) => {
    console.log("VerifyOtpfunc_validation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
            }),

        OTP: Joi.string()
            .required()
            .label('OTP')
            .messages({
                'string.base': 'otp_invalid',
                'string.empty': 'otp_required',
                'any.required': 'otp_required',
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


export const HidehobbiesInprofilevalidation = async (req, res, next) => {
    console.log("HidehobbiesInprofileHidehobbiesInprofile", req.body);
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

        hide_hobbies: Joi.boolean()
            .required()
            .label('hide hobbies')
            .messages({
                'boolean.base': 'hide_hobbies_boolean',
                'any.required': 'hide_hobbies_required',
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


export const CommonSearchApifuncValidation = async (req, res, next) => {
    console.log("CommonSearchApiCommonSearchApi", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema;
    if (req.body.type == "hobbies") {
        schema = Joi.object({
            type: Joi.string()
                .required()
                .label('type')
                .messages({
                    'string.empty': 'type_required',
                    'any.required': 'type_required',
                }),

            userId: Joi.string()
                .required()
                .label('userId')
                .messages({
                    'string.empty': 'userId_required',
                    'any.required': 'userId_required',
                }),

            // page: Joi.number()
            //     .required()
            //     .label('page')
            //     .messages({
            //         'number.base': 'page_must_be_number',
            //         'any.required': 'page_required',
            //     }),

            // limit: Joi.number()
            //     .required()
            //     .label('limit')
            //     .messages({
            //         'number.base': 'limit_must_be_number',
            //         'any.required': 'limit_required',
            //     }),

        }).unknown(true)
    }
    else {
        schema = Joi.object({
            type: Joi.string()
                .required()
                .label('type')
                .messages({
                    'string.empty': 'type_required',
                    'any.required': 'type_required',
                }),

            userId: Joi.string()
                .required()
                .label('userId')
                .messages({
                    'string.empty': 'userId_required',
                    'any.required': 'userId_required',
                }),

            page: Joi.number()
                .required()
                .label('page')
                .messages({
                    'number.base': 'page_must_be_number',
                    'any.required': 'page_required',
                }),

            limit: Joi.number()
                .required()
                .label('limit')
                .messages({
                    'number.base': 'limit_must_be_number',
                    'any.required': 'limit_required',
                }),

        }).unknown(true)
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


export const HideEventsValidation = async (req, res, next) => {
    console.log("HideEventsHideEvents", req.body);
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

        hide_event: Joi.boolean()
            .required()
            .label('hide event')
            .messages({
                'boolean.base': 'hide_event_boolean',
                'any.required': 'hide_event_required',
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

export const Hideprofileprofilevalidation = async (req, res, next) => {
    console.log("Hideprofileprofilevalidation", req.body);
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
        hide_profile: Joi.boolean()
            .required()
            .label('hide profile')
            .messages({
                'boolean.base': 'hide_profile_boolean',
                'any.required': 'hide_profile_required',
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


export const SendOtpfuncValidation = async (req, res, next) => {
    console.log("SendOtpfuncValidation", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        email: Joi.string()
            .required()
            .label('email')
            .messages({
                'string.base': 'email_invalid',
                'string.empty': 'email_required',
                'any.required': 'email_required',
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


export const ValidUsernameValidation = async (req, res, next) => {
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        userId: Joi.string()
            .required()
            .label('userId')
            .messages({
                'string.base': 'userId_must_be_string',
                'string.empty': 'userId_required',
                'any.required': 'userId_required',
            }),

        username: Joi.string()
            .required()
            .label('Username')
            .messages({
                'string.base': 'username_must_be_string',
                'string.empty': 'username_required',
                'any.required': 'username_required',
            }),

        type: Joi.string()
            .required()
            .label('type')
            .messages({
                'string.base': 'type_must_be_string',
                'string.empty': 'type_required',
                'any.required': 'type_required',
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


export const userRequestHobbiesSuggestvalidation = async (req, res, next) => {
    console.log("userRequestHobbiesSuggest", req.body);
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
        hobbyfeedback: Joi.string()
            .required()
            .label('hobbyfeedback')
            .messages({
                'string.empty': 'hobbyfeedback_required',
                'any.required': 'hobbyfeedback_required',
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


export const addOtherProfileHobbiesValidation = async (req, res, next) => {
    console.log("addOtherProfileHobbies", req.body);
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
        HobbyId: Joi.array()
            .items(
                Joi.string()
                    .required()
                    .messages({
                        'string.base': 'HobbyId_item_invalid',
                        'string.empty': 'HobbyId_item_required',
                        'any.required': 'HobbyId_item_required',
                    })
            )
            .required()
            .label('HobbyId')
            .messages({
                'array.base': 'HobbyId_invalid',
                'any.required': 'HobbyId_required',
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

export const userChangeLanguagevalidation = async (req, res, next) => {
    console.log("userChangeLanguage", req.body);
    const lang = req.headers['accept-language'] || 'en';
    await i18next.changeLanguage(lang);
    let schema = Joi.object({

        language: Joi.string()
            .required()
            .label('language')
            .messages({
                'string.empty': 'language_required',
                'any.required': 'language_required',
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


export const groupInfovalidation = async (req, res, next) => {
    console.log("groupInfogroupInfo", req.body);
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
        groupId: Joi.string()
            .required()
            .label('groupId')
            .messages({
                'string.empty': 'groupId_required',
                'any.required': 'groupId_required',
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