import Vector2 from './utils/Vector2';
import { random, randomInteger, clamp } from './utils/numberUtils';

function hsl(h, s, l) { return `hsl(${h}, ${clamp(s,0,100)}%, ${clamp(l,0,100)}%)`;};


let	screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let screenMin = (screenWidth < screenHeight) ? screenWidth : screenHeight;

const options = {
	background: '#fff',
  predraw: 200,
  color: '#000',
  count: screenWidth * screenHeight * 0.00005,
};
const prettyHues = [2, 10, 17, 37, 40, 63, 67, 72, 74, 148, 152, 156, 160, 170, 175, 189, 194, 260, 270, 280, 288, 302, 320, 330, 340, 350];

let canvas,	c;
let dots = [];

const setup = () => {
  setupCanvas();

	c.fillStyle = options.background;
	c.strokeStyle = options.color;
  c.fillRect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);

  makeDots(options.count);
}

const makeDots = (count) => {
  for (var i = 0; i < count; i++) {
    var x = randomInteger(-screenWidth*0.5,screenWidth*0.5);
    var y = randomInteger(-screenHeight*0.5,screenHeight*0.5);

    const dot = new Dot(x, y, i);

    let tempPredraw = options.predraw;
    while (tempPredraw > 0) {
      dot.update(canvas);
      dot.draw(c);
      tempPredraw--;
    }

    dots.push(dot);
  }
}

const draw = () => {
  dots.forEach((dot) => {
    dot.update(canvas);
    dot.draw(c);
  });
}

const setupCanvas = () => {
  canvas = document.createElement('canvas');
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  document.body.appendChild(canvas);
  c = canvas.getContext('2d');
  c.translate(screenWidth/2, screenHeight/2);
}


class Dot {

  constructor(x, y, index) {
    const hue = (prettyHues[randomInteger(0, prettyHues.length-1)]-20)%360;
    const sat = randomInteger(80, 100);
    const bri = randomInteger(65, 75);
    this.color = hsl(hue, sat, bri);
    this.shadow = hsl((hue+40)%360, sat, bri);

    this.size = randomInteger(25, 50);
    this.pos = new Vector2(x,y);
    this.vel = new Vector2(random(1, 3),0);
    this.ang = 180-this.pos.angle();
    this.rot = random(0.01,0.08);
    this.dir = randomInteger(0,1);

    this.vel.rotate(this.ang);
  }

  update(canvas) {
		// randomly change clockwiseness
		if (Math.random() < 0.01) {
			this.dir = (this.dir == 1) ? 0 : 1;
		}

		// rotate
		if (this.dir) {
			this.vel.rotate(this.rot);
		} else {
			this.vel.rotate(-this.rot);
    }

		// add velocity to position
		this.pos.plusEq(this.vel);
  };

  draw(c) {
    c.save();

    // draw shadow dot
    c.fillStyle = this.shadow;
		c.beginPath();
      c.arc(this.pos.x,this.pos.y+5,this.size,0,Math.PI*2,true);
		c.fill();

    // draw upper dot
    c.fillStyle = this.color;
		c.beginPath();
      c.arc(this.pos.x,this.pos.y,this.size,0,Math.PI*2,true);
		c.fill();

    c.restore();
  };

};

const loop = () => {
  draw();
  window.requestAnimationFrame(loop);
}

const init = () => {
  setup();
  window.requestAnimationFrame(loop);
}

window.addEventListener('load', init);
