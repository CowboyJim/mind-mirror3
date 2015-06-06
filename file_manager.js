/**
 * Created by jim on 5/27/15.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var log = require('winston');

var mkdirp = require('mkdirp');

var g_baseDir;
var g_eventToListenFor = 'data';

var fileOutStream;

var count = 0;

var eventListener = function(data){
	fileOutStream.write(data);
}

/**
 *
 * @param emitter
 * @param fileName
 */
function startCaptureToFile(emitter, fileName) {

	var fName;
	if (typeof fileName === 'undefined') {
		fName = getNewFileName(fileName);
	} else {
		fName = fileName;
	}

	fileOutStream = fs.createWriteStream(fName);
	emitter.addListener(g_eventToListenFor, eventListener);
}

/**
 *
 * @param emitter
 */
function stopCaptureToFile(emitter) {
	fileOutStream.end(function(){
		log.debug("end capture");
	});
	emitter.removeListener('data',eventListener);
}

/**
 *
 * @param fileName
 * @returns {*}
 */
function getNewFileName(fileName) {

	var name = fileName;
	if (typeof fileName == 'undefined') {
		name = getFormatedDate() + ".mm3";
	}
	return getBaseDir() + "/" + name;
}

function getFormatedDate() {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear(),
		hours = d.getHours(),
		secs = d.getSeconds();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [month, day, year, hours, secs].join('-');
}


function getBaseDir() {

	if (typeof g_baseDir === 'undefined') {
		// Create the base dir if it doesn't already exist
		g_baseDir = (process.env.HOME || process.env.USERPROFILE) + "/mm3Data";
		mkdirp(g_baseDir, function (err) {
			if (err) {
				log.error(err);
			}
		});
	}
	return g_baseDir;
}


function getFileList(dir) {

	var result = [];
	var files = fs.readdirSync(dir);
	for (var x in files) {
		var fqn = path.join(dir, files[x]);
		if (!fs.statSync(fqn).isDirectory()) {
			result.push(files[x]);
		}
	}
	return result;
}

function waitOnWriteToComplete(callback,arg){

	fileOutStream.on('finish', function() {
		log.debug('All writes are now complete.');
		callback.call(arg);
	});
}

function deleteFile(filename){
	fs.unlinkSync(path.join(getBaseDir(), filePath));
};


module.exports = {

	startCaptureToFile: startCaptureToFile,
	stopCaptureToFile: stopCaptureToFile,
	getNewFileName: getNewFileName,
	getFileList: getFileList,
	getBaseDir: getBaseDir,
	waitOnWriteToComplete : waitOnWriteToComplete,
	deleteFile: deleteFile
};
