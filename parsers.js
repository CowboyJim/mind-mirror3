/**
 * Created by jim on 5/13/15.
 * Copyright 2015 Jim Boone boone.jim@gmail.com
 */

'use strict';

var syncBytes = [0x0A, 0x05];
var lastSyncByte = 0x0A;

function indexOf(byte, buffer){
	if(buffer != undefined){

		for (var x = 0; x < buffer.length; x++){
			if(byte === buffer[x]){
				return x;
			}

		}


	}

}


module.exports = {


  fileparser: function(){



    return function (emitter, buffer){

		var buf = [];
		var syncByteIndex = indexOf(lastSyncByte, buffer);
		var packetSize = buffer[syncByteIndex + 1];

		var dataPacket = buffer.slice(syncByteIndex,packetSize);

		console.log(dataPacket.length);
		emitter.emit('data', dataPacket);

		// Loop and keep emitting until done










    };


  },

  comPortParser : function(){

    return function (emitter, buffer){
	console.log(buffer.toString());
		console.log("comPortParser called");

    };

  }


};
