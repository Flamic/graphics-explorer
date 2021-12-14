// Create matrix filled with 0
function createMatrix(rows, columns) {
  return new Array(rows).fill().map((_) => new Array(columns).fill(0));
}

// Multiply matrix a by b
function multiplyMatrix(a, b) {
  const aNumRows = a.length;
  const aNumCols = a[0].length;
  const bNumRows = b.length;
  const bNumCols = b[0].length;

  if (aNumCols != bNumRows)
    throw new Error(
      "Matrix mupltiplication exception: column count of first matrix must be equal to row count of second one"
    );

  const m = createMatrix(aNumRows, bNumCols);
  for (var r = 0; r < aNumRows; ++r)
    for (var c = 0; c < bNumCols; ++c)
      for (var i = 0; i < aNumCols; ++i) m[r][c] += a[r][i] * b[i][c];

  return m;
}

// Multiply matrix by scaling matrix
function scaleMatrix(matrix, xFactor, yFactor) {
  const scalingMatrix = [
    [xFactor, 0, 0],
    [0, yFactor, 0],
    [0, 0, 1],
  ];

  return multiplyMatrix(matrix, scalingMatrix);
}

// Multiply matrix by scaling matrix with progress (0-100%)
function scaleByProgressMatrix(matrix, xFactor, yFactor, progress) {
  return scaleMatrix(
    matrix,
    1 - (1 - xFactor) * progress,
    1 - (1 - yFactor) * progress
  );
}

// toFixed() with removing redundant digits
function trimFloat(num, digitsNum) {
  return parseFloat(num.toFixed(digitsNum));
}

// Get max value
function max(a, b) {
  return a > b ? a : b;
}

// Get width of text in canvas
function getTextWidth(text, font) {
  getTextWidth.canvas ||= document.createElement("canvas");
  const context = getTextWidth.canvas.getContext("2d");
  context && (context.font = font);
  const metrics = context?.measureText(text);
  return metrics?.width || 0;
}
