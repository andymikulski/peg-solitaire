export default class Emitter {
    private bindings: { [eventName: string]: Function[] } = {};
    private onceBindings: { [eventName: string]: Function[] } = {};

    public on(eventName: string, fn: Function): void {
        this.bindings[eventName] = [
            ...(this.bindings[eventName] || []),
            fn,
        ];
    }

    public once(eventName: string, fn: Function): void {
        this.onceBindings[eventName] = [
            ...(this.onceBindings[eventName] || []),
            fn,
        ];
    }

    protected emit(eventName: string, ...data: any[]): void {
        let acts: Function[] = this.bindings[eventName] || [];
        for (let i = acts.length - 1; i >= 0; i -= 1) {
            acts[i](...data);
        }

        acts = this.onceBindings[eventName] || [];
        for (let i = acts.length - 1; i >= 0; i -= 1) {
            acts[i](...data);
        }
        delete this.onceBindings[eventName];
    }
}