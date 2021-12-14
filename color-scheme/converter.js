// Convert from RGB to HSL model
function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  let h, s, l;

  l = sum / 2;

  if (diff === 0) {
    s = 0;
    return { h, s, l };
  }

  switch (max) {
    case r:
      h = ((g - b) / diff) * 60 + (g >= b ? 0 : 360);
      break;
    case g:
      h = ((b - r) / diff) * 60 + 120;
      break;
    case b:
      h = ((r - g) / diff) * 60 + 240;
      break;
  }

  s = diff / (sum < 1 ? sum : 2 - sum);

  return { h, s, l };
}

// Convert from HSL to RGB model
function hslToRgb({ h, s, l }) {
  const ht = (h ?? 0) / 60;
  const c = s * (1 - Math.abs(2 * l - 1));
  const x = c * (1 - Math.abs((ht % 2) - 1));
  const m = l - c / 2;
  let r, g, b;

  if (h === undefined) r = g = b = 0;
  else {
    switch (Math.floor(ht)) {
      case 0:
        [r, g, b] = [c, x, 0];
        break;
      case 1:
        [r, g, b] = [x, c, 0];
        break;
      case 2:
        [r, g, b] = [0, c, x];
        break;
      case 3:
        [r, g, b] = [0, x, c];
        break;
      case 4:
        [r, g, b] = [x, 0, c];
        break;
      case 5:
        [r, g, b] = [c, 0, x];
        break;
    }
  }

  [r, g, b] = [r, g, b].map(e => 255 * (e + m));
  
  return { r, g, b };
}

// Get array of image pixels in HSL model
function imageDataToHslArray(data) {
  const arr = [];
  
  for (let i = 0; i < data.length; i += 4) {
    arr.push(rgbToHsl({ r: data[i], g: data[i + 1], b: data[i + 2] }));
  }

  return arr;
}

// Add lightness to pixel in HSL model
function addLightness({ h, s, l }, delta) {
  return delta ? { h, s, l: constrain(l + delta, 0, 1) } : { h, s, l };
}

// Constrain value with min and max values
function constrain(value, min, max) {
  return value > max ? max : (value < min ? min : value);
}
