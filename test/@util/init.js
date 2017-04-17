'use strict';
const chai = require('chai');
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
require('../../config/init-nconf');
require('../../src/logging/index');

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should();