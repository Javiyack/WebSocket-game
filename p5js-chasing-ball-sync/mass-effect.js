
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

let angeStep = 0.01
let angle = 0
let ux = 1
let uy = 1
let u = 1
let rot = 0
let items
let difT

let someEvent = true

class AI {
  constructor() {
    this.position = {x: getRandomInt(10, width * 0.9), y: getRandomInt(10, height * 0.9), vx: 1, vy: 0, ax: 0, ay: 0}
    this.angle = 0
    this.headAngle = getRandomInt(-10, 10) * QUARTER_PI / 10
    this.vel = 0;
    this.radio = 160;
    this.maxVel = 10
    this.minVel = 0.5
    this.target = {x: width / 2, y: height / 2, angle: 0}
    this.walking = false;
    this.alerted = false;
    this.skill = 1;
    this.spin = 5;
    this.f = {x: 0, y: 0, value: 0}
  }
}

let players = new Map()

function setup() {
  createCanvas(710, 400);
  blendMode(BLEND);
  frameRate(30)
  noStroke();
  players.set(clientId, new AI())
}

function draw() {

  difT = 0.1 + 1 / (1 + getFrameRate())
  background('#0f0f0f');
  let keys = Object.keys(Object.fromEntries(players))

  if (keys.length != items) {
    items = keys.length
    console.log("items: " + items)
  }
  if (!!keys.length) {
    keys.forEach(key => {
      var player = players.get(key)
      if (!!player) {
        player = move(player)
        push();
        drawPlayer(player, key)
        pop();
      }
    })
  }
  // background(102);
  // rect(0, 0, width, height);
  // fill(0, 100);
  // fill(255);  // arc(width * 0.5, height * 0.5, 40, 40, QUARTER_PI / 4, QUARTER_PI / 4, PIE);
  //background(0);
  // translate(width * 0.5, height * 0.5);
  // fill(0, 60, 0);
  //arc(0, 0, 160, 160, HALF_PI - QUARTER_PI * 0.8, HALF_PI + QUARTER_PI * 0.8, PIE);  // noFill();
  // stroke(255);
  // push();
  // translate(500, height * 0.35, -200); // sphere(300);
  // pop();
  // push();
  // translate(width * 0.5, height * 0.5);
  // rotate(frameCount / 50.0);
  // triangle(0, 0, 20, 60, -20, 60);  
  // pop();
  //console.log("click: : " + mouseX + ", " + mouseY + ", " + angle);
}

function drawPlayer(player, key) {
  player.headAngle += angeStep * player.spin
  let rand = Math.random()+0.5
  if (player.headAngle >= QUARTER_PI || player.headAngle <= - QUARTER_PI || (rand > 0.999 && rand < 1.001)) player.spin = -player.spin * Math.min(Math.max(rand,0.5), 1.5)
  if(Math.abs(player.spin)<0.5) player.spin = player.spin*4
  if(Math.abs(player.spin) > 5) player.spin = player.spin/5
  //angeStep = angeStep*((QUARTER_PI - Math.abs(player.headAngle)/QUARTER_PI))
  //noStroke();

  translate(player.position.x, player.position.y);
  rotate(player.angle);
  fill('rgba(200,200,200,0.5)');
  polygon(0, 0, 10, 3);
  rotate(player.headAngle);
  for (let r = 2 * player.radio; r > 0; --r) {
    noStroke();
    fill(10, 200 + (player.radio - r), 10, 0.9);
    arc(0, 0, r, r, - QUARTER_PI, + QUARTER_PI, PIE);
  }
}

