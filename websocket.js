const WebSocket = require('ws');
var request = require('request');

const wss = new WebSocket.Server({ port: 3001 });
let interval

console.log('Websocket started!');

wss.on('connection', function connection(ws) {
  
	console.log('here1');
	startInterval(getJson, 2000);

function startInterval(callbackFn, timeout) {
	console.log('here2');
    setInterval(callbackFn, timeout);
    var resp = callbackFn();
}

function getJson(){
  request('http://localhost:3000/fan', function (error, response, body) {
  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.
  try {
  ws.send(body);
  }
	catch (e) {
		ws.terminate();
		return;
	}
  });
}

});