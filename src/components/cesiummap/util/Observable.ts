
export default class Observable extends Object {
    private observers: any;
    protected events: string[] = ['change', 'input', 'click'];

    constructor(events: string[]) {
        super();
        this.observers = {};

        if (events != null) this.events = events;

        this.events.forEach(item => {
            this.observers[item] = [];
        })
    }

    on(eventType: string, observer: Function) {
        if (this.events.includes(eventType)) {
            this.observers[eventType].push(observer);
            return true;
        } else {
            return false;
        }
    }

    un(eventType: string, observer: Function) {
        if (this.events.includes(eventType)) {
            const idx = this.observers[eventType].indexOf(observer);
            this.observers[eventType].splice(idx, 1);
            return true;
        } else {
            return false;
        }
    }

    notify(eventType: string, event: any) {
        if (this.events.includes(eventType)) {
            for (let i = 0; i < this.observers[eventType].length; i++) {
                this.observers[eventType][i](event);
            }
            return true;
        } else {
            return false;
        }
    }
}
