/**
 * Created by jim on 5/13/15.
 * Copyright 2015 Jim Boone boone.jim@gmail.com
 */

'use strict';

var logger = require('winston');

/* The MM3 starts each data byte with one of the following two bytes. The
 sync bytes toggle back and forth between valid packets
 */
var syncBytes = [0x0A, 0x05];
var currentSyncByte = undefined;

function isUndefined(variable) {
	if (typeof variable === 'undefined' || variable === null) {
		return true;
	}
	return false;
}

/** Returns the index of the byte of found in the buffer, -1 otherwise
 *
 * @param byte
 * @param buffer
 * @returns {number}
 */
function indexOf(byte, buffer, offset) {

	var x = 0;

	if (!isUndefined(buffer)) {
		if (!isUndefined(offset)) {
			x = offset;
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


/*
 Ensure that the sync byte isn't just a data byte;
 1) find the sync byte index
 2) read the next byte which is the packet size
 3) move to the end of the packet and make sure they next sync
 is the other sync byte
 4) If it is, then the sync byte index is valid. False otherwise
 */
function validSyncByte(index, buffer, syncIndex) {

	if (index === -1) {
		return false;
	}
	var packetLength = buffer[index + 1];
	var nextSyncByte = buffer[index + packetLength];

	if (nextSyncByte === syncBytes[1 - syncIndex]) {
		return true;
	} else {
		return false;
	}
}

/**
 *
 * Returns the index of the next sync byte from the syncBytes array
 *
 * @param buffer
 * @returns {Number} index of the sync byte for this data packet
 */
function scanBuffer(buffer, lastSyncByte) {

	var index0_1 = -1, index1_1 = -1, index0_2 = -1, index1_2 = -1;
	var byteIndex, syncByte;
	var result = {};

	if (isUndefined(lastSyncByte)) {

		index0_1 = indexOf(syncBytes[0], buffer);
		index0_2 = indexOf(syncBytes[0], buffer, index0_1 + 1);
		index1_1 = indexOf(syncBytes[1], buffer);
		index1_2 = indexOf(syncBytes[1], buffer, index1_1 + 1);

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
			byteIndex = index1_2
			syncByte = 0x05;
		}
		else {
			logger.log('warn', "Could not find sync byte in stream");
			throw new Error("Could not find sync byte in stream");
		}
		result = {index: byteIndex, syncByte: syncByte};
	} else {

		var nextSyncByte = (lastSyncByte === syncBytes[0]) ? syncBytes[1] : syncBytes[0];
		var index0_1 = indexOf(nextSyncByte, buffer);
		result = {index: index0_1 , syncByte: nextSyncByte};
	}
	return result;
}


function getDataPacket(buffer, offset, lastSyncByte) {
	var scanResults = scanBuffer(buffer, lastSyncByte);
	var x = indexOf(scanResults.syncByte, buffer, offset);
	var packet = buffer.slice(x, buffer[x + 1]);

	return {index: x, packet: packet, syncByte: scanResults.syncByte};
}

function parser() {
	return function (emitter, buffer) {

		var buf = buffer.slice();
		var bytesProcesssed = 0;
		var bufLength = buf.length;
		var lastSyncByte;

		// Loop and keep emitting until done
		while (bytesProcesssed < bufLength) {

			var scanResult = getDataPacket(buf, bytesProcesssed, lastSyncByte);

			emitter.emit('data', scanResult.packet);
			logger.log('debug', "Emitted data packet from buffer: Start index: " + scanResult.index + " packet length: " + scanResult.packet.length);
			buf = buf.slice(scanResult.index + scanResult.packet.length);
			bufLength = buf.length;
			bytesProcesssed += scanResult.packet.length;
			lastSyncByte = scanResult.syncByte;
		}
		logger.log('debug', 'Done parsing buffer');
	};
}

module.exports = {

	scanBuffer: scanBuffer,
	getDataPacket: getDataPacket,
	parser: parser
}
