import 'cesiumModule/Widgets/widgets.css';
import * as Cesium from 'cesium';

import Observable from './util/Observable'
import EntityFactory from './EntityFactory'
import Interaction from './interaction/Interaction'
import Draw from './interaction/Draw'
import Select from './interaction/Select'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDIxNWEzNi1jMjVlLTQ4ZjUtYjY1MS1mNjU4ZTdkM2IyOWYiLCJpZCI6MzM1NzUsImlhdCI6MTU5ODkzNDg1MH0.LEV5sH3jYnHCLFD3e90TjkvieBBjsJf5wQ52FCTlZuk';

interface MODE_ENUM {
    [P: string]: string;
}
export default class BasicMap extends Observable {
    public static events: string[] = [
                                        'addNode', 
                                        ...Draw.events, 
                                        ...Select.events
                                    ];
    public static MODE: MODE_ENUM = {
        NONE: "none",
        DRAW: "draw",
        SELECT: "select"
    };

    private nodes: any | null = null;
    private container: HTMLElement | null = null;

    private enttFctry: EntityFactory | null = null;

    private interactions: Array<Interaction> | null = null;
    private draw: Draw | null = null;
    private select: Select | null = null;
    private currMode: string = BasicMap.MODE.NONE;

    private viewer: Cesium.Viewer | null = null;
    private screenSpaceEventHandler: Cesium.ScreenSpaceEventHandler | null = null;

    constructor(container: HTMLElement | string, initOption: any) {
        super(BasicMap.events);

        if (typeof container == typeof "string") {
            let elm = document.getElementById(container as string);
            if (elm == null) {
                console.log("ERROR! BasicMap init error : container is not exist");
                return;
            }
            container = elm;
        }
        this.container = container as HTMLElement;

        this.nodes = initOption.nodes;

        this.enttFctry = new EntityFactory();
        this.interactions = new Array<Interaction>();

        this.initMap();
        this.initMouseEventInteraction();
        this.initDraw();
        this.initSelect();
    }

