/**
 * Created by jim on 5/13/15.
 */

'use strict';

var parser = require('./parsers');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var SerialPort = require('serialport').SerialPort;

function MindMirror3Factory() {

	var factory = this;
	var that = this;

	var _options = {
		portId: '/dev/ttyS0',
		baudrate: 9600,
		parity: 'none',
		rtscts: false,
		xon: false,
		xoff: false,
		xany: false,
		hupcl: true,
		rts: true,
		cts: false,
		dtr: true,
		dts: false,
		brk: false,
		databits: 8,
		stopbits: 1,
		buffersize: 256,
		parser: parser.parser()
	};

	function MindMirror3(comPort) {

		var self = this;
		this.serialPort;
		this.portId;

		function connectTo(portId){
			this.portId = (portId === undefined || portId === null) ? _options.portId : portId;
			this.serialPort = new SerialPort(this.portId, _options, false);
			return self;
		}

		function open(callback) {

			self.serialPort.open(function (error) {
				var mm3, buffer;

				if (error) {
					console.log("Failed to connect to : " + self.portId + " : " + error);
					return;
				}
				console.log("Successfully connected to " + self.portId);

				if(typeof callback === 'defined'){
					self.serialPort.on('data', callback);
				}

/*				self.serialPort.on('data', function (data) {
					//buffer = new Buffer(data,'binary');
					//console.log(buffer.length);
					console.log(buffer.toString());
					//mm3 = new MM3(buffer);

					console.log(Math.floor(Date.now() / 100));
					//console.log(mm3.toString());
				});*/
				self.serialPort.on('close', function (data) {
					console.log("Close event received: " + data);
				});
				self.serialPort.on('error', function (error) {
					console.log("Error event received: " + error);
				});
			});
		}

		function addListener(messageId,listener){
			return self.serialPort.addListener(messageId,listener);
		}

		this.connectTo = connectTo;
		this.open = open;
		this.addListener = addListener;

	}

	factory.MindMirror3 = MindMirror3;
}

//util.inherits(MindMirror3Factory, SerialPort);

module.exports = new MindMirror3Factory();
