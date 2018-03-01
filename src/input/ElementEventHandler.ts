export enum MOUSE_EVENT {
  CLICK = 'click',
  R_CLICK = 'contextmenu',
  MOVE = 'mousemove',
  DOWN = 'mousedown',
  UP = 'mouseup',
  ENTER = 'mouseenter',
  LEAVE = 'mouseleave'
}

export enum TOUCH_EVENT {
  START = 'touchstart',
  END = 'touchend',
}

export enum KEY_EVENT {
  DOWN = 'keydown',
  UP = 'keyup',
}

export default class ElementEventHandler {
  hasFlags: boolean = false;
  flaggedEvents: { [event: string]: Event } = {};
  internalEvents: { [event: string]: Function } = {};
  bindings: { [event: string]: Function[] } = {};

  constructor(private target: { addEventListener: any }) {
    this.tick();
  }

  private tick() {
    if (!this.hasFlags) {
      requestAnimationFrame(this.tick.bind(this));
      return;
    }
    this.hasFlags = false;

    let evtData;
    let group;
    let i;
    for (const event in this.flaggedEvents) {
      group = (this.bindings[event] || []);
      evtData = this.flaggedEvents[event];

      i = group.length - 1;
      while (i >= 0) {
        group[i](evtData);
        i -= 1;
      }

      delete this.flaggedEvents[event];
    }

    requestAnimationFrame(this.tick.bind(this));
  }

  public on(event: MOUSE_EVENT | KEY_EVENT | TOUCH_EVENT, cb: Function) {
    this.bindings[event] = this.bindings[event] || [];
    this.bindings[event].push(cb);
    this.registerEvent(event);
  }

  private registerEvent(type: string) {
    if (this.internalEvents[type]) {
      return;
    }
    const newHandler = this.createEventHandler(type);
    this.target.addEventListener(type, newHandler, false);
    this.internalEvents[type] = newHandler;
  }

  private createEventHandler(type: string) {
    return (evt: Event) => {
      evt.preventDefault();
      this.flaggedEvents[type] = evt;
      this.hasFlags = true;
    };
  }
}