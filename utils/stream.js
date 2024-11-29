const { PassThrough, Duplex } = require("stream");

class Throttle extends Duplex {
  constructor(delay) {
    super();
    this.delay = delay;
  }

  _read() {}

  _write(chunk, enc, cb) {
    this.push(chunk);
    setTimeout(cb, this.delay);
  }

  // end(chunk) {
  //   console.log("throttle end --");
  //   this.push(chunk);
  // }
}

// const throttle = new Throttle(5);
// const report = new PassThrough();

module.exports = {
  Throttle,
  PassThrough,
};
