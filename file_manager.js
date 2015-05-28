/**
 * Created by jim on 5/27/15.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var log = require('winston');

var mkdirp = require('mkdirp');
var baseDir = __dirname + "/capture";
var g_eventToListenFor = 'data';

var fileOutStream;

/**
 *
 * @param emitter
 * @param fileName
 */
function startCaptureToFile(emitter,fileName) {

	mkdirp(baseDir,function(err){
		if(err){
			log.error(err);
		}
	});
	var newFileName = getNewFileName(fileName);
	fileOutStream = fs.createWriteStream(newFileName);
	emitter.addEventListener(g_eventToListenFor,function(data){
		fileOutStream.write(data);
	});
}
/**
 *
 * @param emitter
 */
function stopCaptureToFile(emitter) {
	emitter.removeListener(g_eventToListenFor);
	fileOutStream.end();
}

/**
 *
 * @param fileName
 * @returns {*}
 */
function getNewFileName(fileName) {

	var name = fileName;
	if (typeof fileName == 'undefined') {
		name = getFormatedDate() + ".capture.mm3";
	}
	return name;
}

function getFormatedDate() {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

module.exports = {

	startCaptureToFile: startCaptureToFile,
	stopCaptureToFile: stopCaptureToFile,
	getNewFileName: getNewFileName
}
