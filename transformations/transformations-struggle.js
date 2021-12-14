"use strict";

// ================ Definitions ================ //
//const typeInput = document.getElementById("type");
//const lineCountInput = document.getElementById("line-count");
//const colorSchemeInput = document.getElementById("color-scheme");
//const iterationsCountInput = document.getElementById("iterations-count");
//const animateButton = document.getElementById("animate");

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

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const downloadGeButton = document.getElementById("download-ge");
const downloadPngButton = document.getElementById("download-png");
const uploadButton = document.getElementById("upload-button");
const downloadFileElement = document.getElementById("download-file");
const uploadFileElement = document.getElementById("upload-file");
const zoomText = document.getElementById("scale-text");

//const MAX_LINE_COUNT = 262144;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 100.0;
const MOUSE_SENSITIVITY = 0.001;
const MIN_CELL_SIZE = 20;
const SCALE_UNITS = [
  0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
];
const POINT_NAME = ["A", "B", "C"];
//let type = typeInput.value;
//let lineCount = Number.parseInt(lineCountInput.value);
//let color = colorSchemeInput.value;
//let iterationsCount = Number.parseInt(iterationsCountInput.value);
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
/*let shape = [
  [axInput.value, ayInput.value, 1],
  [bxInput.value, byInput.value, 1],
  [cxInput.value, cyInput.value, 1]
];*/

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
      animationProgress += animationDirection * 0.002;
      isDrawn = false;
    }, 5);
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
/*
scaleInputs[0].addEventListener('input', () => {
  scaleValues[0] = scaleInputs[0].value;
  isDrawn = false;
});

scaleInputs[1].addEventListener('input', () => {
  scaleValues[1] = scaleInputs[1].value;
  isDrawn = false;
});
*/
//let koch;
//let dragon;
// ============================================= //

// ============== Event listeners ============== //
// typeInput.addEventListener("change", async (e) => {
//   type = e.target.value;
//   lineCountInput.disabled = type === "Harter–Heighway dragon";
//   resetParameters();
//   generateFractal();
// });
// lineCountInput.addEventListener("change", async (e) => {
//   lineCount = Number.parseInt(e.target.value);
//   if (Math.pow(lineCount, iterationsCount) > MAX_LINE_COUNT) {
//     lineCount = 100;
//     lineCountInput.value = lineCount;
//   } else if (lineCount < 1) {
//     lineCount = 1;
//     lineCountInput.value = lineCount;
//   }

//   generateFractal();
// });
// colorSchemeInput.addEventListener("change", async (e) => {
//   color = e.target.value;
//   updateColorScheme(color);
// });
// iterationsCountInput.addEventListener("change", async (e) => {
//   iterationsCount = Number.parseInt(e.target.value);
//   let maxValue;
//   switch (type) {
//     case "Koch curve":
//       maxValue = 8;
//       break;
//     case "Harter–Heighway dragon":
//       maxValue = 18;
//       break;
//   }

//   if (Math.pow(lineCount, iterationsCount) > MAX_LINE_COUNT) {
//     iterationsCount = maxValue;
//     iterationsCountInput.value = iterationsCount;
//   } else if (iterationsCount < 0) {
//     iterationsCount = 0;
//     iterationsCountInput.value = iterationsCount;
//   }

//   generateFractal();
// });
//animateButton.addEventListener("click", async (e) => {
//  if (handle) {
//    clearInterval(handle);
//    animateButton.textContent = "Animate iterations";
//    handle = undefined;
//    generateFractal();
//  } else {
//    handle = setInterval(next, 800);
//    animateButton.textContent = "Stop animation";
//  }
//});
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

function setup() {
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("draw-block");
  canvas.addClass("main-canvas");
  document.querySelector("canvas").addEventListener("dblclick", resetScale);
  //stroke(strokeColor);
  //koch = new KochFractal();
  //dragon = new DragonFractal();
  //generateFractal();
}

