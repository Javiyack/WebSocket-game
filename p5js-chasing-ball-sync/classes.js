class position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
class velocity {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class acceleration {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class body {
	constructor(pos, vel, acc, mase, size = 1) {
		this.pos = pos;
		this.vel = vel;
		this.acc = acc;
		this.mase = mase;
		this.size = size;
		this.density = mase / size;
		this.eaten = false;
	}
}


function genRnd(n) {
	return random = Math.floor(Math.random() * n)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}