// Global parameters
const COUNT = 1500;
const SIZE = 2;
const MASE = SIZE * 5.972 * 50000000000000;
const SUN_SIZE = 30;
const SUN_MASE = 332800 * MASE * 17000000000;
const MAX_X = 1800;
const MAX_Y = 1000;
const MAX_SIZE = 40;
const MAX_MASE = 40;
const EASING_SPEED = 0.05;
const TIME_INCREMENT = 0.0000000001;
const G = 0.0000000000667;
const clientId = generateUUID();

/*
        m·M
F = G·-------
        d^2
  
F = m·a

v = a·t



*/



let universe = [];
let printList = [];

let universeMap = new Map();


let players = new Map()



function setup() {
  universe.push(new body(
    new position(MAX_X / 2, MAX_Y / 2),
    new velocity(0, 0),
    new acceleration(0, 0),
    SUN_MASE,
    SUN_SIZE));
  [...Array(COUNT).keys()].forEach(() => {
    let x = genRnd(MAX_X / 3);
    let y = genRnd(MAX_Y / 2);
    let x2 = genRnd(MAX_X / 3);
    let y2 = genRnd(MAX_Y / 2);
    universe.push(new body(
      new position(x, y),
      new velocity(0 / 100, 5000000000+genRnd(15000000000)),
      new acceleration(genRnd(0), genRnd(0)),
      MASE,
      SIZE));
    universe.push(new body(
      new position(MAX_X - x2, MAX_Y - y2),
      new velocity(0 / 100, -5000000000-genRnd(15000000000)),
      new acceleration(genRnd(0), genRnd(0)),
      MASE,
      SIZE));
  });
  createCanvas(MAX_X, MAX_Y);
  background(0);
  noStroke();
}

function draw() {
  background(0);
  universe.forEach(player => {
    if (!player.eaten) {
      processForces(player)
      circle(player.pos.x, player.pos.y, player.size);
    }
    //fill(color(RGB, 10 * player.size, 0, 255));
    //circle(player.pos.x, player.pos.y, player.size);
    //universe = universe.filter(b => !popList.includes(b))
  })
  universe = printList
  printList = []
}

async function processForces(player) {
  universe.forEach(body => {
    //await sleep(1000)
    // u = vector unitario entre cuerpos
    // d = distancia = sqrt((x-x)^2 + (y-y)^2)
    // F=G·m·M/d^2
    // a = F/m
    // acc.x = acc.x + a·ux
    // acc.y = acc.y + a·uy
    // vel.x = vel.x + acc.x·TIME_INCREMENT
    // vel.y = vel.y + acc.x·TIME_INCREMENT
    // pos.x = pos.x + vel.x·TIME_INCREMENT
    // pos.y = pos.y + vel.x·TIME_INCREMENT
    let v = {
      x: body.pos.x - player.pos.x,
      y: body.pos.y - player.pos.y
    }

    if (v.x !== 0 && v.y !== 0) {
      let d = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
      if (d <= player.size / 2 && !body.eaten) {
        let sumMase = player.mase + body.mase
        let sumSize = Math.sqrt(player.size * player.size + body.size * body.size)
        player.vel.x = (player.vel.x * player.mase + body.vel.x * body.mase) / sumMase
        player.vel.y = (player.vel.y * player.mase + body.vel.y * body.mase) / sumMase
        player.size = sumSize
        player.mase = sumMase
        body.eaten = true
      } else {
        let u = {
          x: v.x / d,
          y: v.y / d
        }

        let F = G * player.mase * body.mase / (d * d)

        let a = F / player.mase


        player.acc.x = player.acc.x + a * u.x
        player.acc.y = player.acc.y + a * u.y
        player.vel.x = player.vel.x + player.acc.x * TIME_INCREMENT
        player.vel.y = player.vel.y + player.acc.y * TIME_INCREMENT
      }
    }
  })
  player.acc.x = 0
  player.acc.y = 0
  player.pos.x = player.pos.x + player.vel.x * TIME_INCREMENT
  player.pos.y = player.pos.y + player.vel.y * TIME_INCREMENT
  printList.push(player)
}


function processMovement() {

}

function mouseClicked() {
  setTarget(mouseX, mouseY);
  console.log("click: : " + mouseX + ", " + mouseY);
  sendTargetToServer();

  // console.log("New target is: ");
  // console.log(target);
}

function setTarget(tx, ty) {
  let player = players.get(clientId) ? players.get(clientId) : {
    pos: {
      x: tx,
      y: ty
    },
    target: {
      x: tx,
      y: ty
    }
  }
  players.set(clientId, {
    pos: player.pos,
    target: {
      x: tx,
      y: ty
    }
  })
}

function sendTargetToServer() {
  let norm = Object.fromEntries(players)
  let str = JSON.stringify(norm);
  serverConnection.send(str);
}


// WEBSOCKET STUFF
const serverAddress = "ws://localhost:5000";

const serverConnection = new WebSocket(serverAddress);

serverConnection.onopen = function() {
  console.log("I just connected to the server on " + serverAddress);
}

serverConnection.onmessage = function(event) {
  let obj = JSON.parse(event.data);
  console.log("Received msg data: " + JSON.stringify(obj));
  players = new Map(Object.entries(obj))
  let objectVersion = Object.fromEntries(players)
  console.log("objectVersion " + objectVersion);
  console.log("players " + players.size);
}

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) { //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else { //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}