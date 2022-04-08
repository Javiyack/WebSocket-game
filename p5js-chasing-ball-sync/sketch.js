
// Global parameters
const EASING_SPEED = 0.05;
const clientId = generateUUID();

// Current ball postion
let pos = {
  x: 0,
  y: 0
};

// Target ball position
let target = {
  x: 0,
  y: 0
};

let players = new Map()

function setup() {
  createCanvas(480, 320);
  background(0);
  noStroke();
}

function draw() {
  // background(220);
  let keys = Object.keys(Object.fromEntries(players))
  if (!!keys.length) {
    keys.forEach(key => {
      let player = players.get(key)
      if (Math.abs(player.pos.x - player.target.x + player.pos.y - player.target.y) > 2) {

        fill(0, 25);
        rect(0, 0, width, height);
        fill(255);
        // Ease position into target
        let newPosX = player.pos.x + EASING_SPEED * (player.target.x - player.pos.x);
        let newPosY = player.pos.y + EASING_SPEED * (player.target.y - player.pos.y);
        players.set(key, {pos: {x: newPosX, y: newPosY}, target: player.target})
      }
      //let angle = atan(player.target.x/(player.target.y+0.000001))
      circle(player.pos.x, player.pos.y, 20);
      //arc(player.pos.x, player.pos.y, 20, 20, angle -QUARTER_PI, angle + QUARTER_PI, PIE);
      
    })
  }

}

function mouseClicked() {
  setTarget(mouseX, mouseY);
  console.log("click: : " + mouseX + ", " + mouseY);
  sendTargetToServer();

  // console.log("New target is: ");
  // console.log(target);
}

function setTarget(tx, ty) {
  let player = players.get(clientId) ? players.get(clientId) : {pos: {x: tx, y: ty}, target: {x: tx, y: ty}}
  players.set(clientId, {pos: player.pos, target: {x: tx, y: ty}})
}

function sendTargetToServer() {
  let norm = Object.fromEntries(players)
  let str = JSON.stringify(norm);
  serverConnection.send(str);
}


// WEBSOCKET STUFF
const serverAddress = "ws://localhost:5000";

const serverConnection = new WebSocket(serverAddress);

serverConnection.onopen = function () {
  console.log("I just connected to the server on " + serverAddress);
}

serverConnection.onmessage = function (event) {
  let obj = JSON.parse(event.data);
  console.log("Received msg data: " + JSON.stringify(obj));
  players = new Map(Object.entries(obj))
  let objectVersion = Object.fromEntries(players)
  console.log("objectVersion " + objectVersion);
  console.log("players " + players.size);
}

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
