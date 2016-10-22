'use strict';

module.exports = function Steps() {
    return {
        step1: doWork,
        step2: doWork,
        step3: doWork
    };
};
module.exports.doWork = doWork;
//eslint-disable-next-line no-empty-function
function doWork() {
}