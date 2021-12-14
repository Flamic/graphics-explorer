// ================ Definitions ================ //
const typeInput = document.getElementById("type");
const lineCountInput = document.getElementById("line-count");
const colorSchemeInput = document.getElementById("color-scheme");
const iterationsCountInput = document.getElementById("iterations-count");
const animateButton = document.getElementById("animate");
const downloadGeButton = document.getElementById("download-ge");
const downloadPngButton = document.getElementById("download-png");
const uploadButton = document.getElementById("upload-button");
const downloadFileElement = document.getElementById("download-file");
const uploadFileElement = document.getElementById("upload-file");
const zoomText = document.getElementById("scale-text");

const MAX_LINE_COUNT = 262144;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 100.0;
const MOUSE_SENSITIVITY = 0.001;

let type = typeInput.value;
let lineCount = Number.parseInt(lineCountInput.value);
let color = colorSchemeInput.value;
let iterationsCount = Number.parseInt(iterationsCountInput.value);
let handle;

let canvas;
let zoom = 1.0; // Scale factor
let locked = false; // Drag mode when true
let lastOffset = { x: 0, y: 0 }; // Last offset after mouse dragging
let relativePosition = { x: 0, y: 0 }; // First mouse position after start of dragging
let offset = { x: 0, y: 0 }; // Frame offset (after mouse dragging)
let newPos = { x: 0, y: 0 }; // New position according to scaling
let isDrawn = false; // Is fractal rendered after change
let backgroundColor = "black";
let strokeColor = "white";

let koch;
let dragon;
// ============================================= //


// ============== Event listeners ============== //
typeInput.addEventListener("change", async (e) => {
  type = e.target.value;
  lineCountInput.disabled = type === "Harter–Heighway dragon";
  resetParameters();
  generateFractal();
});
lineCountInput.addEventListener("change", async (e) => {
  lineCount = Number.parseInt(e.target.value);
  if (Math.pow(lineCount, iterationsCount) > MAX_LINE_COUNT) {
    lineCount = 100;
    lineCountInput.value = lineCount;
  } else if (lineCount < 1) {
    lineCount = 1;
    lineCountInput.value = lineCount;
  }

  generateFractal();
});
colorSchemeInput.addEventListener("change", async (e) => {
  color = e.target.value;
  updateColorScheme(color);
});
iterationsCountInput.addEventListener("change", async (e) => {
  iterationsCount = Number.parseInt(e.target.value);
  let maxValue;
  switch (type) {
    case "Koch curve":
      maxValue = 8;
      break;
    case "Harter–Heighway dragon":
      maxValue = 18;
      break;
  }

  if (Math.pow(lineCount, iterationsCount) > MAX_LINE_COUNT) {
    iterationsCount = maxValue;
    iterationsCountInput.value = iterationsCount;
  } else if (iterationsCount < 0) {
    iterationsCount = 0;
    iterationsCountInput.value = iterationsCount;
  }

  generateFractal();
});
animateButton.addEventListener("click", async (e) => {
  if (handle) {
    clearInterval(handle);
    animateButton.textContent = "Animate iterations";
    handle = undefined;
    generateFractal();
  } else {
    handle = setInterval(next, 800);
    animateButton.textContent = "Stop animation";
  }
});
downloadGeButton.addEventListener("click", async (e) => {
  download(getData());
});
downloadPngButton.addEventListener("click", async (e) => {
  saveCanvas(canvas, "fractal", "png");
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
  stroke(strokeColor);
  koch = new KochFractal();
  dragon = new DragonFractal();
  generateFractal();
  uploadFromStorage(setData);
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
  switch (type) {
    case "Koch curve":
      koch.render();
      break;
    case "Harter–Heighway dragon":
      dragon.render();
      break;
  }
}

function generateFractal() {
  switch (type) {
    case "Koch curve":
      koch.generate(lineCount, iterationsCount);
      break;
    case "Harter–Heighway dragon":
      dragon.generate(iterationsCount);
      break;
  }

  isDrawn = false;
}

function resetParameters() {
  lineCount = Number.parseInt(lineCountInput.defaultValue);
  lineCountInput.value = lineCountInput.defaultValue;
  iterationsCount = Number.parseInt(iterationsCountInput.defaultValue);
  iterationsCountInput.value = iterationsCountInput.defaultValue;

  if (handle) {
    clearInterval(handle);
    animateButton.textContent = "Animate iterations";
    handle = undefined;
    generateFractal();
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
  switch (type) {
    case "Koch curve":
      if (koch.getCount() == iterationsCount) koch.restart();
      else koch.next(lineCount);
      break;
    case "Harter–Heighway dragon":
      if (dragon.getCount() == iterationsCount) dragon.restart();
      else dragon.next();
      break;
  }
  isDrawn = false;
}

function updateColorScheme(color) {
  switch (color) {
    case "Monochromatic":
      backgroundColor = "black";
      strokeColor = "white";
      break;
    case "Inversed monochromatic":
      backgroundColor = "white";
      strokeColor = "black";
      break;
    case "Transparent background":
      backgroundColor = "rgba(255,255,255,0)";
      strokeColor = "white";
      break;
  }
  stroke(strokeColor);
  isDrawn = false;
}

function getData() {
  return JSON.stringify({
    type: 'fractal',
    fractalType: type,
    lineCount,
    color,
    iterationsCount,
    zoom,
    lastOffset,
    offset,
    newPos,
  });
}

function setObjectData(data) {
  typeInput.value = data.fractalType;
  lineCountInput.value = data.lineCount;
  colorSchemeInput.value = data.color;
  iterationsCountInput.value = data.iterationsCount;

  type = data.fractalType;
  lineCount = data.lineCount;
  color = data.color;
  iterationsCount = data.iterationsCount;
  zoom = data.zoom;
  lastOffset = data.lastOffset;
  offset = data.offset;
  newPos = data.newPos;

  lineCountInput.disabled = type === "Harter–Heighway dragon";
  updateColorScheme(color);
  generateFractal();
}

async function setData(fileData) {
  const obj = await parseJsonOrRedirect(fileData);
  if (obj) {
    switch(obj.type) {
      case 'fractal':
      case 'color-scheme':
      case 'transformations':
        setObjectData(obj);
    }
  }
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

  newPos.x -=
    (mouseX - offset.x - newPos.x) / zoom * zoomDelta;
  newPos.y -=
    (mouseY - offset.y - newPos.y) / zoom * zoomDelta;
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
