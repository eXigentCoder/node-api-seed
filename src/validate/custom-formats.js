'use strict';
const mongo = require('../mongo');
module.exports = {
    addAllToAjv: addAllFormatsToAjv,
    addAllToJsf: addAllToJsf
};

function addAllFormatsToAjv(ajv) {
    ajv.addFormat('mongoId', isValidMongoId);
    ajv.addKeyword('mongoId', {
        validate: validateAndCoerceToMongoId
    });
}

function addAllToJsf(jsf) {
    jsf.format('mongoId', generateMongoId);
}

function isValidMongoId(input) {
    return mongo.isValidObjectId(input);
}

function validateAndCoerceToMongoId(isMongoId, input, schema, currentDataPath, parentDataObject, propName) {
    if (!isMongoId) {
        return input;
    }
    const valid = isValidMongoId(input);
    if (valid) {
        parentDataObject[propName] = mongo.ObjectId(input);
    }
    return valid;
}
function generateMongoId() {
    return mongo.generateId();
}