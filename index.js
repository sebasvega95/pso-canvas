var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var width = canvas.width / 2;
var height = canvas.height / 2;
var size = 10;

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;

function drawInScale(drawing) {
  ctx.save();
  ctx.translate(width, height);
  ctx.scale(width / size, -height / size);
  drawing();
  ctx.restore();
  ctx.stroke();
}

function drawGrid() {
  drawInScale(() => {
    // x
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    // y
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
  });
  for (var x = -size; x <= size; x++) {
    drawInScale(() => {
      ctx.beginPath();
      ctx.arc(x, 0, 0.05, 0, 2 * Math.PI, true);
      ctx.closePath();
    });
  }
  for (var y = -size; y <= size; y++) {
    if (y == 0)
      continue;
    drawInScale(() => {
      ctx.beginPath();
      ctx.arc(0, y, 0.05, 0, 2 * Math.PI, true);
      ctx.closePath();
    });
  }
}

// Schaffer function
// function f(x, y) {
//   return 0.5 - (Math.pow(Math.sin(Math.sqrt(x*x + y*y)), 3) - 0.5) / Math.pow(1 + 0.001 * (x*x + y*y), 2);
// }

// Shubert function
// function f(x, y) {
//   var sum1 = 0, sum2 = 0;
//   for (var i = 1; i <= 5; i++) {
//     sum1 += i * Math.cos((i + 1) * x + i);
//     sum2 += i * Math.cos((i + 1) * y + i);
//   }
//   return sum1 * sum2;
// }

// Hansen function
// function f(x, y) {
//   var sum1 = 0, sum2 = 0;
//   for (var i = 1; i <= 5; i++) {
//     sum1 += i * Math.cos((i - 1) * x + i);
//     sum2 += i * Math.cos((i + 1) * y + i);
//   }
//   return sum1 * sum2;
// }

// Camel function
// function f(x, y) {
//   return (4 - 2.1*x*x + x*x*x*x/3) * x*x + x*y + (-4 + 4*y*y) * y*y;
// }

function f(x, y) {
  return x*x + y*y;
}

function setBackground() {
  var canvas = document.getElementById('backgroundCanvas');
  var ctx = canvas.getContext('2d');
  var heat = simpleheat(canvas);
  var data = [];
  var max = -1E-30;

  for (var x = 0; x < canvas.width; x += 10) {
    for (var y = 0; y < canvas.height; y += 10) {
      var xx = (x - width) / (width / size);
      var yy = (y - width) / (height / size);
      var z =  f(xx, yy);
      data.push([x, y, z]);
      max = Math.max(max, z);
    }
  }

  heat.data(data);
  heat.max(max);
  heat.draw();
}

var n = 20;
var x = [];
var v = [];
var pbest = [];
var gbest;

function initParticles() {
  gbest = 1E30;
  for (var i = 0; i < n; i++) {
    v[i] = [0, 0];
    x[i] = [size * (2 * Math.random() - 1), size * (2 * Math.random() - 1)];
    pbest[i] = x[i];

    if (f(x[i][0], x[i][1]) < gbest)
      gbest = x[i];
  }
}

var inertia = 0.5;
var eta1 = 1;
var eta2 = 2;
var vMax = 1.5;

function psoStep() {
  var r1 = Math.random();
  var r2 = Math.random();

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < 2; j++) {
      v[i][j] = inertia * v[i][j] + eta1 * r1 * (pbest[i][j] - x[i][j]) + eta2 * r2 * (gbest[j] - x[i][j]);

      if (Math.abs(v[i][j]) > vMax)
        v[i][j] = Math.sign(v[i][j]) * vMax;
    }
  }

  var gbf = f(gbest[0], gbest[1]);

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < 2; j++) {
      x[i][j] += v[i][j];
      if (x[i][j] < -size || x[i][j] > size)
        x[i][j] = Math.sign(x[i][j]) * size;
    }
    var nf = f(x[i][0], x[i][1]);
    var pbf = f(pbest[i][0], pbest[i][1]);

    if (nf < pbf)
      pbest[i] = x[i];
    if (nf < gbf) {
      gbest = x[i];
      gbf = nf;
    }
  }
}

var fpsInterval, before;
var iter;
var end;
var maxIter = 50;

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  before = Date.now();
  end = false;
  iter = 0;
  document.getElementById('solution').innerHTML = "Calculating...";
  initParticles();
  animate();
}

function animate() {
  if (end) {
    document.getElementById('solution').innerHTML = f(gbest[0], gbest[1]);
    return;
  }

  requestAnimationFrame(animate);
  var now = Date.now();
  var elapsed = now - before;

  if (elapsed > fpsInterval) {
    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of rAF's interval (16.7ms)
    before = now - (elapsed % fpsInterval);
    draw();
    psoStep();

    iter++;
    if (iter >= maxIter)
      end = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // drawGrid();
  var r = 0.2;
  for (var i = 0; i < n; i++) {
    drawInScale(() => {
      ctx.fillStyle = "#EEEEEE";
      ctx.beginPath();
      ctx.arc(x[i][0], x[i][1], r, 0, 2* Math.PI);
      ctx.fill();
    });
  }
}

setBackground();
