/**
 * Created by jim on 5/13/15.
 */

'use strict';
var MM3 = require('../mind-mirror3').MindMirror3;
var expect = require("chai").expect;

var Mm3Packet = require('../mm3_packet');

var singleDataPacket = [0x05, 0x27, 0x93, 0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03, 0x1C, 0x60, 0x9A,
	0xB3, 0xCC, 0xE9, 0xFF, 0xFF, 0xF1, 0xD8, 0xBF, 0x9A, 0x60, 0x19, 0x03, 0x1C, 0x60, 0x9A, 0xB3,
	0xCC, 0xE9, 0xFF, 0xFF, 0xF1, 0xD8, 0xBF, 0x9A, 0x60, 0x19];

describe('Parser tests', function () {

	describe('Test creation of MindMirror3 object', function () {
		it('should treat com port ID correctly', function () {

			var portId = '/dev/tty.usbserial';
			//var mm3 = new MM3();

			var packet = new Mm3Packet(new Buffer(singleDataPacket));

			var graphData = packet.getAsBarGraphData();
			console.log(graphData);

			//expect(mm3.serialPort.path).to.equal(portId);
			//expect(mm3.serialPort.isOpen()).to.be.true;


		});
	});
/*

	describe('Find beginning of random stream', function (done) {
		it('should emit', function (done) {

			var portId = '/dev/tty.usbserial';
			var mm3 = new MM3();

			var callback = function(packet){
					console.log(packet);
					//done();
				};

			mm3.connectTo(portId).open();

			mm3.addListener('data', function (packet) {
				console.log("Him mom");
				console.log(packet);
			});

		});
	});
 */
});

