export default class Emitter {
    private bindings: { [eventName: string]: Function[] } = {};

    public on(eventName: string, fn: Function): void {
        this.bindings[eventName] = [
            ...(this.bindings[eventName] || []),
            fn,
        ];
    }


    protected emit(eventName: string, ...data: any[]): void {
        const acts: Function[] = this.bindings[eventName] || [];
        for (let i = acts.length - 1; i >= 0; i -= 1) {
            acts[i](...data);
        }
    }
}