const typeInput = document.getElementById('type');
const lineCountInput = document.getElementById('line-count');
const colorSchemeInput = document.getElementById('color-scheme');
const iterationsCountInput = document.getElementById('iterations-count');

let type = typeInput.value;
let lineCount = lineCountInput.value;
let color = colorSchemeInput.value;
let iterationsCount = iterationsCountInput.value;
/*
const map = (obj, func, args) => {
    const copy = {...obj}
    copy[func]?.apply(null, args);
    return obj;
}
*/
typeInput.addEventListener('change', (e) => {
    type = e.target.value;
    draw();
});
lineCountInput.addEventListener('change', (e) => {
    lineCount = e.target.value;
    draw();
});
colorSchemeInput.addEventListener('change', (e) => {
    color = e.target.value;
    draw();
});
iterationsCountInput.addEventListener('change', (e) => {
    iterationsCount = e.target.value;
    draw();
});

let koch;
let dragon;

function setup() {
    //noLoop();
    createCanvas(800, 800).parent('draw-block');
    frameRate(1.2);
    stroke(255);
    koch = new KochFractal();
}

function draw() {
    background(0);
    koch.render();
    // Iterate
    koch.next();
    // Let's not do it more than 5 times. . .
    if (koch.getCount() > 5) {
        koch.restart();
    }
}

function update() {
    if (typeInput.value === "Koch curve")
        koch.render();
}

// A class to describe one line segment in the fractal
// Includes methods to calculate midp5.Vectors along the line according to the Koch algorithm

class KochLine {
    constructor(a, b) {
        // Two p5.Vectors,
        // start is the "left" p5.Vector and
        // end is the "right p5.Vector
        this.start = a.copy();
        this.end = b.copy();
    }

    display() {

        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    kochA() {
        return this.start.copy();
    }

    // This is easy, just 1/3 of the way
    kochB() {
        let v = p5.Vector.sub(this.end, this.start);
        v.div(3);
        v.add(this.start);
        return v;
    }

    // More complicated, have to use a little trig to figure out where this p5.Vector is!
    kochC() {
        let a = this.start.copy(); // Start at the beginning
        let v = p5.Vector.sub(this.end, this.start);
        v.div(3);
        a.add(v);  // Move to point B
        v.rotate(-PI / 3); // Rotate 60 degrees
        a.add(v);  // Move to point C
        return a;
    }

    // Easy, just 2/3 of the way
    kochD() {
        let v = p5.Vector.sub(this.end, this.start);
        v.mult(2 / 3.0);
        v.add(this.start);
        return v;
    }

    kochE() {
        return this.end.copy();
    }
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
        this.lines.forEach(lineElement => {
            line(lineElement.start.x, lineElement.start.y, lineElement.end.x, lineElement.end.y);
        });
    }

    next(lineCount = 2) {
        let newLines = [];

        this.lines.forEach(line => {
            let vStart, vEnd, v;

            vStart = p5.Vector.sub(line.end, line.start);
            vStart.div(3);
            v = vStart.copy();
            v.rotate(PI);
            vEnd = vStart.copy();
            vEnd.mult(2);
            vStart.add(line.start);
            vEnd.add(line.start);
            v.add(line.start);
            newLines.push({ start: line.start, end: vStart }, { start: vEnd, end: line.end });

            for (let i = 0; i < lineCount; ++i) {
                const start = vStart.copy();
                v.rotate(2 * PI / (lineCount + 1));
                vStart.add(v);
                newLines.push({ start, end: vStart });
            }
        });

        this.lines = newLines;
        this.count++;
    }
}


/*
function setup() {
  createCanvas(400, 400);
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
  v.add(start);
  newLines.push({ start: start, end: vStart }, { start: vEnd, end: end });

  for (let i = 0; i < lineCount; ++i) {
      const newStart = vStart.copy();
      v.rotate(2 * PI / (lineCount + 1));
      vStart.add(v);
      newLines.push({ start: newStart, end: vStart });
  }
  
  this.lines.forEach(lineElement => {
            line(lineElement.start.x, lineElement.start.y, lineElement.end.x, lineElement.end.y);
        });
}
*/