"use strict";

// ================ Definitions ================ //
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const downloadGeButton = document.getElementById("download-ge");
const downloadPngButton = document.getElementById("download-png");
const uploadButton = document.getElementById("upload-button");
const downloadFileElement = document.getElementById("download-file");
const uploadFileElement = document.getElementById("upload-file");
const zoomText = document.getElementById("scale-text");

const inputs = [
  [document.getElementById("ax"), document.getElementById("ay"), { value: 1 }],
  [document.getElementById("bx"), document.getElementById("by"), { value: 1 }],
  [document.getElementById("cx"), document.getElementById("cy"), { value: 1 }],
];
const scaleInputs = [
  document.getElementById("sx"),
  document.getElementById("sy"),
];

let values = mapInputsToValues(inputs);
let calculatedValues = values;
let scaleValues = [1, 1, 1];

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 100.0;
const MOUSE_SENSITIVITY = 0.002;
const MIN_CELL_SIZE = 20;
const SCALE_UNITS = [
  0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
];
const POINT_NAME = ["A", "B", "C"];

let handle;
let canvas;
let zoom = 1.0; // Scale factor
let locked = false; // Drag mode when true
let lastOffset = { x: 0, y: 0 }; // Last offset after mouse dragging
let relativePosition = { x: 0, y: 0 }; // First mouse position after start of dragging
let offset = { x: 0, y: 0 }; // Frame offset (after mouse dragging)
let newPos = { x: 0, y: 0 }; // New position according to scaling
let isDrawn = false; // Is fractal rendered after change
let backgroundColor = "white";
let axesColor = "gray";
let shapeColor = "purple";
let gridColor = "#dbdbdb";
let lableFontSize = 11;
let animationProgress = 0;
let animationDirection = 1;
let animation = false;
let animationSpeed = 0.002;


// ============== Event listeners ============== //
startButton.addEventListener("click", () => {
  if (animation) {
    animation = false;
    startButton.innerHTML = 'Start <i class="icon-play"></i>';
    clearInterval(handle);
    blockInputs(false);
  } else {
    animation = true;
    blockInputs(true);
    startButton.innerHTML = 'Pause <i class="icon-pause"></i>';
    handle = setInterval(() => {
      if (
        (animationProgress >= 1 && animationDirection == 1) ||
        (animationProgress <= 0 && animationDirection == -1)
      )
        animationDirection *= -1;
      animationProgress += animationDirection * animationSpeed;
      //animationProgress = (animationProgress == 1 ? 0 : 1);
      isDrawn = false;
    }, 1300);
  }
});

stopButton.addEventListener("click", () => {
  if (handle) {
    clearInterval(handle);
    handle = undefined;
  }
  startButton.innerHTML = 'Start <i class="icon-play"></i>';
  animation = false;
  animationDirection = 1;
  animationProgress = 0;
  isDrawn = false;
  blockInputs(false);
});

inputs.forEach((row) =>
  row.forEach((input) =>
    input.addEventListener?.("input", () => {
      if (handle) {
        clearInterval(handle);
        handle = undefined;
      }
      animation = false;
      animationDirection = 1;
      animationProgress = 0;
      values = mapInputsToValues(inputs);
      isDrawn = false;
    })
  )
);

for (let i = 0; i < 2; ++i) {
  scaleInputs[i].addEventListener("input", () => {
    if (handle) {
      clearInterval(handle);
      handle = undefined;
    }
    animation = false;
    animationDirection = 1;
    animationProgress = 0;
    values = mapInputsToValues(inputs);
    scaleValues[i] = scaleInputs[i].value;
    isDrawn = false;
  });
}

downloadGeButton.addEventListener("click", async (e) => {
  download(getData());
});
downloadPngButton.addEventListener("click", async (e) => {
  saveCanvas(canvas, "transformations", "png");
});
uploadButton.addEventListener("click", async (e) => {
  upload();
});
uploadFileElement.addEventListener("change", async (e) => {
  let fr = new FileReader();
  fr.onload = () => {
    setData(fr.result);
    uploadFileElement.value = null;
  };
  fr.readAsText(uploadFileElement.files[0]);
});
// ============================================= //

function mapInputsToValues(inputs) {
  return inputs.map((row) => row.map((input) => +input.value));
}

function mapValuesToInputs(values, inputs) {
  for (let i = 0; i < 3; ++i)
    for (let j = 0; j < 3; ++j) inputs[i][j].value = trimFloat(values[i][j], 2);
}

function blockInputs(block) {
  inputs.forEach((row) => row.forEach((input) => (input.disabled = block)));
  scaleInputs.forEach((input) => (input.disabled = block));
}

function setup() {
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("draw-block");
  canvas.addClass("main-canvas");
  document.querySelector("canvas").addEventListener("dblclick", resetScale);
}

function draw() {
  if (isDrawn) return;
  clear();
  background(backgroundColor);
  translate(newPos.x + offset.x, newPos.y + offset.y);
  scale(zoom);
  zoomText.innerText = zoom.toFixed(2) + "x";
  render();
  isDrawn = true;
}