    private initMap = (() => {
        if (this.container == null) return;

        this.viewer = new Cesium.Viewer(this.container, {
            terrainProvider: Cesium.createWorldTerrain(),
            animation: false,
            baseLayerPicker: true,
            vrButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            // sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: false,
            targetFrameRate: 60
        });
        this.viewer.cesiumWidget.creditContainer.setAttribute('style', 'display: none;');

        // viewer.scene.screenSpaceCameraController.enableTilt = false;
        // viewer.scene.screenSpaceCameraController.enableRotate = false;
        // viewer.scene.screenSpaceCameraController.enableZoom = false;

        this.viewer.scene.debugShowFramesPerSecond = true;

        this.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 800;

        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(127.3, 37.2, 10000000),
        });
    });

    private initMouseEventInteraction = (() => {
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('LEFT_DOWN', e), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('LEFT_UP', e), Cesium.ScreenSpaceEventType.LEFT_UP);
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('LEFT_CLICK', e), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('LEFT_DOUBLE_CLICK', e), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('RIGHT_DOWN', e), Cesium.ScreenSpaceEventType.RIGHT_DOWN);
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('RIGHT_UP', e), Cesium.ScreenSpaceEventType.RIGHT_UP);
        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('RIGHT_CLICK', e), Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        this.screenSpaceEventHandler?.setInputAction((e: any) => this.notifyForInteractions('MOUSE_MOVE', e), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    });

    private initDraw = (() => {
        if (this.viewer == null) return;

        this.draw = new Draw(this.viewer, {
            drawType: null,
            fillColorHex: "#FFFFFF",
            lineColorHex: "#FFFFFF",
        });
        this.draw.on('executeDraw', this.handleExecuteDraw);
        this.draw.on('terminateDraw', this.handleTerminateDraw);
        this.draw.on('drawStart', this.handleDrawStart);
        this.draw.on('drawEnd', this.handleDrawEnd);
    });

    private initSelect = (() => {
        if (this.viewer == null) return;

        this.select = new Select(this.viewer);
        this.addInteraction(this.select);

        this.select.on('hover', this.handleExecuteSelect);
        this.select.on('select', this.handleTerminateSelect);
        this.select.on('hover', this.handleHover);
        this.select.on('select', this.handleSelect);
    });

    private notifyForInteractions = ((type: string, event: any) => {
        this.interactions?.forEach(interaction => {
            interaction.handleEvent(type, event);
        });
    });

    public getDrawType = (() => {
        return this.draw?.getDrawType() || null;
    });

    public getDrawFillColor = (() => {
        return this.draw?.getFillColor() || null;
    });

    public getDrawLineColor = (() => {
        return this.draw?.getLineColor() || null;
    });

    public setDrawFillColor = ((ColorHex: any) => {
        this.draw?.setFillColor(ColorHex);
    });

    public setDrawLineColor = ((ColorHex: any) => {
        this.draw?.setLineColor(ColorHex);
    });

    public drawEntity = ((geometry: any, zindex: any) => {
        let entity: Cesium.Entity | null | undefined = null;
        switch (geometry.type) {
            case 'point':
            case 'circle':
                entity = this.enttFctry?.getCircle(geometry, zindex);
                break;
            case 'line':
                entity = this.enttFctry?.getLine(geometry, zindex);
                break;
            case 'rect':
            case 'poly':
                entity = this.enttFctry?.getPolygon(geometry, zindex);
                break;
        }

        if (entity != null) {
            this.viewer?.entities.add(entity);
        }
    });

    public reDrawEntity = (() => {
        this.viewer?.entities.removeAll();

        let zindex = 0;
        this.nodes.forEach((list: any) => {
            list.childNodes.forEach((entity: any) => {
                if (entity.visible) {
                    let geometry = JSON.parse(JSON.stringify(entity.geometry));
                    geometry.fillColor = entity.checked ? Cesium.Color.YELLOW.withAlpha(0.6) : entity.geometry.fillColor;
                    geometry.lineColor = entity.checked ? Cesium.Color.YELLOW.withAlpha(0.6) : entity.geometry.lineColor;
                    this.drawEntity(geometry, zindex++);
                }
            });
        });
    });

    public addEntity = ((geometry: any) => {
        const length = this.viewer?.entities.values.length;
        const node = {
            id: String(length),
            name: 'entity' + length,
            checked: false,
            visible: true,
            leaf: false,
            expended: false,
            childNodes: [],
            geometry: geometry,
        }

        const event = {
            type: 'addNode',
            node: node,
        }

        this.notify('addNode', event);
    });

    public addInteraction(interaction: Interaction) {
        if (this.interactions == null) return;

        this.interactions.push(interaction);
        interaction.execute();
    }

    public removeInteraction(interaction: Interaction) {
        if (this.interactions == null) return;

        const idx = this.interactions.findIndex((item) => {
            if (typeof (item) === typeof (interaction)) return true;
            return false;
        })
        if (idx != null && idx >= 0) {
            if (this.interactions) this.interactions[idx].terminate();
            this.interactions?.splice(idx, 1);
        }
    }

    public changeMode(mode: string, data: any = {}) {
        if (mode == null) return;
        let md = Object.keys(BasicMap.MODE).find((key: string) => BasicMap.MODE[key] == mode);
        if (md == null) return;
        let bfrMode = this.currMode;

        switch(bfrMode) {
            case BasicMap.MODE.DRAW:
                if (this.draw != null && this.draw.getDrawType() != null) {
                    this.removeInteraction(this.draw);
                    this.draw.setDrawType(null);
                }
                break;
            case BasicMap.MODE.SELECT:
                if (this.select != null) {
                    this.removeInteraction(this.select);
                }
                break;
        }

        this.currMode = mode;
        switch(this.currMode) {
            case BasicMap.MODE.DRAW:
                if (this.draw != null && this.draw.getDrawType() != null) {
                    this.removeInteraction(this.draw);
                }
                this.draw?.setDrawType(data.drawType);
        
                if (this.draw != null && this.draw.getDrawType() != null) {
                    this.addInteraction(this.draw);
                }
                break;
            case BasicMap.MODE.SELECT:
                if (this.select != null) {
                    this.addInteraction(this.select);
                }
                break;
        }
    }

    private handleExecuteDraw = ((event: any) => {
        console.log(event.type);
        this.notify('executeDraw', event);
    });

    private handleTerminateDraw = ((event: any) => {
        console.log(event.type);
        this.notify('terminateDraw', event);
    });

    private handleDrawStart = ((event: any) => {
        console.log(event.type);
        this.notify('drawStart', event);
    });

    private handleDrawEnd = ((event: any) => {
        console.log(event.type);
        this.notify('drawEnd', event);

        this.addEntity(event.data.geometry);
    });

    private handleExecuteSelect = ((event: any) => {
        console.log(event.type);
        this.notify('executeSelect', event);
    });

    private handleTerminateSelect = ((event: any) => {
        console.log(event.type);
        this.notify('terminateSelect', event);
    });

    private handleHover = ((event: any) => {
        console.log(event.type);
        this.notify('hover', event);
    });
    private handleSelect = ((event: any) => {
        console.log(event.type);
        this.notify('select', event);
    });
}
