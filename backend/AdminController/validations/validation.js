const Joi = require('joi');

export const AdminForgetValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({

        email: Joi.string().trim()
            .email({ tlds: { allow: false } })  // 
            .required()
            .label('Email'),

        OTP: Joi.string()
            .min(4)
            .max(4)
            .required()
            .label('OTP'),

        // .messages({ 'any.only': '{{#label}} must be exactly 4 digits' }),

        // password: Joi.string().trim().min(3).max(15).required().label('New Password'),
        password: Joi.string()
        .trim()
        .min(3)
        .max(15)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/) // Ensures at least one uppercase, one lowercase, one number, and one special character
        .required()
        .label('New Password')
        .messages({
            'string.pattern.base': '{{#label}} must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),
        // confirmpassword: Joi.any().equal(Joi.ref('password'))
        //     .required()
        //     .label('Confirm password')
        //     .messages({ 'any.only': '{{#label}} does not match' })
        confirmpassword: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),

    })
    const { value, error } = schema.validate(req.body)
    console.log("valuevalue", value, JSON.stringify(error));

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails.replace(/"/g, ''));
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}


export const AdminEmailverifyValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        email: Joi.string().trim()
            .email({ tlds: { allow: false } })  // 
            .required()
            .label('Email'),


    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}


export const AdminResetpassword = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        email: Joi.string().trim()
            .email({ tlds: { allow: false } })  // 
            .required()
            .label('Email'),

        OTP: Joi.string()
            .min(4)
            .max(4)
            .required()
            .label('OTP'),
        newpassword: Joi.string().trim().min(3).max(15).required().label('New Password'),
        // newpassword: Joi.string()
        // .trim()
        // .min(3)
        // .max(15)
        // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/) // Ensures at least one uppercase, one lowercase, one number, and one special character
        // .required()
        // .label('new Password')
        // .messages({
        //     'string.pattern.base': '{{#label}} must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        // }),
        password: Joi.string().trim().min(3).max(15).required().label('password'),

        confirmpassword: Joi.any().equal(Joi.ref('newpassword'))
            .required()
            .label('Confirm password')
            .messages({ 'any.only': '{{#label}} does not match' })

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}

export const AdminLoginValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        email: Joi.string().trim()
            .email({ tlds: { allow: false } })  // 
            .required()
            .label('Email'),
        password: Joi.string().trim() // 
            .required()
            .label('password'),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}

export const adminAddcategoryValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({



        type: Joi.string().trim()  // 
            .required()
            .label('type'),
    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}

export const adminAddsubcategoryValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        type: Joi.string().trim()  // 
            .required()
            .label('type'),

    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}


export const AdminblockusersValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        userId: Joi.string().trim()  // 
            .required()
            .label('userId'),
        blockedReason: Joi.string().trim()  // 
            .required()
            .label('blockedReason'),
        type: Joi.string().trim()  // 
            .required()
            .label('type'),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}




export const planDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        planid: Joi.string().trim()  // 
            .required()
            .label('planid'),
        planinId: Joi.string().trim()  // 
            .required()
            .label('planinId'),



    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}


export const planlistDeleteValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        planid: Joi.string().trim()  // 
            .required()
            .label('planid'),


    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}

export const hideshowplanValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        planId: Joi.string().trim()  // 
            .required()
            .label('planId'),
        hideshow: Joi.string().trim()  // 
            .required()
            .label('hideshow'),

    })
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}



export const SendMailsinissueUserValidation = async (req, res, next) => {
    console.log("bodyssassd", req.body);
    let schema = Joi.object({


        // email: Joi.string().trim()  // 
        //     .required()
        //     .label('email'),
        boc: Joi.string()  // 
            .required()
            .label('content'),
        subject: Joi.string() // 
            .required()
            .label('subject'),
    }).unknown(true)
    const { error } = schema.validate(req.body)

    if (error) {
        const errordetails = error.details[0].message
        console.log("errordetails:", errordetails);
        let message = errordetails.replace(/"/g, '')
        return res.json({status:false,message:message})

    }
    next()
}

// const options = {
//     abortEarly: false,
// };
// //validation function for validating reqdata with schema
// const validate = (schema) => async (req, res, next) => {
//     const { error } = await schema.validate(req, options);
//     if (error) {
//         res.status(422).json({
//             status: false,
//             statusCode: 422,
//             message: '' + error.message,
//         });
//     } else {
//         return next();
//     }
// };