function draw() {
  if (isDrawn) return;
  clear();
  background(backgroundColor);
  strokeWeight(1.5 / zoom);
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
      CANVAS_WIDTH / 2 + 10 / zoom,
      start.y + 10 / zoom
    );
    line(
      CANVAS_WIDTH / 2,
      start.y,
      CANVAS_WIDTH / 2 - 10 / zoom,
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
      CANVAS_HEIGHT / 2 + 10 / zoom
    );
    line(
      end.x,
      CANVAS_HEIGHT / 2,
      end.x - 10 / zoom,
      CANVAS_HEIGHT / 2 - 10 / zoom
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
/*
  const points = [
    {
      x: pixels[0][0],
      y: pixels[0][1],
      v: createVector((pixels[1][0] + pixels[2][0]) / 2 - pixels[0][0], (pixels[1][1] + pixels[2][1]) / 2 - pixels[0][1])
    },
    {
      x: pixels[1][0],
      y: pixels[1][1],
      v: createVector((pixels[0][0] + pixels[2][0]) / 2 - pixels[1][0], (pixels[0][1] + pixels[2][1]) / 2 - pixels[1][1])
    },
    {
      x: pixels[2][0],
      y: pixels[2][1],
      v: createVector((pixels[0][0] + pixels[1][0]) / 2 - pixels[2][0], (pixels[0][1] + pixels[1][1]) / 2 - pixels[2][1])
    },
  ];

  push();
  textSize(18 / zoom);
  strokeWeight(1 / zoom);
  stroke('black');
  fill('black');
  for (let i = 0; i < points.length; ++i) {
    translate(points[i].x, points[i].y);
    const v = createVector(10 / zoom, 0);
    v.rotate(points[i].v.heading() + Math.PI);
    text(POINT_NAME[i], v.x - 5 / zoom, v.y + 5 / zoom);
    translate(-points[i].x, -points[i].y);
    push();
  }
*/
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

  push();
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
    push();
  }
  // const points = [
  //   { x: pixels[0][0], y: pixels[0][1] },
  //   { x: pixels[1][0], y: pixels[1][1] },
  //   { x: pixels[2][0], y: pixels[2][1] },
  // ];

  // let left = 0;
  // let right = 0;
  // let up = 0;
  // let down = 0;

  // for (let i = 1; i < points.length; ++i) {
  //   if (points[left].x > points[i].x) left = i;
  //   if (points[right].x < points[i].x) right = i;
  //   if (points[up].y > points[i].y) up = i;
  //   if (points[down].y < points[i].y) down = i;
  // }
  
  // textSize(18 / zoom);
  // strokeWeight(1 / zoom);
  // stroke('black');
  // fill('black');
  // for (let i = 0; i < points.length; ++i) {
  //   text(
  //     POINT_NAME[i],
  //     points[i].x + (i === left ? -15 : i === right ? 5 : -5) / zoom,
  //     points[i].y + (i === up ? -5 : i === down ? 15 : 5) / zoom
  //   );
  // }
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

// function generateFractal() {
//   switch (type) {
//     case "Koch curve":
//       koch.generate(lineCount, iterationsCount);
//       break;
//     case "Harter–Heighway dragon":
//       dragon.generate(iterationsCount);
//       break;
//   }

//   isDrawn = false;
// }

function resetParameters() {
  // lineCount = Number.parseInt(lineCountInput.defaultValue);
  // lineCountInput.value = lineCountInput.defaultValue;
  // iterationsCount = Number.parseInt(iterationsCountInput.defaultValue);
  // iterationsCountInput.value = iterationsCountInput.defaultValue;

  if (handle) {
    clearInterval(handle);
    //animateButton.textContent = "Animate iterations";
    handle = undefined;
    //generateFractal();
  }
}

function resetScale() {
  zoom = 1.0;
  lastOffset = { x: 0, y: 0 };
  relativePosition = { x: 0, y: 0 };
  offset = { x: 0, y: 0 };
  newPos = { x: 0, y: 0 };
  isDrawn = false;
}

function next() {
  // switch (type) {
  //   case "Koch curve":
  //     if (koch.getCount() == iterationsCount) koch.restart();
  //     else koch.next(lineCount);
  //     break;
  //   case "Harter–Heighway dragon":
  //     if (dragon.getCount() == iterationsCount) dragon.restart();
  //     else dragon.next();
  //     break;
  // }
  isDrawn = false;
}

function getData() {
  return JSON.stringify({
    // type,
    // lineCount,
    // color,
    // iterationsCount,
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

  // typeInput.value = data.type;
  // lineCountInput.value = data.lineCount;
  // colorSchemeInput.value = data.color;
  // iterationsCountInput.value = data.iterationsCount;

  // type = data.type;
  // lineCount = data.lineCount;
  // color = data.color;
  // iterationsCount = data.iterationsCount;
  zoom = data.zoom;
  lastOffset = data.lastOffset;
  offset = data.offset;
  newPos = data.newPos;

  // lineCountInput.disabled = type === "Harter–Heighway dragon";
  // updateColorScheme(color);
  // generateFractal();
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