function move(player) {

  let rand = Math.random();
     if (someEvent) console.log("diff: " + difT + ", player: " + JSON.stringify(player))
  let distance = Math.sqrt(Math.pow(player.target.x - player.position.x, 2) + Math.pow(player.target.y - player.position.y, 2))
  if (!someEvent && distance < player.radio / 2 && player.vel <= player.minVel && Math.abs(player.angle - player.target.angle) < 0.1) {
    console.log("player: " + JSON.stringify(player))
    player.vel = 0;
    player.position.vx = 4 * cos(player.angle)
    player.position.vy = 4 * sin(player.angle)
    player.walking = false
  }
  if (rand < 0.005) {
    player.target = {x: getRandomInt(10, width * 0.9), y: getRandomInt(10, height * 0.9), angle: 0}
    player.walking = true;
  } 
  if (player.walking) {
    let vel = Math.min(Math.sqrt(Math.pow(player.position.vx, 2) + Math.pow(player.position.vy, 2)), player.maxVel);//

    let targetAngle = vectorToRadian((player.target.x - player.position.x), (player.target.y - player.position.y)) % TWO_PI
    let ax = (distance > width / 2) ? cos(targetAngle) * (1000000 / Math.pow(distance, 2)) : cos(targetAngle)
    let ay = (distance > height / 2) ? sin(targetAngle) * (1000000 / Math.pow(distance, 2)) : sin(targetAngle)
    let interesX = cos(targetAngle) * distance / 100
    let interesY = sin(targetAngle) * distance / 100
    let differentialAngle = (targetAngle - player.angle)
    let shortest
    if (differentialAngle > PI) shortest = - 2 * PI + differentialAngle
    else if (differentialAngle < (0 - PI)) shortest = 2 * PI + differentialAngle
    else shortest = differentialAngle
    let newAngle = player.angle + 10 * difT * EASING_SPEED * shortest;

    if (newAngle < 0) newAngle = 2 * PI + newAngle
    let normalizedAngle = newAngle % (2 * PI)
    player.position.vx = vel * cos(normalizedAngle)
    player.position.vy = vel * sin(normalizedAngle)
    player.position.ax = ax;
    player.position.ay = ay

    let newVx = player.position.vx + difT * EASING_SPEED * (interesX + ax)
    let newVy = player.position.vy + difT * EASING_SPEED * (interesY + ay)
    player.position.vx = newVx
    player.position.vy = newVy
    if (distance > player.radio) {
      player.maxVel = Math.min(player.maxVel + difT * 2, 4)
    } else {
      player.maxVel = Math.max(player.maxVel - difT, player.minVel)
    }
    player.angle = vectorToRadian(player.position.vx, player.position.vy)
    player.target.angle = targetAngle;

    player.position.x += player.position.vx
    player.position.y += player.position.vy
    player.vel = Math.min(player.maxVel, Math.sqrt(Math.pow(player.position.vx, 2) + Math.pow(player.position.vy, 2)))


    console.log("distance: " + distance + ", targetAngle: " + targetAngle * 360 / TWO_PI + ", player.angle: " + player.angle * 360 / TWO_PI)
    console.log("vx: " + player.position.vx + ", vy: " + player.position.vy)
    console.log("ax: " + ax + ", ay: " + ay)
    console.log("interesX: " + interesX + ", interesY: " + interesY)
    if (someEvent) {
      console.log("distance: " + distance)
      console.log("vel: " + vel)
    }
    someEvent = false

  }
  return player
}
function createWaipoinps() {

}

function vectorToRadian(x, y) {
  let angle = atan(y / x)
  // if (ux > 0 && uy > 0) angle = angle 
  // else if (ux > 0 && uy < 0) angle = angle
  // else 
  if (x > 0 && y > 0) angle = angle
  else if (x > 0 && y < 0) angle = 2 * PI + angle
  else if (x < 0 && y > 0) angle = PI + angle
  else if (x < 0 && y < 0) angle = PI + angle
  // console.log("angle: " + angle * 360 / (2 * PI))
  // console.log("angleCos: " + angleCos * 360 / (2 * PI))
  // console.log("angleSin: " + angleSin * 360 / (2 * PI))
  return angle
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function moveSistemOfReference() {

}

function myTriangre(x, y, a, b, c, orientation) {

  triangle(-10, 75, 58, 20, 86, 75);
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
  someEvent = true
  setTarget(mouseX, mouseY);
  console.log("click: : " + mouseX + ", " + mouseY + ", " + angle);
  sendTargetToServer();

  // console.log("New target is: ");
  // console.log(target);
}

function setTarget(tx, ty) {
  let player = players.get(clientId) ? players.get(clientId) : new AI()
  player.target = {x: tx, y: ty, angle: 0}
  player.walking = true;
  players.set(clientId, player)
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
