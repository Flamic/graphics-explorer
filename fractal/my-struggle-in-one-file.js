const canvasWidth = 800;
const canvasHeight = 800;
const typeInput = document.getElementById("type");
const lineCountInput = document.getElementById("line-count");
const colorSchemeInput = document.getElementById("color-scheme");
const iterationsCountInput = document.getElementById("iterations-count");

let canvas;
let type = typeInput.value;
let lineCount = Number.parseInt(lineCountInput.value);
let color = colorSchemeInput.value;
let iterationsCount = Number.parseInt(iterationsCountInput.value);
let lastScrollPosition = 0;
let sensitivity = 0.001;
let zoom = 1.0;
let zoomMin = 0.1;
let zoomMax = 20.0;
let locked = false;
let lastXOffset = 0;
let lastYOffset = 0;
let lastXScale = 0;
let lastYScale = 0;
let startX = 0;
let startY = 0;
let xOffset = 0;
let yOffset = 0;
let koch;
let dragon;
let lastMatrix = [];
let newXPos = 0;
let newYPos = 0;
/*
const map = (obj, func, args) => {
    const copy = {...obj}
    copy[func]?.apply(null, args);
    return obj;
}
*/
typeInput.addEventListener("change", (e) => {
  type = e.target.value;
  update();
});
lineCountInput.addEventListener("change", (e) => {
  lineCount = Number.parseInt(e.target.value);
  update();
});
colorSchemeInput.addEventListener("change", (e) => {
  color = e.target.value;
  update();
});
iterationsCountInput.addEventListener("change", (e) => {
  iterationsCount = Number.parseInt(e.target.value);
  update();
});

function setup() {
  lastMatrix = [
    [zoom, 0, (1 - zoom) * mouseX + xOffset],
    [0, zoom, (1 - zoom) * mouseY + yOffset],
    [0, 0, 1],
  ];
  //noLoop();
  canvas = createCanvas(canvasWidth, canvasHeight).parent("draw-block");
  //camera(0, 0, 200, 0, 0, 0, 0, 1, 0);
  //frameRate(1.2);
  stroke(255);
  koch = new KochFractal();
  update();
}

function draw() {
  background(0);
  let x = mouseX;
  let y = mouseY;
  /*
        lastMatrix = multiply(lastMatrix, [[0, 0, (1 - zoom) * mouseX + xOffset], [0, 0, (1 - zoom) * mouseY + yOffset], [0, 0, 1]]);
        applyMatrix(
            zoom, 0,
            0, zoom,
            lastMatrix[0][2], lastMatrix[1][2]
        );
    */
  /*
        lastMatrix = multiply(lastMatrix, [[zoom, 0, (1 - zoom) * mouseX + xOffset], [0, zoom, (1 - zoom) * mouseY + yOffset], [0, 0, 1]]);
        applyMatrix(
            lastMatrix[0][0], lastMatrix[1][0],
            lastMatrix[0][1], lastMatrix[1][1],
            lastMatrix[0][2], lastMatrix[1][2]
        );*/

  /*
    let m = multiply(
        multiply(
            [[1, 0, mouseX], [0, 1, mouseY], [0, 0, 1]],
            [[zoom, 0, 0], [0, zoom, 0], [0, 0, 1]]
        ), [[1, 0, -mouseX], [0, 1, -mouseY], [0, 0, 1]]);
    console.log(m);
    applyMatrix(
        m[0][0], m[1][0],
        m[0][1], m[1][1],
        m[0][2], m[1][2]
    );
    */

  //translate(mouseX, mouseY);
  //scale(zoom);
  //translate(-(mouseX), -(mouseY));
  //translate(mouseX, mouseY);
  translate(newXPos + xOffset, newYPos + yOffset);
  scale(zoom);

  //translate(-mouseX, -mouseY);
  /*
    var scaleBy = 1.01;
    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      var oldScale = stage.scaleX();

      var pointer = stage.getPointerPosition();

      var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      var newScale =
        e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
*/
  /*
    applyMatrix(
        zoom, 0,
        0, zoom,
        //xOffset, yOffset
        (1 - zoom) * lastXScale, (1 - zoom) * lastYScale
    );
    */
  koch.render();
}

function multiply(a, b) {
  let aNumRows = a.length;
  let aNumCols = a[0].length;
  let bNumRows = b.length;
  let bNumCols = b[0].length;
  if (aNumCols != bNumRows)
    throw "Matrix mupltiplication exception: column count of first matrix must be equal to row count of second one";
  let m = new Array(aNumRows);
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols);
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;
      for (var i = 0; i < aNumCols; ++i) m[r][c] += a[r][i] * b[i][c];
    }
  }
  return m;
}