function render() {
  const start = { x: 0, y: 0 };
  const end = { x: CANVAS_WIDTH, y: CANVAS_HEIGHT };

  start.x -= newPos.x + offset.x;
  start.y -= newPos.y + offset.y;
  end.x -= newPos.x + offset.x;
  end.y -= newPos.y + offset.y;

  start.x /= zoom;
  start.y /= zoom;
  end.x /= zoom;
  end.y /= zoom;

  const unit = SCALE_UNITS.find((x) => {
    if (x < 1 / zoom) return false;
    const pixels = x * MIN_CELL_SIZE;
    for (let i = start.x - (start.x % pixels); i < end.x; i += pixels) {
      const lable = trimFloat(
        x * Math.round((i - CANVAS_WIDTH / 2) / pixels),
        3
      );
      if (getTextWidth(lable, `${lableFontSize / zoom}px sans-serif`) > pixels)
        return false;
    }
    return true;
  });
  const pixels = unit * MIN_CELL_SIZE;

  gridLine();

  for (let x = start.x - (start.x % pixels); x < end.x; x += pixels) {
    line(x, start.y, x, end.y);
  }

  for (let y = start.y - (start.y % pixels); y < end.y; y += pixels) {
    line(start.x, y, end.x, y);
  }

  if (start.x < CANVAS_WIDTH / 2 && end.x > CANVAS_WIDTH / 2) {
    axesLine();
    line(CANVAS_WIDTH / 2, start.y, CANVAS_WIDTH / 2, end.y);
    fill(axesColor);
    strokeWeight(1 / zoom);
    textSize(lableFontSize / zoom);
    for (let y = start.y - (start.y % pixels); y < end.y; y += pixels) {
      const lable = trimFloat(
        unit * Math.round((CANVAS_HEIGHT / 2 - y) / pixels),
        3
      );
      if (lable == 0) continue;
      text(lable, CANVAS_WIDTH / 2 + 6 / zoom, y + 3 / zoom);
    }
    strokeWeight(2 / zoom);
    line(
      CANVAS_WIDTH / 2,
      start.y,
      CANVAS_WIDTH / 2 + 5 / zoom,
      start.y + 10 / zoom
    );
    line(
      CANVAS_WIDTH / 2,
      start.y,
      CANVAS_WIDTH / 2 - 5 / zoom,
      start.y + 10 / zoom
    );
    strokeWeight(1 / zoom);
    textSize(14 / zoom);
    text("y", CANVAS_WIDTH / 2 - 20 / zoom, start.y + 10 / zoom);
  }

  if (start.y < CANVAS_HEIGHT / 2 && end.y > CANVAS_HEIGHT / 2) {
    axesLine();
    line(start.x, CANVAS_HEIGHT / 2, end.x, CANVAS_HEIGHT / 2);
    fill(axesColor);
    strokeWeight(1 / zoom);
    textSize(lableFontSize / zoom);
    for (let x = start.x - (start.x % pixels); x < end.x; x += pixels) {
      const lable = trimFloat(
        unit * Math.round((x - CANVAS_WIDTH / 2) / pixels),
        3
      );
      const lableOffset =
        getTextWidth(lable, `${lableFontSize / zoom}px sans-serif`) / 2;
      if (lable == 0) continue;
      text(lable, x - lableOffset, CANVAS_HEIGHT / 2 + 14 / zoom);
    }
    strokeWeight(2 / zoom);
    line(
      end.x,
      CANVAS_HEIGHT / 2,
      end.x - 10 / zoom,
      CANVAS_HEIGHT / 2 + 5 / zoom
    );
    line(
      end.x,
      CANVAS_HEIGHT / 2,
      end.x - 10 / zoom,
      CANVAS_HEIGHT / 2 - 5 / zoom
    );
    strokeWeight(1 / zoom);
    textSize(14 / zoom);
    text("x", end.x - 10 / zoom, CANVAS_HEIGHT / 2 - 15 / zoom);
  }

  renderShape();
}

