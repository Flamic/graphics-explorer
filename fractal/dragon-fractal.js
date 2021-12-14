class DragonFractal {
  constructor() {
    this.start = createVector(width / 2, height / 2);
    this.end = createVector(width / 2, height / 2.1);
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

  generate(iterations = 1) {
    this.restart();
    for (let i = 0; i < iterations; ++i) this.next();
  }

  next() {
    let last = this.lines[this.lines.length - 1].end;
    let lastCount = this.lines.length;

    for (let i = lastCount - 1; i >= 0; --i) {
      let x;
      let start = this.lines[i].start.copy();
      let end = this.lines[i].end.copy();

      start.sub(last);
      end.sub(last);

      x = start.x;
      start.x = start.y;
      start.y = -x;
      x = end.x;
      end.x = end.y;
      end.y = -x;

      start.add(last);
      end.add(last);

      this.lines.push({ start: end, end: start });
    }

    this.count++;
  }
}
