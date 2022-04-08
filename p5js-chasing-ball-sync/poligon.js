
// Global parameters
const EASING_SPEED = 0.05;
const clientId = generateUUID();

// Current ball postion
let pos = {
  x: 0,
  y: 0,
  angle: 0
};

// Target ball position
let target = {
  x: 1,
  y: 1,
  angle: 0
};

let items;

let mouse0 = {
  x: 0,
  y: 0
}

let mouse1 = {
  x: 0,
  y: 0
}

let softeners = []

let maxDistance
let curretVelocity=0

let players = new Map()

function setup() {
  createCanvas(960, 640);
  frameRate(30)
  background(0);
  noStroke();
}

function draw() {
  // background(220);
  let keys = Object.keys(Object.fromEntries(players))

  if (keys.length != items) {
    items = keys.length
    console.log("items: " + items)
  }
  if (!!keys.length) {
    keys.forEach(key => {
      let player = players.get(key)
      let distance = Math.sqrt(Math.pow(player.pos.x - player.target.x, 2) + Math.pow(player.pos.y - player.target.y, 2))
      if (distance > 0.1) {
        let softener = curretVelocity/width + (1 + maxDistance - distance) / (1 + (maxDistance + distance))
        softeners.push(softener);
        let easier = EASING_SPEED * (EASING_SPEED - distance / (300 * width)) / (EASING_SPEED + distance / (300 * width))

        // Ease position into target        
        let newPosX = player.pos.x + easier * (player.target.x - player.pos.x) * softener;
        let newPosY = player.pos.y + easier * (player.target.y - player.pos.y) * softener;

        let differentialAngle = (player.target.angle - player.pos.angle)
        let shortest
        if (differentialAngle > PI) shortest = - 2 * PI + differentialAngle
        else if (differentialAngle < (0 - PI)) shortest = 2 * PI + differentialAngle
        else shortest = differentialAngle
        let newAngle = player.pos.angle + 4 * easier * shortest *  softener;

        if (newAngle < 0) newAngle = 2 * PI + newAngle
        let normalizedAngle = newAngle % (2 * PI)

        if (distance > (maxDistance - 2)) {
          console.log("New: " + JSON.stringify(player))
          console.log("maxDistance:" + maxDistance)
          console.log("distance:" + distance)
          console.log("softener: " + softener)
          console.log("easier: " + easier)
          console.log("old angle: " + player.pos.angle * 360 / (2 * PI))
          console.log("new angle: " + player.target.angle * 360 / (2 * PI))
          console.log("differentialAngle: " + differentialAngle * 360 / (2 * PI))
          console.log("shortest: " + shortest * 360 / (2 * PI))
          console.log("newAngle: " + newAngle * 360 / (2 * PI))
          console.log("normalizedAngle: " + normalizedAngle * 360 / (2 * PI))

        }

        players.set(key, {pos: {x: newPosX, y: newPosY, angle: normalizedAngle}, target: player.target})

        if (distance < 0.2 && distance > 0.18) {
          console.log("maxDistance:" + maxDistance);
          console.log("distance:" + distance)
          console.log("softener: " + softener)
          console.log("easier: " + easier)
          console.log("softeners: " + softeners)
        }
      }
      //console.log("New: " + JSON.stringify(player))

      //circle(player.pos.x, player.pos.y, 20);
      // arc(player.pos.x, player.pos.y, 40, 40, angle - QUARTER_PI / 4, angle + QUARTER_PI / 4, PIE);
      //

      fill(0, 30 * width / distance);
      rect(0, 0, width, height);
      fill(255);
      push();
      translate(player.pos.x, player.pos.y);
      rotate(player.pos.angle);
      polygon(0, 0, 20, 3);
      pop();
    })
  }
}

function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function mouseClicked() {
  setTarget(mouseX, mouseY);
  console.log("click: : " + mouseX + ", " + mouseY);
  console.log("maxDistance: : " + maxDistance);
  sendTargetToServer();

  // console.log("New target is: ");
  // console.log(target);
}

function setTarget(tx, ty) {
  let player = players.get(clientId) ? players.get(clientId) : {pos: pos, target: target}
  let ux = abs((tx - player.pos.x)) / (tx - player.pos.x)
  let uy = abs((ty - player.pos.y)) / (ty - player.pos.y)
  let angle = atan((ty - player.pos.y) / (tx - player.pos.x))
  // if (ux > 0 && uy > 0) angle = angle 
  // else if (ux > 0 && uy < 0) angle = angle
  // else 
  if (ux > 0 && uy > 0) angle = angle
  else if (ux > 0 && uy < 0) angle = 2 * PI + angle
  else if (ux < 0 && uy > 0) angle = PI + angle
  else if (ux < 0 && uy < 0) angle = PI + angle
  console.log("angle: " + angle * 360 / (2 * PI))
  maxDistance = 1 + Math.sqrt(Math.pow(tx - player.pos.x, 2) + Math.pow(ty - player.pos.y, 2));
  curretVelocity = Math.sqrt(Math.pow(player.target.x - player.pos.x, 2) + Math.pow(player.target.y - player.pos.y, 2));
  players.set(clientId, {pos: player.pos, target: {x: tx, y: ty, angle: angle}})
}

function sendTargetToServer() {
  let norm = Object.fromEntries(players)
  let str = JSON.stringify(norm);
  serverConnection.send(str);
}


// WEBSOCKET STUFF
const serverAddress = "ws://192.168.1.102:5000";

const serverConnection = new WebSocket(serverAddress);

serverConnection.onopen = function () {
  console.log("I just connected to the server on " + serverAddress);
}

serverConnection.onmessage = function (event) {
  let obj = JSON.parse(event.data);
  console.log("Received msg data: " + JSON.stringify(obj));
  players = new Map(Object.entries(obj))
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
