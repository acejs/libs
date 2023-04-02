'use strict';

const dynamicLoad = require('..');
const assert = require('assert').strict;

assert.strictEqual(dynamicLoad(), 'Hello from dynamicLoad');
console.info('dynamicLoad tests passed');
