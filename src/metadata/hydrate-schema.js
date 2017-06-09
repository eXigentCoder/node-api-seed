'use strict';
module.exports = function hydrateOutputSchema(schema) {
    schema.properties = schema.properties || {};
    schema.required = schema.required || [];
    add_id(schema);
    addStatusInfo(schema);
    addOwnerInfo(schema);
};

function add_id(schema) {
    const defaultIdField = {
        type: 'string',
        format: 'mongoId',
        mongoId: true,
        minLength: 24,
        maxLength: 24
    };
    schema.properties._id = Object.assign({}, defaultIdField, schema.properties._id);
    schema.required.push('_id');
}

function addStatusInfo(schema) {
    if (!schema.statuses) {
        return;
    }
    if (!schema.updateStatusSchema) {
        throw new Error(
            'Cannot have statuses array specified on the schema but not provide an updateStatusSchema property'
        );
    }
    const statusNames = schema.statuses.map(status => status.name);
    schema.properties.status = {
        type: 'string',
        enum: statusNames
    };
    schema.properties.statusDate = {
        type: 'string',
        format: 'date-time',
        faker: 'date.past'
    };
    schema.properties.statusLog = {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                status: schema.properties.status,
                statusDate: schema.properties.statusDate,
                data: schema.updateStatusSchema
            },
            required: ['status', 'statusDate', 'data'],
            additionalProperties: false
        },
        additionalItems: false
    };
    schema.required.push('status');
    schema.required.push('statusDate');
    schema.required.push('statusLog');
}

function addOwnerInfo(schema) {
    if (!schema.ownership) {
        return;
    }
    schema.properties.owner = {
        type: 'string',
        format: 'mongoId',
        mongoId: true,
        minLength: 24,
        maxLength: 24
    };
    schema.properties.ownerDate = {
        type: 'string',
        format: 'date-time',
        faker: 'date.past'
    };
    schema.properties.ownerLog = {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                owner: schema.properties.owner,
                ownerDate: schema.properties.ownerDate,
                data: {
                    type: ['object', 'string'] //todo?
                }
            },
            required: ['owner', 'ownerDate', 'data'],
            additionalProperties: false
        },
        additionalItems: false
    };
    schema.required.push('owner');
    schema.required.push('ownerDate');
    schema.required.push('ownerLog');
}
