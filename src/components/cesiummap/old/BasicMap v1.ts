import 'cesiumModule/Widgets/widgets.css';
import * as Cesium from 'cesium';

import Observable from "../util/Observable";
import EntityFactory from "./EntityFactory v1"

export default class BasicMap extends Observable {
    private nodes: any;
    private target: string;

    private enttFctry: EntityFactory | null = null;

    private viewer: Cesium.Viewer | null = null;
    private screenSpaceEventHandler: Cesium.ScreenSpaceEventHandler | null = null;
    private points: any = [];
    private beforeEntity: any = null;
    private beforePoint: Cesium.Entity | null | undefined = null;
    private drawType: string | null = null;

    constructor(initOption: any) {
        super(["addNode"]);

        this.nodes = initOption.nodes;
        this.target = initOption.target;

        this.enttFctry = new EntityFactory();

        this.initMap();
        this.initDraw();
    }

    private initMap = (() => {
        this.viewer = new Cesium.Viewer(this.target, {
            terrainProvider: Cesium.createWorldTerrain(),
            animation: false,
            baseLayerPicker: true,
            vrButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: false,
            targetFrameRate: 40,
        });
        this.viewer.cesiumWidget.creditContainer.setAttribute("style", "display: none;");

        // viewer.scene.screenSpaceCameraController.enableTilt = false;    
        // viewer.scene.screenSpaceCameraController.enableRotate = false;
        // viewer.scene.screenSpaceCameraController.enableZoom = false;

        this.viewer.scene.debugShowFramesPerSecond = true;


        this.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 600;

        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(127.3, 37.2, 10000000),
        });
    });

    private initDraw = (() => {
        this.points = [];

        if (this.beforeEntity != null)
            this.viewer?.entities.remove(this.beforeEntity);
        this.beforeEntity = null;

        if (this.beforePoint != null)
            this.viewer?.entities.remove(this.beforePoint);
        this.beforePoint = null;

        this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    })

    public getDrawType = () => {
        return this.drawType;
    }

    public drawEntity = ((type: string, points: any, color: any, zindex: any) => {
        let entity: Cesium.Entity | null | undefined = null
        switch (type) {
            case "point":
            case "circle":
                entity = this.enttFctry?.getCircle(points, color, Cesium.Color.BLACK, zindex);
                break;
            case "line":
                entity = this.enttFctry?.getLine(points, color, zindex);
                break;
            case "rect":
            case "poly":
                entity = this.enttFctry?.getPolygon(points, color, Cesium.Color.BLACK, zindex);
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
            if (list.visible) {
                list.childNodes.forEach((entity: any) => {
                    if (entity.visible) {
                        let color = entity.checked ? Cesium.Color.BLUE : Cesium.Color.YELLOW
                        this.drawEntity(entity.geometry.type, entity.geometry.points, color, zindex++);
                    }
                });
            }
        });
    });

    public addEntity = ((type: string, points: any) => {
        let length = this.viewer?.entities.values.length;
        let node = {
            id: String(length),
            name: "entity" + length,
            checked: true,
            visible: true,
            leaf: false,
            expended: false,
            childNodes: [],
            geometry: {
                type: type,
                points: points,
            }
        }
        this.nodes[0].childNodes.push(node);

        this.reDrawEntity();

        let event = {
            type: "addNode",
            node: node,
        }

        this.notify("addNode", event);
    });

    public startDraw = (drawType: string | null) => {
        if (this.drawType != null) {
            this.initDraw();
        }

        if (this.drawType == drawType) {
            this.drawType = null;
            return;
        }
        this.drawType = drawType;

        switch (this.drawType) {
            case "point":
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawPoint, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;
            case "line":
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawLine, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;
            case "circle":
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawCircle, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;
            case "rect":
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawRect, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;
            case "poly":
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawPoly, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;
        }
    }

    private handleClickForDrawPoint = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
        if (clickPosition == undefined) return;

        let width = this.viewer?.camera.position.z;
        if (width == undefined) return;
        width = (width / 300);

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude),
            width: width,
        }
        this.addEntity("point", [startDegree]);
    });

    private handleClickForDrawLine = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
        if (clickPosition == undefined) return;

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        this.screenSpaceEventHandler?.setInputAction((movement: any) => {
            let mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
            let moveDegree = {
                lon: Cesium.Math.toDegrees(moveCarto.longitude),
                lat: Cesium.Math.toDegrees(moveCarto.latitude)
            }

            if (this.beforePoint != null)
                this.viewer?.entities.remove(this.beforePoint);
            if (this.beforeEntity != null)
                this.viewer?.entities.remove(this.beforeEntity);

            let tmpPoints = [
                { lon: startDegree.lon, lat: startDegree.lat },
                { lon: moveDegree.lon, lat: moveDegree.lat },
            ]

            this.beforePoint = this.enttFctry?.getPoint(tmpPoints[1], Cesium.Color.LIGHTBLUE);
            this.beforeEntity = this.enttFctry?.getLine(tmpPoints, Cesium.Color.WHITE);
            this.viewer?.entities.add(this.beforePoint as Cesium.Entity);
            this.viewer?.entities.add(this.beforeEntity);

            this.screenSpaceEventHandler?.setInputAction((click: any) => {
                if (this.beforeEntity != null) this.viewer?.entities.remove(this.beforeEntity);
                if (this.beforePoint != null) this.viewer?.entities.remove(this.beforePoint);
                this.addEntity("line", tmpPoints);

                this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawLine, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    });

    private handleClickForDrawCircle = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude),
            width: 0,
        }

        this.screenSpaceEventHandler?.setInputAction((movement: any) => {
            let mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            if (this.beforeEntity != null)
                this.viewer?.entities.remove(this.beforeEntity);

            let width = Cesium.Cartesian3.distance(clickPosition, mousePosition);
            startDegree.width = width;

            this.beforeEntity = this.enttFctry?.getCircle([startDegree], Cesium.Color.WHITE, Cesium.Color.WHITE);

            this.viewer?.entities.add(this.beforeEntity);
            this.screenSpaceEventHandler?.setInputAction((click: any) => {
                let endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                if (endPosition == undefined) return;

                if (this.beforeEntity != null)
                    this.viewer?.entities.remove(this.beforeEntity);
                this.addEntity("circle", [startDegree]);

                this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawCircle, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    });

    private handleClickForDrawRect = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        this.screenSpaceEventHandler?.setInputAction((movement: any) => {
            let mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
            let moveDegree = {
                lon: Cesium.Math.toDegrees(moveCarto.longitude),
                lat: Cesium.Math.toDegrees(moveCarto.latitude)
            }

            if (this.beforeEntity != null)
                this.viewer?.entities.remove(this.beforeEntity);
            let tmpPoints = [
                { lon: startDegree.lon, lat: startDegree.lat },
                { lon: startDegree.lon, lat: moveDegree.lat },
                { lon: moveDegree.lon, lat: moveDegree.lat },
                { lon: moveDegree.lon, lat: startDegree.lat },
            ]

            this.beforeEntity = this.enttFctry?.getPolygon(tmpPoints, Cesium.Color.WHITE, Cesium.Color.WHITE);

            this.viewer?.entities.add(this.beforeEntity);

            this.screenSpaceEventHandler?.setInputAction((click: any) => {
                let endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                if (endPosition == undefined) return;
                let endCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(endPosition);
                let endDegree = {
                    lon: Cesium.Math.toDegrees(endCarto.longitude),
                    lat: Cesium.Math.toDegrees(endCarto.latitude)
                }

                this.points = [
                    { lon: startDegree.lon, lat: startDegree.lat },
                    { lon: startDegree.lon, lat: endDegree.lat },
                    { lon: endDegree.lon, lat: endDegree.lat },
                    { lon: endDegree.lon, lat: startDegree.lat },
                ]

                if (this.beforeEntity != null)
                    this.viewer?.entities.remove(this.beforeEntity);
                this.addEntity("rect", this.points);

                this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.screenSpaceEventHandler?.setInputAction(this.handleClickForDrawRect, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    });

    private handleClickForDrawPoly = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        // let Points: any = [];
        this.points.push(startDegree);

        this.screenSpaceEventHandler?.setInputAction((movement: any) => {
            var mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
            let moveDegree = {
                lon: Cesium.Math.toDegrees(moveCarto.longitude),
                lat: Cesium.Math.toDegrees(moveCarto.latitude)
            }

            if (this.beforeEntity != null)
                this.viewer?.entities.remove(this.beforeEntity);
            let tmpPoints = JSON.parse(JSON.stringify(this.points));
            tmpPoints.push(moveDegree)

            if (tmpPoints.length == 2)
                this.beforeEntity = this.enttFctry?.getLine([tmpPoints[0], tmpPoints[1]], Cesium.Color.WHITE);
            else
                this.beforeEntity = this.enttFctry?.getPolygon(tmpPoints, Cesium.Color.WHITE, Cesium.Color.WHITE, 99999);
            this.viewer?.entities.add(this.beforeEntity);

            if (this.beforePoint != null)
                this.viewer?.entities.remove(this.beforePoint);
            this.beforePoint = this.enttFctry?.getPoint(mousePosition, Cesium.Color.LIGHTBLUE);
            this.viewer?.entities.add(this.beforePoint as Cesium.Entity);

            this.screenSpaceEventHandler?.setInputAction((click: any) => {
                if (this.points.length <= 1) return;

                let endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                if (endPosition == undefined) return;
                let endCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(endPosition);
                let endDegree = {
                    lon: Cesium.Math.toDegrees(endCarto.longitude),
                    lat: Cesium.Math.toDegrees(endCarto.latitude)
                }

                if (this.beforePoint != null)
                    this.viewer?.entities.remove(this.beforePoint);
                if (this.beforeEntity != null)
                    this.viewer?.entities.remove(this.beforeEntity);
                this.points.push(endDegree);
                this.addEntity("poly", this.points);
                this.points = [];

                this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    });

    // private test =  ( async (click: any) => {

    //     return new Promise( ( resolve, reject ) => {

    //         try {
    //             setTimeout(() => {
    //                 resolve("success");

    //             }, 1000);
    //         }
    //         catch (error) {

    //             reject("fail");
    //         }
    //     });
    // });

    // private mounted = () => {
    //     setTimeout()
    //     await test()
    // }
}