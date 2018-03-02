import { ServiceProvider, Service } from '../common/Provider';
import { GameClock } from '../game/GameClock';
import Transform from '../common/Transform';
import Emitter from '../common/Emitter';


export enum QuakeOverTime {
  ASC = 0, // Quake gradually gets stronger as it approaches time limit
  DESC = -1, // Quake starts strong, gradually settles back to position (default)
}

export enum QuakeEvents {
  DONE = 'done',
}

export default class QuakeFX extends Emitter {
  originalOffset: Transform;
  quakeOffset: Transform;
  timeStart: number;

  constructor(private target: Transform, private amount: number, private durationMs: number, private dir: QuakeOverTime = QuakeOverTime.DESC) {
    super();
    <GameClock>ServiceProvider.lookup(Service.CLOCK).addBinding(this);

    this.originalOffset = new Transform();
    this.quakeOffset = new Transform();
    this.originalOffset.position = [].concat(target.position);
  }

  update(delta: number, elapsed: number) {
    this.timeStart = this.timeStart || elapsed;
    const shakeDuration = (elapsed - this.timeStart) * 1000;

    this.quakeOffset.position[0] = Math.cos(shakeDuration) * (this.amount * (this.dir + (shakeDuration / this.durationMs)));


    this.quakeOffset.position[1] = Math.sin(shakeDuration) * (this.amount * (this.dir + (shakeDuration / this.durationMs)));

    this.target.position[0] = this.originalOffset.position[0] + this.quakeOffset.position[0];
    this.target.position[1] = this.originalOffset.position[1] + this.quakeOffset.position[1];

    if (shakeDuration >= this.durationMs) {
      <GameClock>ServiceProvider.lookup(Service.CLOCK).removeBinding(this);
      this.emit(QuakeEvents.DONE);
    }
  }
}