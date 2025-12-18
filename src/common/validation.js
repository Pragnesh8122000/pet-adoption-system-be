import Joi from 'joi';

// Validation messages
const requiredMessage = (field) => `"${field}" is a required field`;
const invalidFieldMessage = (field) => `"${field}" is invalid`;
const invalidTypeMessage = (field, type) => `"${field}" should be a type of '${type}'`;
const invalidPatternMessage = (field, pattern) => `"${field}" must match the pattern: ${pattern}`;
const minLengthMessage = (field, min) => `"${field}" should have a minimum length of ${min}`;
const maxLengthMessage = (field, max) => `"${field}" should have a maximum length of ${max}`;
const nonEmptyMessage = (field) => `"${field}" cannot be an empty field`;

// Validation schemas
const commonTextSchema = (fieldName) => Joi.string().min(1).max(30).required().messages({
    'string.base': invalidTypeMessage(fieldName, 'text'),
    'string.empty': nonEmptyMessage(fieldName),
});
const commonNumberSchema = (fieldName) => Joi.number().min(1).max(30).required().messages({
    'string.base': invalidTypeMessage(fieldName, 'number'),
    'string.empty': nonEmptyMessage(fieldName),
});
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9@.]{3,30}$')).required();
const phoneSchema = Joi.string().pattern(new RegExp('^[0-9]{10}$')).required();

// JWT Validations
export const registerUserValidation = Joi.object({
    name: commonTextSchema("name"),
    email: emailSchema.messages({
        'string.email': invalidFieldMessage('email'),
        'any.required': requiredMessage('email'),
    }),
    password: passwordSchema.messages({
        'string.pattern.base': `${minLengthMessage('password', 3)} and ${maxLengthMessage('password', 30)}`,
        'any.required': requiredMessage('password'),
    }),
    phone: phoneSchema.messages({
        'string.pattern.base': invalidPatternMessage('phone', '10 digit number'),
        'any.required': requiredMessage('phone'),
    }),
});

export const loginUserValidation = Joi.object({
    email: emailSchema.messages({
        'string.email': invalidFieldMessage('email'),
        'any.required': requiredMessage('email'),
    }),
    password: passwordSchema.messages({
        'string.pattern.base': `${minLengthMessage('password', 3)} and ${maxLengthMessage('password', 30)}`,
        'any.required': requiredMessage('password'),
    })
})

export const createPetValidation = Joi.object({
    name: commonTextSchema("name"),
    breed: commonTextSchema("breed"),
    age: commonNumberSchema("age")
});

export const updatePetValidation = Joi.object({
    id : commonTextSchema("id"),
    name: commonTextSchema("name"),
    breed: commonTextSchema("breed"),
    age: commonNumberSchema("age")
});

export const idValidation = Joi.object({
    id : commonTextSchema("id"),
});

export const updateAdoptionStatusValidation = Joi.object({
    id : commonTextSchema("id"),
    status: commonTextSchema("status")
});