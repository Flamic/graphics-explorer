const originalCanvas = document.getElementById("original-canvas");
const processedCanvas = document.getElementById("processed-canvas");
const uploadImageButton = document.getElementById("upload-image");
const downloadGeButton = document.getElementById("download-ge");
const downloadPngButton = document.getElementById("download-png");
const uploadButton = document.getElementById("upload-button");
const downloadFileElement = document.getElementById("download-file");
const uploadFileElement = document.getElementById("upload-file");
const uploadImageElement = document.getElementById("upload-image-file");
const hueDeltaRange = document.getElementById("hue-delta");
const hueDeltaValue = document.getElementById("hue-delta-value");
const redLightnessRange = document.getElementById("red-lightness");
const redLightnessValue = document.getElementById("red-lightness-value");
const rgbPicker = document.getElementById("rgb-picker");
const hslPicker = document.getElementById("hsl-picker");

const MAX_CANVAS_WIDTH = 650;
const MAX_CANVAS_HEIGHT = 650;
const DEFAULT_CANVAS_WIDTH = 520;
const DEFAULT_CANVAS_HEIGHT = 340;
const SMOOTH_DELTA = 50;

let hueDelta = 30;
let redLightness = 0;
let originalImageData = [];
let originalHslImageData = [];
let processedImageData;

originalCanvas.addEventListener("mousemove", async (e) => {
  const rgbPixel = getPixel(originalCanvas, originalImageData, e);
  const hslPixel = rgbToHsl(rgbPixel);
  if (rgbPixel.r === undefined) {
    rgbPicker.innerText = "<hover over the picture>";
    hslPicker.innerText = "<hover over the picture>";
    return;
  }
  rgbPicker.innerText = `${rgbPixel.r}, ${rgbPixel.g}, ${rgbPixel.b}`;
  hslPicker.innerText = `${Math.round(hslPixel.h ?? 0)}°, ${Math.round(hslPixel.s * 100)}%, ${Math.round(hslPixel.l * 100)}%`;
});
processedCanvas.addEventListener("mousemove", async (e) => {
  let rgbPixel = getPixel(processedCanvas, processedImageData.data, e);
  let hslPixel = rgbToHsl(rgbPixel);
  if (rgbPixel.r === undefined) {
    rgbPicker.innerText = "<hover over the picture>";
    hslPicker.innerText = "<hover over the picture>";
    return;
  }
  rgbPicker.innerText = `${rgbPixel.r}, ${rgbPixel.g}, ${rgbPixel.b}`;
  hslPicker.innerText = `${Math.round(hslPixel.h ?? 0)}°, ${Math.round(hslPixel.s * 100)}%, ${Math.round(hslPixel.l * 100)}%`;
});
uploadImageButton.addEventListener("click", async (e) => {
  uploadImageElement.click();
});
downloadGeButton.addEventListener("click", async (e) => {
  saveAs(getData(), "color-scheme.ge");
});
downloadPngButton.addEventListener("click", async (e) => {
  processedCanvas.toBlob((blob) => saveAs(blob, "picture.png"));
});
uploadButton.addEventListener("click", async (e) => {
  uploadFileElement.click();
});
uploadFileElement.addEventListener("change", async (e) => {
  let fr = new FileReader();
  fr.onload = () => {
    setData(fr.result);
    uploadFileElement.value = null;
  };
  fr.readAsText(uploadFileElement.files[0]);
});
uploadImageElement.addEventListener("change", async (e) => {
  let fr = new FileReader();
  fr.onload = () => {
    uploadImage(fr.result);
    uploadImageElement.value = null;
  };
  fr.readAsDataURL(uploadImageElement.files[0]);
});
hueDeltaRange.addEventListener("input", async (e) => {
  hueDelta = Number.parseFloat(hueDeltaRange.value);
  hueDeltaValue.innerText = hueDelta + "°";
});
hueDeltaRange.addEventListener("change", async (e) => {
  render();
});
redLightnessRange.addEventListener("input", async (e) => {
  redLightness = Number.parseFloat(redLightnessRange.value);
  redLightnessValue.innerText = redLightness + "%";
});
redLightnessRange.addEventListener("change", async (e) => {
  render();
});