function renderShape() {
  shapeLine();
  calculatedValues = calculateCoordinates(values);
  mapValuesToInputs(calculatedValues, inputs);
  const pixels = getShapePixels(calculatedValues);
  line(pixels[0][0], pixels[0][1], pixels[1][0], pixels[1][1]);
  line(pixels[1][0], pixels[1][1], pixels[2][0], pixels[2][1]);
  line(pixels[2][0], pixels[2][1], pixels[0][0], pixels[0][1]);

  const points = [
    {
      x: pixels[0][0],
      y: pixels[0][1],
      v: createVector(pixels[1][0] - pixels[2][0], pixels[1][1] - pixels[2][1]),
      a: createVector((pixels[1][0] + pixels[2][0]) / 2 - pixels[0][0], (pixels[1][1] + pixels[2][1]) / 2 - pixels[0][1])
    },
    {
      x: pixels[1][0],
      y: pixels[1][1],
      v: createVector(pixels[0][0] - pixels[2][0], pixels[0][1] - pixels[2][1]),
      a: createVector((pixels[0][0] + pixels[2][0]) / 2 - pixels[1][0], (pixels[0][1] + pixels[2][1]) / 2 - pixels[1][1])
    },
    {
      x: pixels[2][0],
      y: pixels[2][1],
      v: createVector(pixels[0][0] - pixels[1][0], pixels[0][1] - pixels[1][1]),
      a: createVector((pixels[0][0] + pixels[1][0]) / 2 - pixels[2][0], (pixels[0][1] + pixels[1][1]) / 2 - pixels[2][1])
    },
  ];

  textSize(18 / zoom);
  strokeWeight(1 / zoom);
  stroke('black');
  fill('black');
  for (let i = 0; i < points.length; ++i) {
    translate(points[i].x, points[i].y);
    let v = createVector(0, 10 / zoom);
    let v2 = createVector(0, -10 / zoom);
    v.rotate(points[i].v.heading());
    v2.rotate(points[i].v.heading());
    if (v.dist(points[i].a) < v2.dist(points[i].a)) v = v2;
    text(POINT_NAME[i], v.x - 5 / zoom, v.y + 5 / zoom);
    translate(-points[i].x, -points[i].y);
  }
}

function getShapePixels(values) {
  const pixels = [[], [], []];
  for (let i = 0; i < 3; ++i) {
    pixels[i][0] = values[i][0] * MIN_CELL_SIZE + CANVAS_WIDTH / 2;
    pixels[i][1] = -values[i][1] * MIN_CELL_SIZE + CANVAS_HEIGHT / 2;
    pixels[i][2] = values[i][2];
  }
  return pixels;
}

function calculateCoordinates(values) {
  let result = scaleByProgressMatrix(values, -1, -1, animationProgress);
  result = scaleByProgressMatrix(
    result,
    scaleValues[0],
    scaleValues[1],
    animationProgress
  );
  return result;
}

function axesLine() {
  strokeWeight(3 / zoom);
  stroke(axesColor);
}

function gridLine() {
  strokeWeight(1 / zoom);
  stroke(gridColor);
}

function shapeLine() {
  strokeWeight(4 / zoom);
  stroke(shapeColor);
}

function resetScale() {
  zoom = 1.0;
  lastOffset = { x: 0, y: 0 };
  relativePosition = { x: 0, y: 0 };
  offset = { x: 0, y: 0 };
  newPos = { x: 0, y: 0 };
  isDrawn = false;
}

function getData() {
  return JSON.stringify({
    type: 'transformations',
    values,
    scaleValues,
    zoom,
    lastOffset,
    offset,
    newPos,
  });
}

function setData(jsonData) {
  let data;
  try {
    data = JSON.parse(jsonData);
  } catch {
    console.log("Parsing error");
    alert("Incorrect file data!");
  }

  if (handle) {
    clearInterval(handle);
    handle = undefined;
  }
  animation = false;
  animationDirection = 1;
  animationProgress = 0;
  startButton.innerHTML = 'Start <i class="icon-play"></i>';

  values = data.values;
  scaleValues = data.scaleValues;

  mapValuesToInputs(values, inputs);
  scaleInputs[0].value = scaleValues[0];
  scaleInputs[1].value = scaleValues[1];
  blockInputs(false);
  
  zoom = data.zoom;
  lastOffset = data.lastOffset;
  offset = data.offset;
  newPos = data.newPos;

  isDrawn = false;
  console.log('setData called');
}

function download(text) {
  downloadFileElement.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  downloadFileElement.click();
}

function upload() {
  uploadFileElement.click();
}

// =============== Mouse control =============== //
function mouseWheel(event) {
  if (
    mouseX < 0 ||
    mouseY < 0 ||
    mouseX > CANVAS_WIDTH ||
    mouseY > CANVAS_HEIGHT
  )
    return;

  let newZoom = constrain(
    zoom - zoom * MOUSE_SENSITIVITY * event.delta,
    MIN_ZOOM,
    MAX_ZOOM
  );
  let zoomDelta = newZoom - zoom;

  newPos.x -= ((mouseX - offset.x - newPos.x) / zoom) * zoomDelta;
  newPos.y -= ((mouseY - offset.y - newPos.y) / zoom) * zoomDelta;
  zoom = newZoom;
  isDrawn = false;

  return false;
}

function mousePressed() {
  if (
    mouseX < 0 ||
    mouseY < 0 ||
    mouseX > CANVAS_WIDTH ||
    mouseY > CANVAS_HEIGHT
  )
    return;

  locked = true;
  relativePosition.x = mouseX;
  relativePosition.y = mouseY;
}

function mouseDragged() {
  if (locked) {
    offset.x = mouseX + lastOffset.x - relativePosition.x;
    offset.y = mouseY + lastOffset.y - relativePosition.y;
    isDrawn = false;
  }
}

function mouseReleased() {
  locked = false;
  lastOffset.x = offset.x;
  lastOffset.y = offset.y;
}
// ============================================= //
