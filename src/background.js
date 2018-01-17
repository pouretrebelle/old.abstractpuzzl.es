import Vector2 from './utils/Vector2';
import { random, randomInteger, clamp } from './utils/numberUtils';

function hsl(h, s, l) { return 'hsl('+h+', '+clamp(s,0,100)+'%, '+clamp(l,0,100)+'%)';};


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

var canvas,
		c;
var dots = [];

function setup() {
  window.frameRate = 30;
  setupCanvas();
	c.fillStyle = options.background;
	c.strokeStyle = options.color;
  c.fillRect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
  makeDots(options.count);
}

function makeDots(count) {
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

function draw() {
  for (var i = 0; i < dots.length; i++) {
    var dot = dots[i];
    dot.update(canvas);
    dot.draw(c);
  }
}

function setupCanvas() {
  canvas = document.createElement('canvas');
  c = canvas.getContext('2d');
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  document.body.appendChild(canvas);
  c.translate(screenWidth/2, screenHeight/2);
}


const Dot = function(x, y, index) {

  var hue = (prettyHues[randomInteger(0, prettyHues.length-1)]-20)%360;
  var sat = randomInteger(80, 100);
  var bri = randomInteger(65, 75);
  var speed = random(1, 3);

  var size = this.size = randomInteger(25, 50);
	var pos = this.pos = new Vector2(x,y);
	var vel = this.vel = new Vector2(speed,0);
	var ang = this.ang = 180-pos.angle();
  var rot = this.rot = random(0.01,0.08);
	var dir = this.dir = randomInteger(0,1);

	vel.rotate(ang);

  this.color = hsl(hue, sat, bri);
  this.shadow = hsl((hue+40)%360, sat, bri);

  this.update = function(canvas) {

		// randomly change clockwiseness
		if (Math.random() < 0.01) {
			dir = (dir == 1) ? 0 : 1;
		}

		// rotate
		if (dir) {
			vel.rotate(this.rot);
		} else {
			vel.rotate(-this.rot);
		}
		// add velocity to position
		pos.plusEq(vel);
  };

  this.draw = function(c) {
    c.save();

    c.fillStyle = this.shadow;
		c.beginPath();
      c.arc(pos.x,pos.y+5,this.size,0,Math.PI*2,true);
		c.fill();

    c.fillStyle = this.color;
		c.beginPath();
      c.arc(pos.x,pos.y,this.size,0,Math.PI*2,true);
		c.fill();

    c.restore();
  };

};


function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

window.addEventListener('load', init);

function init() {
  setup();
  window.requestAnimationFrame(loop);
}
