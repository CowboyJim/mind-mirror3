/**
 * Created by CowboyJim on 5/13/15.
 * Copyright 2015 Jim Boone boone.jim@gmail.com
 */

'use strict';

var logger = require('winston');
var Mm3Packet = require('./mm3_packet');

/* The MM3 starts each data byte with one of the following two bytes. The
 sync bytes toggle back and forth between valid packets
 */
var _gSyncBytes = [0x0A, 0x05];
var _gCurrentSyncByte = undefined;

var isFileInput = false;

function isUndefined(variable) {
	return !!(typeof variable === 'undefined' || variable === null);

}

/** Returns the index of the byte of found in the buffer, -1 otherwise
 *
 * @param byte
 * @param buffer
 * @returns {number}
 */
function indexOf(buffer, offset, byte) {

	var x = 0;

	if (!isUndefined(buffer)) {
		if (!isUndefined(offset)) {
			x = offset;
		}
		if (isUndefined(byte)) {
			byte = _gCurrentSyncByte;
		}
		for (x; x < buffer.length; x++) {
			if (byte === buffer[x]) {
				// the byte was found
				return x;
			}
		}
	} else {
		logger.log('warn', "Trying to find index of sync byte but the buffer undefined!");
	}
	// byte not found
	return -1;

}

/**
 *
 Ensure that the sync byte isn't just a data byte;
 1) find the sync byte index
 2) read the next byte which is the packet size
 3) move to the end of the packet and make sure they next sync
 is the other sync byte
 4) If it is, then the sync byte index is valid. False otherwise
 *
 * @param index buffer index to start the validation
 * @param buffer data buffer
 * @param syncIndex index of the _gSyncBytes array used to determine the desired sync byte
 * @returns {boolean} true if the index is indeed the beginning of a mm3 packet
 */
function validSyncByte(index, buffer, syncIndex) {

	if (index === -1) {
		return false;
	}
	var packetLength = buffer[index + 1];
	var nextSyncByte = buffer[index + packetLength];

	return nextSyncByte === _gSyncBytes[1 - syncIndex];
}

/**
 *
 * Returns the index of the next sync byte from the _gSyncBytes array
 *
 * @param buffer
 * @returns {Number} index of the sync byte for this data packet
 */
function nextSyncByteIndex(buffer) {

	var index0_1 = -1, index1_1 = -1, index0_2 = -1, index1_2 = -1;
	var byteIndex, syncByte;
	var result = {};

	if (isUndefined(_gCurrentSyncByte)) {

		index0_1 = indexOf(buffer, 0, _gSyncBytes[0]);
		index0_2 = indexOf(buffer, index0_1 + 1, _gSyncBytes[0]);
		index1_1 = indexOf(buffer, 0, _gSyncBytes[1]);
		index1_2 = indexOf(buffer, index1_1 + 1, _gSyncBytes[1]);

		var id0_1_valid = validSyncByte(index0_1, buffer, 0);
		var id0_2_valid = validSyncByte(index0_2, buffer, 0);
		var id1_1_valid = validSyncByte(index1_1, buffer, 1);
		var id1_2_valid = validSyncByte(index1_2, buffer, 1);

		if (id0_1_valid) {
			byteIndex = index0_1;
			syncByte = 0x0A;
		} else if (id0_2_valid) {
			byteIndex = index0_2;
			syncByte = 0x0A;
		} else if (id1_1_valid) {
			byteIndex = index1_1;
			syncByte = 0x05;
		} else if (id1_2_valid) {
			byteIndex = index1_2;
			syncByte = 0x05;
		}
		else {
			logger.log('warn', "Could not find sync byte in stream");
			throw new Error("Could not find sync byte in stream");
		}
		_gCurrentSyncByte = syncByte;
		result = {index: byteIndex, syncByte: syncByte};
	} else {

		_gCurrentSyncByte = (_gCurrentSyncByte === _gSyncBytes[0]) ? _gSyncBytes[1] : _gSyncBytes[0];

		var index0_1 = indexOf(buffer);
		result = {index: index0_1, syncByte: _gCurrentSyncByte};
	}
	return result;
}


function getComPacket(buffer) {
	var scanResults = nextSyncByteIndex(buffer);
	var x = indexOf(buffer, scanResults.index);
	var packet = buffer.slice(x, x + buffer[x + 1]);

	return {index: x, packet: packet, syncByte: scanResults.syncByte};
}


var parseData = function (emitter, buffer) {

	console.log("buffer received");

	var buf = buffer.slice();
	var bufLength = buf.length;
	var packetResult;

	var addSimulatedDelay = false;
	if (isFileInput) {
		addSimulatedDelay = isFileInput;
	}

	// Loop and keep emitting until done
	while (buf.length > 0) {

		packetResult = getComPacket(buf);

		if (addSimulatedDelay) {
			setTimeout(function (packet) {
				emitPacket(emitter, packet);
			}, 500, packetResult);
		} else {
			emitPacket(emitter, packetResult);
		}
		buf = buf.slice(packetResult.index + packetResult.packet.length);
	}
	logger.log('debug', 'Done parsing buffer');
};

/**
 *
 *
 * @param isFileInput
 * @returns {Function}
 */
function parser(isFileInput) {
	return parseData;

}

function emitPacket(emitter, packetResult) {
	emitter.emit('data', new Mm3Packet(packetResult.packet));
	logger.log('debug', "Emitted mm3 packet - idx: " + packetResult.index + " len: " + packetResult.packet.length);
}

module.exports = {

	nextSyncByteIndex: nextSyncByteIndex,
	getComPacket: getComPacket,
	parser: parseData
};
