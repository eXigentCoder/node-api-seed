'use strict';
const mongo = require('../mongo');
const moment = require('moment');
const uuuid = require('node-uuid');

module.exports = {
    addAllToAjv: addAllFormatsToAjv,
    addAllToJsf: addAllToJsf
};

function addAllFormatsToAjv(ajv) {
    ajv.addFormat('mongoId', isValidMongoId);
    ajv.addKeyword('mongoId', {
        validate: validateAndCoerceToMongoId
    });
    ajv.addKeyword('dateFormat', {
        validate: validateAndCoerceFromDateFormat
    });
}

function isValidMongoId(input) {
    return mongo.isValidObjectId(input);
}

function validateAndCoerceToMongoId(
    isMongoId,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    if (!isMongoId) {
        return true;
    }
    const valid = isValidMongoId(input);
    if (valid) {
        parentDataObject[propName] = mongo.ObjectId(input);
    }
    return valid;
}

function validateAndCoerceFromDateFormat(
    dateFormat,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    dateFormat = dateFormat.toLowerCase();
    const allowedValues = ['date', 'time'];
    if (allowedValues.indexOf(dateFormat) < 0) {
        return false;
    }
    if (dateFormat === 'date') {
        return validateAndCoerceToDate(
            dateFormat,
            input,
            schema,
            currentDataPath,
            parentDataObject,
            propName
        );
    }
    if (dateFormat === 'time') {
        return validateAndCoerceToTime(
            dateFormat,
            input,
            schema,
            currentDataPath,
            parentDataObject,
            propName
        );
    }
}

function validateAndCoerceToDate(
    dateFormat,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    const format = 'YYYY-MM-DD';
    const dateValue = moment.utc(new Date(input));
    const valid = dateValue.isValid();
    if (valid) {
        parentDataObject[propName] = moment.utc(dateValue.format(format)).toDate();
    }
    return valid;
}

function validateAndCoerceToTime(
    dateFormat,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    const dateValue = moment.utc(new Date(input));
    const valid = dateValue.isValid();
    if (valid) {
        dateValue.set({ year: 1900, month: 0, date: 1 });
        parentDataObject[propName] = dateValue.toDate();
    }
    return valid;
}

function addAllToJsf(jsf) {
    jsf.format('mongoId', generateMongoId);
    jsf.format('date', generateDate);
    jsf.format('uuid', () => {
        return uuuid.v4();
    });
}

function generateMongoId() {
    return mongo.generateId();
}

function generateDate() {
    return moment.utc(randomDate(new Date('1950-01-01'), new Date())).format('YYYY-MM-DD');
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
