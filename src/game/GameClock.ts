interface ILoopable {
  update(delta: number, elapsed: number): void;
}

export class GameClock {
  bindings: ILoopable[] = [];
  startTime: number;
  lastTime: number;

  start() {
    this.startTime = Date.now();
    this.lastTime = Date.now();

    this.tick();
  }

  addBinding(entity: ILoopable) {
    if (!this.bindings.find(x => x === entity)) {
      console.log('addddd');
      this.bindings.push(entity);
    } else {
      console.log('arasdf', entity, this.bindings);
    }
  }

  removeBinding(entity: ILoopable) {
    this.bindings = this.bindings.filter(x => x !== entity);
  }

  tick() {
    const delta = (Date.now() - this.lastTime) / 1000;
    const elapsed = (Date.now() - this.startTime) / 1000;

    this.bindings = this.bindings.filter(x => x);

    let i = this.bindings.length - 1;
    while (i >= 0) {
      this.bindings[i].update.call(this.bindings[i], delta, elapsed);
      i -= 1;
    }
    requestAnimationFrame(this.tick.bind(this));
  }
}