'use strict';

var serialPort = require("serialport");
serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

console.log("done");

// return;

//var MM3 = require('./server/components/mind-mirror-3');
var parse = require('./parsers');
var SerialPort = require('serialport').SerialPort;
//var portId = "/dev/ttyS0";
var portId = "/dev/tty.usbserial";

var serialport = new SerialPort(portId, {
  baudrate: 9600,
  stopbits: 1,
  parity: 'none',
  bufferSize: 255,
	parser: parse.parser()
}, false);


//  parser: serialPort.parsers.readline('27','hex')
//serialPort.parsers.readline('27','hex')
//  parser: serialPort.parsers.readline("\n")

serialport.open(function (error) {
	var mm3, buffer;

  if (error) {
    console.log("Failed to connect to : " + portId + " : " + error);
    return;
  }
  console.log("Successfully connected to " + portId);
  serialport.on('data', function (data) {
  //  buffer = new Buffer(data,'binary');
  //  console.log(buffer.length);
    console.log(data);
	  console.log(data.length);
  	//mm3 = new MM3(buffer);

	  console.log(Math.floor(Date.now()/100));
  	//console.log(mm3.toString());
  });
  serialport.on('close', function (data) {
    console.log("Close event received: " + data);
  });
  serialport.on('error', function (error) {
    console.log("Error event received: " + error);
  });
});


function printHex1(buffer) {
  var offsetLength = buffer.length.toString(16).length;
  var last = buffer.length % 16 || 16
  var b = 0;
  var lastBytes;
  var lastSpaces;
  var v, i;
  var rows = 1;
  var str = Date.now() / 100 | 0;

  for (i = 0; i < rows; i++) {
    // str += '\u001b[36m' + zero(b, offsetLength) + '\u001b[0m  ';
    lastBytes = i === rows - 1 ? last : 16;
    lastSpaces = 16 - lastBytes;

    var j;
    for (j = 0; j < lastBytes; j++) {
      str += ' ' + zero(buffer[b], 2);
      b++;
    }

    for (j = 0; j < lastSpaces; j++) {
      str += '   ';
    }

    b -= lastBytes;
    str += '   ';

    for (j = 0; j < lastBytes; j++) {
      v = buffer[b];
      str += (v > 31 && v < 127) || v > 159 ? String.fromCharCode(v) : '.';
      b++;
    }

    str += '\n';
  }

  process.stdout.write(str);

};

var zero = function (n, max) {
  n = n.toString(16).toUpperCase();
  while (n.length < max) {
    n = '0' + n;
  }
  return n;
};
