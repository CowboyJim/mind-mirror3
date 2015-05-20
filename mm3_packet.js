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
 24 - 38  right filters
 *
 *
 */

/**
 * @global
 * @type {string[]}
 * @private
 */
var _gLabelValues = ['38', '30', '24', '19', '15', '12.5', '10.5', '9', '7.5', '6', '4.5', '3', '1.5', '0.75', 'EMG'];
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

	// Validate packet size
	if (packet.length != packet[1]) {
		logger.warn("Invalid packet! Expected packet size does not equal the actual packet size. Expected: "
		+ packet.length + " found: " + packet.readInt8(1));
		this.isValid = false;
	}
	//TODO  Validate checksum
	//if (packet[1]) {
	//}

};

MM3Packet.prototype.length = function () {
	return this.packet.length;
};

//MM3Packet.prototype.isValid = function () {
//	return this.isValid;
//};

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

	var response = {
		size: this.packet.length,
		top: displayFilterRange(this.packet, 0, l1start),
		left_data_1: bufferToHex(lbuff1),
		right_data_1: bufferToHex(rbuff1),
		left_data_2: bufferToHex(lbuff2),
		right_data_2: bufferToHex(rbuff2),
		packet: displayFilterRange(this.packet, 0, this.packet.length)
	};
	return response;
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

/**
 *
 *
 * @returns {{key: string, color: string, values: Array}[]}
 */
MM3Packet.prototype.getAsBarGraphData = function () {

	var leftdata = [];
	var rightdata = [];
	var x;

	for (x = 0; x < 15; x++) {
		leftdata.push([_gLabelValues[x], -50]);
	}

	for (x = 0; x < 15; x++) {
		rightdata.push([_gLabelValues[x], 75]);
	}

	return [
		{
			'key': 'left',
			'color': '#d62728',
			values: leftdata
		},
		{
			'key': 'right',
			'color': '#1f77b4',
			values: rightdata
		}
	];
};

module.exports = MM3Packet;
