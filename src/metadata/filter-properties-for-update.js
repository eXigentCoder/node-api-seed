module.exports = function filterPropertiesForUpdate(schema) {
    if (!schema) {
        throw new Error('Schema is a required field');
    }
    delete schema.properties._id;
    removeRequiredFieldIfExists(schema.required, '_id');
    delete schema.properties.status;
    removeRequiredFieldIfExists(schema.required, 'status');
    delete schema.properties.statusDate;
    removeRequiredFieldIfExists(schema.required, 'statusDate');
    delete schema.properties.statusLog;
    removeRequiredFieldIfExists(schema.required, 'statusLog');
    delete schema.properties.owner;
    removeRequiredFieldIfExists(schema.required, 'owner');
    delete schema.properties.ownerDate;
    removeRequiredFieldIfExists(schema.required, 'ownerDate');
    delete schema.properties.ownerLog;
    removeRequiredFieldIfExists(schema.required, 'ownerLog');
};

function removeRequiredFieldIfExists(array, item) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
