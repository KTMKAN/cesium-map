import * as Cesium from 'cesium';

import Interaction from './Interaction'

export default class Select extends Interaction {
    public static events: string[] = ['executeSelect', 'terminateSelect', 'hover', 'select'];

    private viewer: Cesium.Viewer | null = null;
    private nameOverlay: HTMLElement | null = null;

    private pickedEntity: Cesium.Entity | null = null;

    constructor(viewer: Cesium.Viewer) {
        super(Select.events);

        this.viewer = viewer;

        this.nameOverlay = document.createElement("div");
        viewer.container.appendChild(this.nameOverlay);
        this.nameOverlay.className = "backdrop";
        this.nameOverlay.style.display = "none";
        this.nameOverlay.style.position = "absolute";
        this.nameOverlay.style.bottom = "0";
        this.nameOverlay.style.left = "0";
        // this.nameOverlay.style["pointer-events"] = "none";
        this.nameOverlay.style.padding = "4px";
        this.nameOverlay.style.backgroundColor = "black";

        this.execute();
    }

    public execute = (() => {
        // this.handleMouseMove = this.handleMouseMoveForHover;
        this.handleLeftClick = this.handleLeftClickForSelect;

        const event = {
            type: 'executeSelect'
        };
        this.notify('executeSelect', event);
    });

    public terminate = (() => {
        this.handleMouseMove = null;
        this.handleLeftClick = null;

        const event = {
            type: 'terminateSelect'
        };
        this.notify('terminateSelect', event);
    });

    private handleMouseMoveForHover = ((event: any) => {
        if (this.viewer == null) return;

        const pickedEntity = this.viewer.scene.pick(event.endPosition);
        if (!Cesium.defined(pickedEntity)) {
            if (this.nameOverlay) this.nameOverlay.style.display = "none";
            return;
        }
        let selectedEntity = pickedEntity.id.entityCollection.values[0];
        console.log(pickedEntity.id.properties.geometryType._value);
    });

    private handleLeftClickForSelect = ((event: any) => {
        if (this.viewer == null) return;
        let pick = this.viewer.scene.pick(event.position);

        this.pickedEntity = null;
        if (pick != null) {
            this.pickedEntity = this.viewer.scene.pick(event.position).id;
        }
        
        if (!Cesium.defined(this.pickedEntity)) {
            if (this.nameOverlay) this.nameOverlay.style.display = "none";
            return;
        }
        if (this.pickedEntity == null || this.pickedEntity.properties == null) return;

        event = {
            type: "select",
            value: {
                pickedEntity: this.pickedEntity,
            },
        }

        this.notify("select", event);
    });
}