function mouseWheel(event) {
  let newZoom = constrain(
    zoom + zoom * sensitivity * event.delta,
    zoomMin,
    zoomMax
  );
  let zoomDelta = newZoom - zoom;
  //xOffset = -zoom*mouseX;
  //yOffset = -zoom*mouseY;
  //lastXScale = mouseX / zoom;
  //lastYScale = mouseY / zoom;

  newXPos -=
    ((mouseX - xOffset - newXPos) / (width * zoom)) * width * zoomDelta;
  newYPos -=
    ((mouseY - yOffset - newYPos) / (height * zoom)) * height * zoomDelta;
  zoom = newZoom;
  //newXPos = mouseX - (mouseX / oldZoom) * zoom;
  //newYPos = mouseY - (mouseY / oldZoom) * zoom;
  return false;
}

function update() {
  koch.generate(lineCount, iterationsCount);
}

function mousePressed() {
  locked = true;
  startX = mouseX;
  startY = mouseY;
}

function mouseDragged() {
  if (locked) {
    xOffset = mouseX + lastXOffset - startX;
    yOffset = mouseY + lastYOffset - startY;
  }
}

function mouseReleased() {
  locked = false;
  lastXOffset = xOffset;
  lastYOffset = yOffset;
}

class KochFractal {
  constructor() {
    this.start = createVector(0, height / 1.5);
    this.end = createVector(width, height / 1.5);
    this.restart();
  }

  restart() {
    this.count = 0;
    this.lines = [{ start: this.start, end: this.end }];
  }

  getCount() {
    return this.count;
  }

  render() {
    this.lines.forEach((lineElement) => {
      line(
        lineElement.start.x,
        lineElement.start.y,
        lineElement.end.x,
        lineElement.end.y
      );
    });
  }

  generate(lineCount = 2, iterations = 1) {
    this.restart();
    for (let i = 0; i < iterations; ++i) this.next(lineCount);
  }

  next(lineCount = 2) {
    let newLines = [];

    this.lines.forEach((line) => {
      let vStart, vEnd, v;

      vStart = p5.Vector.sub(line.end, line.start);
      vStart.div(3);
      v = vStart.copy();
      v.rotate(PI);
      vEnd = vStart.copy();
      vEnd.mult(2);
      vStart.add(line.start);
      vEnd.add(line.start);
      newLines.push(
        { start: line.start, end: vStart.copy() },
        { start: vEnd, end: line.end }
      );

      for (let i = 0; i < lineCount; ++i) {
        const newStart = vStart.copy();
        v.rotate((2 * PI) / (lineCount + 1));
        vStart.add(v);
        newLines.push({ start: newStart, end: vStart.copy() });
      }
    });

    this.lines = newLines;
    this.count++;
  }
}

/*
function setup() {
  noLoop();
  createCanvas(400, 400);
}

function print(v1, v2) {
  if (arguments.length == 2)
    printLine(v1, v2);
  else
    printLine(v1.start, v1.end);
}

function printLine(p1, p2) {
  line(p1.x, p1.y, p2.x, p2.y);
}

function printVector(v) {
  line(0, 0, v.x, v.y);
}

function draw() {
  background(220);
  let newLines = [];
  let vStart, vEnd, v;
  let start = createVector(0, height / 1.5);
  let end = createVector(width, height / 1.5);
  let lineCount = 2;

  vStart = p5.Vector.sub(end, start);
  vStart.div(3);
  v = vStart.copy();
  v.rotate(PI);
  vEnd = vStart.copy();
  vEnd.mult(2);
  vStart.add(start);
  vEnd.add(start);
  //v.add(start);
  //printVector(start);
  // printLine(start, vStart);
  // printLine(vEnd, end);
  //printVector(v);
  //console.log(start);
  newLines.push({ start: start, end: vStart.copy() }, { start: vEnd, end: end });

  for (let i = 0; i < lineCount; ++i) {
    const newStart = vStart.copy();
    v.rotate(2 * PI / (lineCount + 1));

    vStart.add(v);
    //printLine(createVector(300, 300), vStart);
    //printLine(newStart, vStart);
    newLines.push({ start: newStart, end: vStart.copy() });
  }
  console.log(newLines);
  newLines.forEach(lineElement => {
            line(lineElement.start.x, lineElement.start.y, lineElement.end.x, lineElement.end.y);
        });
}
*/
