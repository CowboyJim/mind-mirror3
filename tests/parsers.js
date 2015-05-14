/**
 * Created by jim on 5/13/15.
 */

'use strict';
var assert = require("assert");
var fs = require('fs');
var parsers = require('../parsers');
var EventEmitter = require('events').EventEmitter;

var testFile1 = "tests/mm3_capture_file1";

describe('Parser tests', function(){
	var file1Buffer;
	var eventEmitter;

	before(function() {
		file1Buffer= fs.readFileSync(testFile1);
		eventEmitter = new EventEmitter();
	});

	describe('Parse from raw file1', function(){
		it('should return -1 when the value is not present', function(){

			var fileParser = parsers.fileparser();
			fileParser(eventEmitter,file1Buffer);

			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		})
	})
});
