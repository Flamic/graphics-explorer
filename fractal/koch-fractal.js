class KochFractal {
    constructor() {
      this.start = createVector(0, height / 1.5);
      this.end = createVector(width, height / 1.5);
      this.restart();
    }
  
    restart() {
      this.count = 0;
      this.lines = [{ start: this.start.copy(), end: this.end.copy() }];
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
  