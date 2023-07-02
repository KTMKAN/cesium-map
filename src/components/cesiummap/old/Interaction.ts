import Observable from "../util/Observable";

export default class Interaction extends Observable {
    constructor(events: string[] = []) {
        super(events);
    }

    public handleEvent(type: string, event: any) {
        switch (type) {
            case "LEFT_UP":
                if (this.handleLeftUp != null) this.handleLeftUp(event);
                break;
            case "LEFT_DOWN":
                if (this.handleLeftDown != null) this.handleLeftDown(event);
                break;
            case "LEFT_CLICK":
                if (this.handleLeftClick != null) this.handleLeftClick(event);
                break;
            case "LEFT_DOUBLE_CLICK":
                if (this.handleLeftDoubleClick != null) this.handleLeftDoubleClick(event);
                break;

            case "RIGHT_UP":
                if (this.handleRightUp != null) this.handleRightUp(event);
                break;
            case "RIGHT_DOWN":
                if (this.handleRightDown != null) this.handleRightDown(event);
                break;
            case "RIGHT_CLICK":
                if (this.handleRightClick != null) this.handleRightClick(event);
                break;
            case "MOUSE_MOVE":
                if (this.handleMouseMove != null) this.handleMouseMove(event);
                break;
        }
    }

    public handleLeftUp: Function | null = null;
    public handleLeftDown: Function | null = null;
    public handleLeftClick: Function | null = null;
    public handleLeftDoubleClick: Function | null = null;
    public handleRightUp: Function | null = null;
    public handleRightDown: Function | null = null;
    public handleRightClick: Function | null = null;
    public handleMouseMove: Function | null = null;

    public stop: Function = () => { };
}