async function setup() {
  uploadImage();
  await uploadFromStorage(setData);
}

function getData() {
  return stringToBlob(
    JSON.stringify({
      type: "color-scheme",
      hueDelta,
      redLightness,
      image: originalCanvas.toDataURL(),
    })
  );
}

function setObjectData(data) {
  hueDelta = data.hueDelta;
  redLightness = data.redLightness;

  hueDeltaRange.value = hueDelta;
  hueDeltaValue.innerText = hueDelta + "°";
  redLightnessRange.value = redLightness;
  redLightnessValue.innerText = redLightness + "%";
  
  uploadImage(data.image);
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

function uploadImage(url) {
  const img = new Image();
  let ctx = originalCanvas.getContext("2d");
  let ctx2 = processedCanvas.getContext("2d");

  img.onload = () => {
    if (url) {
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;
    } else {
      originalCanvas.width = DEFAULT_CANVAS_WIDTH;
      originalCanvas.height = DEFAULT_CANVAS_HEIGHT;
      ctx.fillStyle = "#E2E2E2";
      ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
    }
    ctx.drawImage(
      img,
      originalCanvas.width / 2 - img.width / 2,
      originalCanvas.height / 2 - img.height / 2
    );
    let width = originalCanvas.width;
    let height = originalCanvas.height;
    const maxWidth = Number.parseFloat(
      getComputedStyle(originalCanvas.parentElement).width
    );
    const maxHeight = Number.parseFloat(
      getComputedStyle(originalCanvas.parentElement).height
    );
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
    originalCanvas.style.width = width + "px";
    originalCanvas.style.height = height + "px";
    processedCanvas.width = originalCanvas.width;
    processedCanvas.height = originalCanvas.height;
    processedCanvas.style.width = originalCanvas.style.width;
    processedCanvas.style.height = originalCanvas.style.height;
    ctx = originalCanvas.getContext("2d");
    ctx2 = processedCanvas.getContext("2d");
    originalImageData = ctx
      .getImageData(0, 0, originalCanvas.width, originalCanvas.height)
      .data;
    processedImageData = new ImageData(
      originalImageData,
      originalCanvas.width,
      originalCanvas.height
    );
    originalHslImageData = imageDataToHslArray(originalImageData.slice());
    render();
  };
  img.src = url ?? "../assets/images/big-image-icon.svg";
}

function stringToBlob(string) {
  return new Blob([string], { type: "text/plain;charset=utf-8" });
}

function render() {
  let tmp;
  processedImageData = new ImageData(
    originalImageData.slice(),
    originalCanvas.width,
    originalCanvas.height
  );

  originalHslImageData.forEach((p, i) => {
    if (hueDelta === 180 || p.h <= hueDelta || 360 - p.h <= hueDelta) {
      tmp = addLightness(p, redLightness / 100);
    } else if (p.h <= hueDelta + SMOOTH_DELTA) {
      tmp = addLightness(
        p,
        ((redLightness / 100) * (hueDelta + SMOOTH_DELTA - p.h)) / SMOOTH_DELTA
      );
    } else if (360 - p.h <= hueDelta + SMOOTH_DELTA) {
      tmp = addLightness(
        p,
        ((redLightness / 100) * (hueDelta + SMOOTH_DELTA + p.h - 360)) /
          SMOOTH_DELTA
      );
    } else return;
    tmp = hslToRgb(tmp);
    processedImageData.data[4 * i] = tmp.r;
    processedImageData.data[4 * i + 1] = tmp.g;
    processedImageData.data[4 * i + 2] = tmp.b;
  });

  processedCanvas.getContext("2d").putImageData(processedImageData, 0, 0);
}

function getPixel(canvas, imageData, e) {
  const cRect = canvas.getBoundingClientRect();
  const pos = {
    x: Math.round((e.clientX - cRect.left) * canvas.width / cRect.width),
    y: Math.round((e.clientY - cRect.top) * canvas.height / cRect.height),
  };
  
  const i = (pos.y * canvas.width + pos.x) * 4;
  return { r: imageData[i], g: imageData[i + 1], b: imageData[i + 2] };
}

setup();
