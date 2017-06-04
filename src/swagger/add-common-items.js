'use strict';
const swagger = require('swagger-spec-express');
const config = require('nconf');

module.exports = function(app, callback) {
    swagger.common.parameters.addPath({
        name: 'targetDate',
        description: 'The target date for the query in ISO 8601 format',
        type: 'string',
        required: true,
        format: 'date-time'
    });
    swagger.common.parameters.addPath({
        name: 'fromDate',
        description: 'The from date in ISO 8601 format',
        required: true,
        type: 'string',
        format: 'date-time'
    });
    swagger.common.parameters.addPath({
        name: 'toDate',
        description: 'The date to in ISO 8601 format',
        required: true,
        type: 'string',
        format: 'date-time'
    });
    swagger.common.parameters.addPath({
        name: 'startDate',
        description: 'The from date in ISO 8601 format',
        required: true,
        type: 'string',
        format: 'date-time'
    });
    swagger.common.parameters.addPath({
        name: 'endDate',
        description: 'The date to in ISO 8601 format',
        required: true,
        type: 'string',
        format: 'date-time'
    });

    swagger.common.addModel({
        name: 'errorResponse',
        type: 'object',
        properties: {
            statusCode: {
                description: 'The http status code for the response',
                type: 'number'
            },
            error: {
                description: 'The description of the error',
                type: 'string'
            }
        },
        additionalProperties: true
    });

    swagger.common.addResponse({
        name: '500',
        description: 'Server Error',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '401',
        description: 'Not Authorised',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '403',
        description: 'Forbidden',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '404',
        description: 'Not Found',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '409',
        description: 'Conflict, item exists',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '400',
        description: 'Validation error',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '412',
        description: 'Precondition failed',
        schema: {
            $ref: '#/definitions/errorResponse'
        }
    });
    swagger.common.addResponse({
        name: '204',
        description: 'The server successfully processed the request, but is not returning any content.'
    });
    const correlationIdOptions = config.get('logging').correlationId;
    swagger.common.addResponseHeader({
        name: correlationIdOptions.resHeader,
        description: 'A unique identifier that is used to track the request through the logs. Should be passed through in the request, but will be generated if one is not provided.',
        type: 'string'
    });

    swagger.common.parameters.addQuery({
        name: 'select',
        description: 'The fields to select e.g. select=field1,field2',
        required: false,
        type: 'string'
    });
    swagger.common.parameters.addQuery({
        name: 'skip',
        description: 'The number of records to skip',
        default: 0,
        required: false,
        type: 'integer'
    });
    swagger.common.parameters.addQuery({
        name: 'limit',
        description: 'The number of records to return',
        default: 50,
        required: false,
        type: 'integer'
    });
    swagger.common.parameters.addQuery({
        name: 'sort',
        description: 'The sort order of records e.g. sort=field1,-field2',
        required: false,
        type: 'string'
    });
    swagger.common.parameters.addQuery({
        name: 'rawQuery',
        description: 'A mongodb json find statement as a string. e.g. {"field1":1}',
        required: false,
        type: 'string'
    });
    swagger.common.parameters.addHeader({
        name: correlationIdOptions.reqHeader,
        description: 'A unique identifier that is used to track the request through the logs. Should be passed through in the request, but will be generated if one is not provided.',
        required: false,
        type: 'string'
    });
    console.log('Added common swagger items');
    return callback(null, app);
};
