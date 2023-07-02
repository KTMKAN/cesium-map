import * as Cesium from 'cesium';

import Interaction from "./Interaction";
import EntityFactory from "./EntityFactory v1"

export default class Draw extends Interaction {
    private viewer: Cesium.Viewer | null = null;
    private drawType: string | null = null;

    private enttFctry: EntityFactory | null = null;

    private points: any = [];
    private beforeEntity: any = null;
    private beforePoint: Cesium.Entity | null | undefined = null;

    constructor(viewer: Cesium.Viewer, drawType: string) {
        super(["drawstart", "drawstop", "drawend"]);

        this.viewer = viewer;
        this.drawType = drawType;

        this.enttFctry = new EntityFactory();
        this.execute();
    }

    private initDraw = (() => {
        this.points = [];

        if (this.beforeEntity != null)
            this.viewer?.entities.remove(this.beforeEntity);
        this.beforeEntity = null;

        if (this.beforePoint != null)
            this.viewer?.entities.remove(this.beforePoint);
        this.beforePoint = null;

        this.handleLeftClick = null;
        this.handleMouseMove = null;
        this.handleRightClick = null;

        this.stop = this.drawStop;
    })

    private execute = (() => {
        if (this.drawType != null) {
            this.initDraw();
        }

        switch (this.drawType) {
            case "point":
                this.handleLeftClick = this.handleClickForDrawPoint;
                break;
            case "line":
                this.handleLeftClick = this.handleClickForDrawLine;
                break;
            case "circle":
                this.handleLeftClick = this.handleClickForDrawCircle;
                break;
            case "rect":
                this.handleLeftClick = this.handleClickForDrawRect;
                break;
            case "poly":
                this.handleLeftClick = this.handleClickForDrawPoly;
                break;
        }
    });

    private handleClickForDrawPoint = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
        if (clickPosition == undefined) return;

        let drawstartEvent = {
            type: "drawstart",
            data: click
        }
        this.notify("drawstart", drawstartEvent);

        let width = this.viewer?.camera.position.z;
        if (width == undefined) return;
        width = (width / 300);

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude),
            width: width,
        }

        let entity = this.enttFctry?.getCircle([startDegree], Cesium.Color.BLUE, Cesium.Color.BLACK) as Cesium.Entity;
        this.viewer?.entities.add(entity);

        let drawendEvent = {
            type: "drawend",
            data: {
                type: this.drawType,
                points: [startDegree],
                entity: entity,
            }
        }
        this.notify("drawend", drawendEvent);
    });

    private handleClickForDrawLine = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
        if (clickPosition == undefined) return;

        let drawstartEvent = {
            type: "drawstart",
            data: click
        }
        this.notify("drawstart", drawstartEvent);

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        this.handleMouseMove = (movement: any) => {
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

            this.handleLeftClick = (click: any) => {
                if (this.beforeEntity != null) this.viewer?.entities.remove(this.beforeEntity);
                if (this.beforePoint != null) this.viewer?.entities.remove(this.beforePoint);
                let entity = this.enttFctry?.getLine(tmpPoints, Cesium.Color.BLUE) as Cesium.Entity;
                this.viewer?.entities.add(entity);

                let drawendEvent = {
                    type: "drawend",
                    data: {
                        type: this.drawType,
                        points: tmpPoints,
                        entity: entity,
                    }
                }
                this.notify("drawend", drawendEvent);

                this.handleMouseMove = null;
                this.handleLeftClick = this.handleClickForDrawLine;
            }
        }
    });

    private handleClickForDrawCircle = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let drawstartEvent = {
            type: "drawstart",
            data: click
        }
        this.notify("drawstart", drawstartEvent);

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude),
            width: 0,
        }

        this.handleMouseMove = (movement: any) => {
            let mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            if (this.beforeEntity != null)
                this.viewer?.entities.remove(this.beforeEntity);

            let width = Cesium.Cartesian3.distance(clickPosition, mousePosition);
            startDegree.width = width;

            this.beforeEntity = this.enttFctry?.getCircle([startDegree], Cesium.Color.WHITE, Cesium.Color.WHITE);

            this.viewer?.entities.add(this.beforeEntity);

            this.handleLeftClick = (click: any) => {
                let endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                if (endPosition == undefined) return;

                if (this.beforeEntity != null)
                    this.viewer?.entities.remove(this.beforeEntity);

                let entity = this.enttFctry?.getCircle([startDegree], Cesium.Color.BLUE, Cesium.Color.BLACK) as Cesium.Entity;
                this.viewer?.entities.add(entity);

                let drawendEvent = {
                    type: "drawend",
                    data: {
                        type: this.drawType,
                        points: [startDegree],
                        entity: entity,
                    }
                }
                this.notify("drawend", drawendEvent);

                this.handleMouseMove = null;
                this.handleLeftClick = this.handleClickForDrawCircle;
            }
        }
    });

    private handleClickForDrawRect = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let drawstartEvent = {
            type: "drawstart",
            data: click
        }
        this.notify("drawstart", drawstartEvent);

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        this.handleMouseMove = (movement: any) => {
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

            this.handleLeftClick = (click: any) => {
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

                let entity = this.enttFctry?.getPolygon(this.points, Cesium.Color.BLUE, Cesium.Color.BLACK) as Cesium.Entity;
                this.viewer?.entities.add(entity);

                let drawendEvent = {
                    type: "drawend",
                    data: {
                        type: this.drawType,
                        points: this.points,
                        entity: entity,
                    }
                }
                this.notify("drawend", drawendEvent);

                this.handleMouseMove = null;
                this.handleLeftClick = this.handleClickForDrawRect;
            }
        }
    });

    private handleClickForDrawPoly = ((click: any) => {
        let clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        if (this.points.length == 0) {
            let drawstartEvent = {
                type: "drawstart",
                data: click
            }
            this.notify("drawstart", drawstartEvent);
        }

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            lon: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }

        this.points.push(startDegree);

        this.handleMouseMove = (movement: any) => {
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

            this.handleRightClick = (click: any) => {
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

                let entity = this.enttFctry?.getPolygon(this.points, Cesium.Color.BLUE, Cesium.Color.BLACK) as Cesium.Entity;
                this.viewer?.entities.add(entity);

                let drawendEvent = {
                    type: "drawend",
                    data: {
                        type: this.drawType,
                        points: this.points,
                        entity: entity,
                    }
                }
                this.notify("drawend", drawendEvent);
                this.points = [];

                this.handleMouseMove = null;
                this.handleRightClick = null
            }
        }
    });

    private drawStop() {
        this.initDraw();

        let event = {
            type: "drawstop"
        }
        this.notify("drawstop", event);
    }
}