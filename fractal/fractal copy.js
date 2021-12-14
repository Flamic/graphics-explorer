const typeInput = document.getElementById('type');
const lineCountInput = document.getElementById('line-count');
const colorSchemeInput = document.getElementById('color-scheme');
const iterationsCountInput = document.getElementById('iterations-count');

let type;
let lineCount;
let color;
let iterationsCount;

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
    koch = new KochFractal();
}

function draw() {
    background(0);
    // Draws the snowflake!
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
        stroke(255);
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

// A class to manage the list of line segments in the snowflake pattern

class KochFractal {
    constructor() {
        this.start = createVector(0, height / 1.5);
        this.end = createVector(width, height / 1.5);
        this.restart();
    }

    next() {
        this.lines = this.iterate(this.lines);
        this.count++;
    }

    restart() {
        this.count = 0;
        this.lines = [new KochLine(this.start, this.end)];
    }

    getCount() {
        return this.count;
    }

    render() {
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].display();
        }
    }

    iterate(before) {
        let now = [];
        
        this.lines.forEach(line => {
            let a
        });
        for (let i = 0; i < this.lines.length; i++) {
            let l = this.lines[i];
            
            let a = l.kochA();
            let b = l.kochB();
            let c = l.kochC();
            let d = l.kochD();
            let e = l.kochE();
            
            now.push(new KochLine(a, b));
            now.push(new KochLine(b, c));
            now.push(new KochLine(c, d));
            now.push(new KochLine(d, e));
        }
        return now;
    }
}