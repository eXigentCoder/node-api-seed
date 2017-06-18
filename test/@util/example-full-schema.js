// This file should serve as documentation as to the customisations you can use on top of JSON schema.

module.exports = {
    //Unique identifier for this schema, should be a url, I tend to use the path to the raw file on github.
    $id: 'https://raw.githubusercontent.com/eXigentCoder/node-api-seed/master/src/routes/users/user.json',
    // The name of the entity, singular.
    name: 'user',
    // The name of the entity, plural. Not required, will be inferred in code, specify this if there is an issue with how it is being generated.
    namePlural: 'users',
    // The name of the entity, singular. Not required, will be inferred in code, specify this if there is an issue with how it is being generated.
    title: 'User',
    // The name of the entity, plural. Not required, will be inferred in code, specify this if there is an issue with how it is being generated.
    titlePlural: 'Users',
    // A description of what this entity is.
    description: 'A user of the site',
    // The JSON schema type, should always be object.
    type: 'object',
    // The name of the property that will be used to uniquely identify this entity.
    identifierName: 'email',
    // Optional, specifies the various statuses that this object can be in. If specified then extra properties will be added. The first status is (for now) the one that will be used on creation
    statuses: [
        // The default status when creating an entity
        {
            // The unique name of this status
            name: 'active',
            // A description of what this status represents
            description: 'Default status, shows that the user is active and can login',
            // When creating an entitiy of this type, the initial data for the first status log data entry will be generated using this info. Only applies to the first status.
            initialData: {
                // Specifies the static data that should be included in the status log data entry
                static: {
                    // some example data
                    reason: 'testing',
                    isAwesome: true
                },
                // Specifies the data that should be fetched from the `req` object and stored in the status log data entry. If a field is specified here and in static, this one will take priority.
                fromReq: {
                    userName: 'user.displayName', // an example of fetching the displayName field form the `req.user.displayName` property.
                    userRating: ['user.statistics.starRating', 'Unrated'] // An example of using a default value in case the value isn't found.
                }
            }
        },
        // some other status
        {
            name: 'inactive',
            description: "Shows that the user is inactive and can't login"
        },
        // some other status
        {
            name: 'testStatus',
            description: 'Some other status to be used for testing'
        }
    ],
    // The JSON schema to use for the request when an update status request is received. The body of the request will be validated against this and then stored in the status log entry.
    updateStatusSchema: {
        type: 'object',
        properties: {
            reason: {
                type: 'string',
                minLength: 1
            }
        },
        required: ['reason'],
        additionalProperties: true
    },
    //controls the rules for who own's this object
    ownership: {
        // controls where the inital owner comes from when creating an entity. If left off, will use req.user._id
        setOwnerExpression: 'process.user._id',
        // A list of permissions to grant the owner of this particular entity. So for example if you don't have the role that allows you to delete but you are the owner then you can.
        permissions: ['create', 'update', 'updateStatus', 'deleteById']
    },
    // the JSON schema properties of this object, see http://json-schema.org/ for more info
    properties: {
        // Automatically added field, don't specify manually.
        _id: {},
        // Some manually specified field
        email: {
            type: 'string',
            // Specifies that this property should not be returned in the response for this entity.
            excludeOnOutput: true,
            format: 'email',
            minLength: 1,
            faker: 'internet.email'
        },
        // Some manually specified field
        firstName: {
            type: 'string',
            minLength: 1,
            faker: 'name.firstName'
        },
        // Some manually specified field
        surname: {
            type: 'string',
            minLength: 1,
            faker: 'name.lastName'
        },
        // Automatically added field if statuses was set, don't specify manually.
        status: {},
        // Automatically added field if statuses was set, don't specify manually.
        statusDate: {},
        // Automatically added field if statuses was set, don't specify manually.
        statusLog: {},
        // Automatically added field if ownership was set, don't specify manually.
        owner: {},
        // Automatically added field if ownership was set, don't specify manually.
        ownerDate: {},
        // Automatically added field if ownership was set, don't specify manually.
        ownerLog: {}
    },
    // controls if properties not specified in the entry above are allowed. See http://json-schema.org/ for more info
    additionalProperties: false,
    // Specifies if each time this entity is modified, a new history row should be created
    trackHistory: true,
    // Specifies which fields in the properties entry above are mandatory
    required: ['email', 'firstName', 'surname'],
    // Specifies the mongodb indexes to be created with the generate indexes script is executed
    indexes: [
        {
            // Name of the index.
            name: 'email',
            // Should the index enforce uniqueness constraints on the data in the collection.
            unique: true,
            // Should this index be initially created in the background so as to prevent locking the collection.
            background: true,
            // Should this index be included in the history collection for this entity to enable faster searching.
            includeInHistory: true,
            // The fields that should be included in the index.
            fields: {
                email: 1
            }
        }
    ]
};
