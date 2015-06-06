'use strict';
var logger = require('winston');

/**
 *
 * The following documents the bytes received from the Mind Mirror 3 during
 * EKG measurements.
 *
 Byte Index - Description

 0 - sync byte
 1 - packet size
 2 - checksum
 3 - value of 0x04
 4 - frame #
 5 - status
 6 - attenuation settings - no value
 7 - timestamp lower - no value
 8 - timestamp upper - no value
 9 - left emg
 10 - left filters [10 - 23]
 24 - right emg
 25 - 38  right filters
 *
 *
 */

/**
 * @global
 * @type {string[]}
 * @private
 */
var _gLabelValues = ['EMG', '0.75', '1.5', '3', '4.5', '6', '7.5', '9', '10.5', '12.5', '15', '19', '24', '30', '38'];

// left = 9-24
// right = 24 -
var _gLeftIndexMap = {
	'EMG': 9,
	'0.75': 10,
	'1.5': 11,
	'3': 12,
	'4.5': 13,
	'6': 14,
	'7.5': 15,
	'9': 16,
	'10.5': 17,
	'12.5': 18,
	'15': 19,
	'19': 20,
	'24': 21,
	'30': 22,
	'38': 23
};
var _gLeftIndexExcelMap = {
	'B': 9,
	'C': 10,
	'D': 11,
	'E': 12,
	'F': 13,
	'G': 14,
	'H': 15,
	'I': 16,
	'J': 17,
	'K': 18,
	'L': 19,
	'M': 20,
	'N': 21,
	'O': 22,
	'P': 23
};

var _gRightIndexMap = {
	'EMG': 24,
	'0.75': 25,
	'1.5': 26,
	'3': 27,
	'4.5': 28,
	'6': 29,
	'7.5': 30,
	'9': 31,
	'10.5': 32,
	'12.5': 33,
	'15': 34,
	'19': 35,
	'24': 36,
	'30': 37,
	'38': 38
};

var _gRightIndexExcelMap = {
	'Q': 24,
	'R': 25,
	'S': 26,
	'T': 27,
	'U': 28,
	'V': 29,
	'W': 30,
	'X': 31,
	'Y': 32,
	'Z': 33,
	'AA': 34,
	'AB': 35,
	'AC': 36,
	'AD': 37,
	'AE': 38
};


/**
 *
 * Creates a new MM3Packet for consumption by UI and data analysis components
 *
 * @author CowboyJim
 *
 * @class
 * @param packet buffer from COM port or file data
 * @constructor
 */
var MM3Packet = function (packet) {
	this.packet = packet;
	this.isValid = true;

	// Expose the maps
	this.leftIndexMap = _gLeftIndexMap;

	// Validate packet size
	if (packet.length !== packet[1]) {
		logger.warn("Invalid packet! Expected packet size does not equal the actual packet size. Expected: "
			+ packet[1] + " found: " + packet.length);
		this.isValid = false;
	}
	//TODO  Validate checksum
	//if (packet[1]) {
	//}

};

MM3Packet.prototype.length = function () {
	return this.packet.length;
};

/**
 *
 * @returns {string}
 */
MM3Packet.prototype.toRawHex = function () {
	return "\nsz: " + this.packet.length + " hex: " + displayFilterRange(this.packet, 0, this.packet.length)
};

/**
 *
 * @returns {*}
 */
MM3Packet.prototype.toString = function () {
	var last = this.packet.length;

	if (last < 64) {
		return {
			size: this.packet.length,
			packet: displayFilterRange(this.packet, 0, this.packet.length)
		};
	}

	var l1start = last - 64;
	var r1start = last - 48;
	var l2start = last - 32;
	var r2start = last - 15;

	var lbuff1 = this.packet.slice(l1start, r1start);
	var rbuff1 = this.packet.slice(r1start, l2start);
	var lbuff2 = this.packet.slice(l2start, r2start);
	var rbuff2 = this.packet.slice(r2start, last);

	return {
		size: this.packet.length,
		top: displayFilterRange(this.packet, 0, l1start),
		left_data_1: bufferToHex(lbuff1),
		right_data_1: bufferToHex(rbuff1),
		left_data_2: bufferToHex(lbuff2),
		right_data_2: bufferToHex(rbuff2),
		packet: displayFilterRange(this.packet, 0, this.packet.length)
	};
};

/**
 *
 * @param buffer
 * @returns {string}
 */
function bufferToHex(buffer) {
	var result = "";
	for (var x = 0; x < buffer.length; x++) {
		result += decimalToHex(buffer[x]) + " ";
	}
	return result;
}

/**
 *
 * @param packet
 * @param beginIndex
 * @param offset
 * @returns {string}
 */
function displayFilterRange(packet, beginIndex, offset) {
	var result = "";
	if (packet.length < beginIndex || packet.length < beginIndex + offset) {
		return "Packet it only " + packet.length + " bytes long";
	}
	for (var x = beginIndex; x < beginIndex + offset; x++) {
		result += decimalToHex(packet[x]) + " ";
	}
	return result;
}

/**
 *
 * @param d
 * @param padding
 * @param base
 * @returns {string}
 */
function decimalToHex(d, padding, base) {
	var radix = typeof (base) === "undefined" || base === null ? base = 16 : base;
	var hex = Number(d).toString(16).toUpperCase();
	padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

	while (hex.length < padding) {
		hex = "0" + hex;
	}
	return hex;
}

function toArrayBuffer(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buffer.length; ++i) {
		view[i] = buffer[i];
	}
	return ab;
}

/**
 *
 *
 * @returns {{key: string, color: string, values: Array}[]}
 */
MM3Packet.prototype.getAsBarGraphData = function () {
	return [
		{
			key: 'left',
			color: '#d62728',
			values: getGraphJsonData(this.packet.slice(9, 24), true)
		},
		{
			key: 'right',
			color: '#1f77b4',
			values: getGraphJsonData(this.packet.slice(24), false)
		}
	];
};

function getGraphJsonData(dataArray, multiplyByNeg1) {
	var values = [];
	for (var i = 0; i < dataArray.length; i++) {
		var value = dataArray[i];
		if (multiplyByNeg1 === true) {
			value = value * -1;
		}
		values.push([_gLabelValues[i], value]);
	}
	return values.reverse();
}


MM3Packet.prototype.getLeftFrequencyValue = function (value, freqCol) {

	if (typeof freqCol !== 'undefined') {
		return _gLeftIndexMap.value;
	}
	return _gLeftIndexExcelMap.value;

}

MM3Packet.prototype.getRightFrequencyValue = function (value, freqCol) {

	if (typeof freqCol !== 'undefined') {
		return _gRightIndexMap.value;
	}
	return _gRightIndexExcelMap.value;
}

module.exports = MM3Packet;
