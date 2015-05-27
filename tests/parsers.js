/**
 * Created by jim on 5/13/15.
 */

'use strict';
var expect = require("chai").expect;
var fs = require('fs');
var parsers = require('../parsers');
var EventEmitter = require('events').EventEmitter;
var winston = require('winston');
var Mm3Packet = require('../mm3_packet');

winston.level = 'debug';

var testFile1 = "tests/mm3_capture_file1";

var testData =
	[0x3f, 0x0a, 0x0d, 0x3f, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x0a, 0x0d, 0x53, 0x79, 0x73,
		0x74, 0x65, 0x6d, 0x20, 0x75, 0x70, 0x0a, 0x0d, 0x05, 0x27, 0x5b, 0x04, 0x01, 0x60, 0x03, 0x01,
		0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x06, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x04,
		0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x06, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x04, 0x0a,
		0x27, 0x3e, 0x04, 0x02, 0x60, 0x03, 0x02, 0x00, 0x00, 0xff, 0xff, 0xff, 0x08, 0x06, 0x04, 0x01,
		0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xff, 0xff, 0xff, 0x08, 0x06, 0x04, 0x01, 0x01,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x05, 0x27, 0x40, 0x04, 0x03, 0x60, 0x03, 0x03, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x08, 0x06, 0x04, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xff,
		0xff, 0xff, 0x08, 0x06, 0x04, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x0a, 0x27, 0xf8,
		0x04, 0x04, 0x60, 0x03, 0x04, 0x00, 0x00, 0xff, 0x24, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xff, 0x24, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x02, 0x05, 0x27, 0xfa, 0x04, 0x05, 0x61, 0x03, 0x05, 0x00, 0x00, 0xff, 0x24,
		0x0d, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xff, 0x24, 0x0d,
		0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x0a, 0x27, 0xf3, 0x04, 0x06,
		0x61, 0x03, 0x06, 0x00, 0x00, 0xff, 0x24, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x02, 0x00, 0xff, 0x24, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x02, 0x05, 0x27, 0xf6, 0x04, 0x07, 0x61, 0x03, 0x07, 0x00, 0x00, 0xff, 0x24, 0x0d, 0x00,
		0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xff, 0x24, 0x0d, 0x00, 0x00,
		0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x0a, 0x27, 0xfd, 0x04, 0x00, 0x61, 0x03,
		0x08, 0x00, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x02, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
		0x05, 0x27, 0x00, 0x04, 0x01, 0x61, 0x03, 0x09, 0x00, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00,
		0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01,
		0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x0a, 0x27, 0xf9, 0x04, 0x02, 0x61, 0x03, 0x0a, 0x00,
		0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00,
		0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x05, 0x27,
		0xfc, 0x04, 0x03, 0x61, 0x03, 0x0b, 0x00, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x2b, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x02, 0x0a, 0x27, 0x41, 0x04, 0x04, 0x61, 0x03, 0x0c, 0x00, 0x00, 0x06,
		0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x06, 0x01,
		0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x05, 0x27, 0x44, 0x04,
		0x05, 0x61, 0x03, 0x0d, 0x00, 0x00, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x02, 0x00, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x02, 0x0a, 0x27, 0x3d, 0x04, 0x06, 0x61, 0x03, 0x0e, 0x00, 0x00, 0x06, 0x01, 0x00,
		0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x06, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x05, 0x27, 0x40, 0x04, 0x07, 0x61];


var singleDataPacket = [0x05, 0x27, 0x93, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03, 0x1C, 0x60, 0x9A,
	0xB3, 0xCC, 0xE9, 0xFF, 0xFF, 0xF1, 0xD8, 0xBF, 0x9A, 0x60, 0x19, 0x03, 0x1C, 0x60, 0x9A, 0xB3,
	0xCC, 0xE9, 0xFF, 0xFF, 0xF1, 0xD8, 0xBF, 0x9A, 0x60, 0x19];

describe('Parser tests', function () {
	var file1Buffer;
	var eventEmitter;
	var counter = 0;

	before(function () {
		file1Buffer = fs.readFileSync(testFile1);
		eventEmitter = new EventEmitter();
	});

	describe('Find beginning of random stream on com packet at a time', function (done) {
		it('should emit 15 packets', function (done) {

			eventEmitter.addListener('mm3Packet', function (packet) {
				counter++;
				if (counter === 1) {
					expect(packet.length()).to.equal(13);
					expect(packet.isValid).to.be.true;
				} else if (counter > 1 && counter < 15) {
					expect(packet.length()).to.equal(39);
					expect(packet.isValid).to.be.true;
				} else {
					done();
				}
			});

			var p = parsers.parser(false);
			var buffer = new Buffer(testData);
			for(var x = 0; x < testData.length; x++){
				var singleBuff = new Buffer(1);
				singleBuff[0] = buffer[x];

				p(eventEmitter, singleBuff);
			}

		});
	});

	describe('Find beginning of random stream', function (done) {
		it('should emit 15 packets', function () {

			eventEmitter.addListener('data', function (packet) {
				counter++;
				if (counter === 1) {
					expect(packet.length()).to.equal(13);
					expect(packet.isValid).to.be.true;
				} else if (counter > 1 && counter < 16) {
					expect(packet.length()).to.equal(39);
					expect(packet.isValid).to.be.true;
				} else {
					done();
				}
			});

			var buffer = new Buffer(testData);
			var parser = parsers.parser(true)(eventEmitter, buffer);
		});
	});
	describe('Single packet decode', function () {
		it('should create JSON for plotting bar graphs', function () {

			var packet = new Mm3Packet(new Buffer(singleDataPacket));
			expect(packet.length()).to.equal(39);
			expect(packet.isValid).to.be.true;

			var graphData = packet.getAsBarGraphData();
			expect(graphData[0].values).to.have.length(15);
			expect(graphData[1].values).to.have.length(15);


		});
	});

});

