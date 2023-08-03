import * as Cesium from 'cesium';

import Interaction from './Interaction'
import EntityFactory from '../EntityFactory'

export default class Draw extends Interaction {
    public static events: string[] = ['executeDraw', 'terminateDraw', 'drawStart', 'drawEnd'];

    private viewer: Cesium.Viewer | null = null;
    private drawType: string | null = null;
    private fillColor: Cesium.Color | null = null;
    private lineColor: Cesium.Color | null = null;

    private enttFctry: EntityFactory | null = null;

    private degrees: any = [];
    private radius: any = null;
    private beforeEntity: Cesium.Entity | null | undefined = null;

    constructor(viewer: Cesium.Viewer, drawOption: any) {
        super(Draw.events);

        this.viewer = viewer;
        this.drawType = drawOption.drawType;

        let fillColorHex = drawOption.fillColorHex || "#FFFFFF";
        let fillColorRgba = this.hexToRgba(fillColorHex);
        this.fillColor = new Cesium.Color(fillColorRgba[0] / 255, fillColorRgba[1] / 255, fillColorRgba[2] / 255, fillColorRgba[3]);

        let lineColorHex = drawOption.lineColorHex || "#FFFFFF";
        let lineColorRgba = this.hexToRgba(lineColorHex);
        this.lineColor = new Cesium.Color(lineColorRgba[0] / 255, lineColorRgba[1] / 255, lineColorRgba[2] / 255, lineColorRgba[3]);

        this.enttFctry = new EntityFactory();
    }

    private initDraw = (() => {
        this.degrees = [];
        this.radius = null;

        if (this.beforeEntity != null) {
            this.viewer?.entities.remove(this.beforeEntity);
            this.beforeEntity = null;
        }

        this.handleLeftClick = null;
        this.handleMouseMove = null;
        this.handleRightClick = null;
    });

    public execute = (() => {
        if (this.drawType != null) {
            this.terminate();
        }

        switch (this.drawType) {
            case 'point':
                this.handleLeftClick = this.handleLeftClickForDrawPoint;
                break;
            case 'line':
                this.handleLeftClick = this.handleLeftClickForDrawLine;
                break;
            case 'circle':
                this.handleLeftClick = this.handleLeftClickForDrawCircle;
                break;
            case 'rect':
                this.handleLeftClick = this.handleLeftClickForDrawRect;
                break;
            case 'poly':
                this.handleLeftClick = this.handleLeftClickForDrawPoly;
                break;
        }

        const event = {
            type: 'executeDraw',
            data: {
                drawType: this.drawType
            }
        };
        this.notify('executeDraw', event);
    });

    public terminate = (() => {
        this.initDraw();

        const event = {
            type: 'terminateDraw'
        };
        this.notify('terminateDraw', event);
    });

    public setDrawType = ((type: string | null) => {
        this.terminate();
        this.drawType = type;
    });

    public setFillColor = ((colorHex: string) => {
        let fillColorRgba = this.hexToRgba(colorHex);
        this.fillColor = new Cesium.Color(fillColorRgba[0] / 255, fillColorRgba[1] / 255, fillColorRgba[2] / 255, fillColorRgba[3]);
    });

    public setLineColor = ((colorHex: string) => {
        let LineColorRgba = this.hexToRgba(colorHex);
        this.lineColor = new Cesium.Color(LineColorRgba[0] / 255, LineColorRgba[1] / 255, LineColorRgba[2] / 255, LineColorRgba[3]);
    });

    public getDrawType = (() => {
        return this.drawType;
    });

    public getFillColor = (() => {
        return this.fillColor;
    });

    public getLineColor = (() => {
        return this.lineColor;
    });

    public hexToRgba = ((hex: string) => {
        var hex = hex.trim().replace("#", "");

        var rgba: any = (3 === hex.length) ?
            hex.match(/[a-f\d]/gi) : hex.match(/[a-f\d]{2}/gi);

        rgba?.forEach(function (str: any, x: any, arr: any) {
            if (str.length == 1) str = str + str;

            arr[x] = parseInt(str, 16).toString();
            arr[x] = parseInt(arr[x]);
        });

        rgba = rgba?.map((item: any) => parseInt(item));
        if (rgba?.length == 3) {
            rgba = [...rgba, Number(1)];
        } else if (rgba?.length == 4) {
            rgba = [rgba[0], rgba[1], rgba[2], rgba[3] / 255];
        }

        return rgba;
    });

    private handleLeftClickForDrawPoint = ((click: any) => {
        try {
            const clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
            if (clickPosition == undefined) return;

            const drawStartEvent = {
                type: 'drawStart',
                data: click,
            }
            this.notify('drawStart', drawStartEvent);

            let radius = this.viewer?.camera.position.z;
            if (radius == undefined) return;
            radius = (radius / 300);

            const startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
            const startDegree = {
                lon: Cesium.Math.toDegrees(startCarto.longitude),
                lat: Cesium.Math.toDegrees(startCarto.latitude),
            }
            const degrees = [startDegree.lon, startDegree.lat];
            const coords = Cesium.Cartesian3.fromDegrees(
                degrees[0], degrees[1], 0,
                Cesium.Ellipsoid.WGS84
            )

            const entity = this.enttFctry?.getCircle({
                type: this.drawType,
                coordinates: coords,
                radius: radius,
                fillColor: this.fillColor,
                lineColor: this.lineColor,
            }) as Cesium.Entity;
            this.viewer?.entities.add(entity);

            const drawEndEvent = {
                type: 'drawEnd',
                data: {
                    entity: entity,
                    geometry: {
                        type: this.drawType,
                        coordinates: coords,
                        radius: radius,
                        fillColor: this.fillColor,
                        lineColor: this.lineColor,
                    }
                }
            };
            this.notify('drawEnd', drawEndEvent);
        } catch (error) {
            this.terminate();
            console.log('ERROR: Draw.handleLeftClickForDrawPoint() : ', error);
        }
    });

    private handleLeftClickForDrawLine = ((click: any) => {
        try {
            const clickPosition = this.viewer?.camera.pickEllipsoid(click.position);
            if (clickPosition == undefined) return;

            const drawStartEvent = {
                type: 'drawStart',
                data: click,
            }
            this.notify('drawStart', drawStartEvent);

            const startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
            const startDegree = {
                lon: Cesium.Math.toDegrees(startCarto.longitude),
                lat: Cesium.Math.toDegrees(startCarto.latitude),
            }

            this.degrees.push(startDegree.lon);
            this.degrees.push(startDegree.lat);

            this.handleMouseMove = (movement: any) => {
                const movePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
                if (movePosition == undefined) return;

                const moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(movePosition);
                const moveDegree = {
                    lon: Cesium.Math.toDegrees(moveCarto.longitude),
                    lat: Cesium.Math.toDegrees(moveCarto.latitude),
                };

                if (this.degrees.length >= 4) {
                    this.degrees.pop(); this.degrees.pop(); // 임시 점 삭제
                }
                this.degrees.push(moveDegree.lon);
                this.degrees.push(moveDegree.lat);

                if (this.beforeEntity == null && this.degrees.length >= 4) {
                    const drawingCoords = new Cesium.CallbackProperty((time, result) => {
                        return Cesium.Cartesian3.fromDegreesArray(
                            this.degrees,
                            Cesium.Ellipsoid.WGS84,
                            result
                        )
                    }, false);

                    this.beforeEntity = this.enttFctry?.getLine({
                        type: this.drawType,
                        coordinates: drawingCoords,
                        lineColor: Cesium.Color.WHITE.withAlpha(1),
                        width: 4
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(this.beforeEntity);
                }

                this.handleRightClick = (click: any) => {
                    if (this.beforeEntity != null) {
                        this.viewer?.entities.remove(this.beforeEntity);
                    }
                    this.beforeEntity = null;
                    const coords = Cesium.Cartesian3.fromDegreesArray(
                        this.degrees,
                        Cesium.Ellipsoid.WGS84
                    );

                    const entity = this.enttFctry?.getLine({
                        type: this.drawType,
                        coordinates: coords,
                        lineColor: this.lineColor,
                        width: 4
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(entity);

                    const drawEndEvent = {
                        type: 'drawEnd',
                        data: {
                            entity: entity,
                            geometry: {
                                type: this.drawType,
                                coordinates: coords,
                                lineColor: this.lineColor,
                                width: 4
                            }
                        }
                    };
                    this.notify('drawEnd', drawEndEvent);

                    this.degrees = [];
                    this.handleMouseMove = null;
                    this.handleRightClick = null;
                }
            }
        } catch (error) {
            this.terminate();
            console.log('ERROR: Draw.handleLeftClickForDrawLine() : ', error);
        }
    });

    private handleLeftClickForDrawCircle = ((click: any) => {
        try {
            const clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (clickPosition == undefined) return;

            const drawStartEvent = {
                type: 'drawStart',
                data: click
            }
            this.notify('drawStart', drawStartEvent);

            const startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
            const startDegree = {
                lon: Cesium.Math.toDegrees(startCarto.longitude),
                lat: Cesium.Math.toDegrees(startCarto.latitude)
            }
            this.degrees = [startDegree.lon, startDegree.lat];

            this.handleMouseMove = (movement: any) => {
                const movePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
                if (movePosition == undefined) return;

                this.radius = Cesium.Cartesian3.distance(clickPosition, movePosition);

                if (this.beforeEntity == null) {
                    const drawingCoords = Cesium.Cartesian3.fromDegrees(
                        this.degrees[0], this.degrees[1], 0,
                        Cesium.Ellipsoid.WGS84
                    );

                    this.beforeEntity = this.enttFctry?.getCircle({
                        type: this.drawType,
                        coordinates: drawingCoords,
                        radius: new Cesium.CallbackProperty(() => {
                            return this.radius
                        }, false),
                        fillColor: Cesium.Color.WHITE.withAlpha(0.4),
                        lineColor: Cesium.Color.WHITE.withAlpha(1),
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(this.beforeEntity);
                }

                this.handleLeftClick = (click: any) => {
                    const endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                    if (endPosition == undefined) return;

                    if (this.beforeEntity != null) {
                        this.viewer?.entities.remove(this.beforeEntity);
                        this.beforeEntity = null;
                    }

                    const coords = Cesium.Cartesian3.fromDegrees(
                        this.degrees[0], this.degrees[1], 0,
                        Cesium.Ellipsoid.WGS84
                    )

                    const entity = this.enttFctry?.getCircle({
                        type: this.drawType,
                        coordinates: coords,
                        radius: this.radius,
                        fillColor: this.fillColor,
                        lineColor: this.lineColor
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(entity);

                    const drawEndEvent = {
                        type: 'drawEnd',
                        data: {
                            entity: entity,
                            geometry: {
                                type: this.drawType,
                                coordinates: coords,
                                radius: this.radius,
                                fillColor: this.fillColor,
                                lineColor: this.lineColor,
                            }
                        }
                    }
                    this.notify('drawEnd', drawEndEvent);

                    this.handleMouseMove = null;
                    this.handleLeftClick = this.handleLeftClickForDrawCircle;
                }
            }
        } catch (error) {
            this.terminate();
            console.log('ERROR: Draw.handleLeftClickForDrawCircle() : ', error);
        }
    });

    private handleLeftClickForDrawRect = ((click: any) => {
        try {
            const clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (clickPosition == undefined) return;

            const drawStartEvent = {
                type: 'drawStart',
                data: click
            };
            this.notify('drawStart', drawStartEvent);

            const startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
            const startDegree = {
                lon: Cesium.Math.toDegrees(startCarto.longitude),
                lat: Cesium.Math.toDegrees(startCarto.latitude)
            };

            this.handleMouseMove = (movement: any) => {
                const mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
                if (mousePosition == undefined) return;

                const moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
                const moveDegree = {
                    lon: Cesium.Math.toDegrees(moveCarto.longitude),
                    lat: Cesium.Math.toDegrees(moveCarto.latitude)
                };

                this.degrees = [
                    startDegree.lon, startDegree.lat,
                    startDegree.lon, moveDegree.lat,
                    moveDegree.lon, moveDegree.lat,
                    moveDegree.lon, startDegree.lat
                ]

                if (this.beforeEntity == null) {
                    const drawingCoords = new Cesium.CallbackProperty((time, result) => {
                        return new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
                            this.degrees,
                            Cesium.Ellipsoid.WGS84,
                            result
                        ))
                    }, false);

                    this.beforeEntity = this.enttFctry?.getPolygon({
                        coordinates: drawingCoords,
                        fillColor: Cesium.Color.WHITE.withAlpha(0.4),
                        lineColor: Cesium.Color.WHITE.withAlpha(1)
                    }) as Cesium.Entity;

                    this.viewer?.entities.add(this.beforeEntity);
                }

                this.handleLeftClick = (click: any) => {
                    const endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                    if (endPosition == undefined) return;

                    if (this.beforeEntity != null) {
                        this.viewer?.entities.remove(this.beforeEntity);
                        this.beforeEntity = null;
                    }

                    const coords = new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
                        this.degrees,
                        Cesium.Ellipsoid.WGS84
                    ));
                    const entity = this.enttFctry?.getPolygon({
                        coordinates: coords,
                        fillColor: this.fillColor,
                        lineColor: this.lineColor,
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(entity);

                    const drawEndEvent = {
                        type: 'drawEnd',
                        data: {
                            entity: entity,
                            geometry: {
                                type: this.drawType,
                                coordinates: coords,
                                fillColor: this.fillColor,
                                lineColor: this.lineColor
                            }
                        }
                    };
                    this.notify('drawEnd', drawEndEvent);

                    this.degrees = null;
                    this.handleMouseMove = null;
                    this.handleLeftClick = this.handleLeftClickForDrawRect;
                }
            }
        } catch (error) {
            this.terminate();
            console.log('ERROR: Draw.handleLeftClickForDrawRect() : ', error);
        }
    });

    private handleLeftClickForDrawPoly = ((click: any) => {
        try {
            const clickPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (clickPosition == undefined) return;

            if (this.degrees.length == 0) {
                const drawStartEvent = {
                    type: 'drawStart',
                    data: click
                };
                this.notify('drawStart', drawStartEvent);
            }

            const startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
            const startDegree = {
                lon: Cesium.Math.toDegrees(startCarto.longitude),
                lat: Cesium.Math.toDegrees(startCarto.latitude)
            };

            this.degrees.push(startDegree.lon);
            this.degrees.push(startDegree.lat);

            this.handleMouseMove = (movement: any) => {
                const mousePosition: any = this.viewer?.camera.pickEllipsoid(movement.endPosition);
                if (mousePosition == undefined) return;

                const moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
                const moveDegree = {
                    lon: Cesium.Math.toDegrees(moveCarto.longitude),
                    lat: Cesium.Math.toDegrees(moveCarto.latitude)
                };

                if (this.degrees.length >= 4) {
                    this.degrees.pop(); this.degrees.pop(); // 임시 점 삭제
                }
                this.degrees.push(moveDegree.lon);
                this.degrees.push(moveDegree.lat);

                if (this.beforeEntity == null && this.degrees.length == 4) {
                    const drawingCoords = new Cesium.CallbackProperty((time, result) => {
                        return Cesium.Cartesian3.fromDegreesArray(
                            this.degrees,
                            Cesium.Ellipsoid.WGS84,
                            result
                        );
                    }, false);

                    this.beforeEntity = this.enttFctry?.getLine({
                        type: 'line',
                        coordinates: drawingCoords,
                        lineColor: Cesium.Color.WHITE.withAlpha(1),
                        width: 2
                    }) as Cesium.Entity;

                    this.viewer?.entities.add(this.beforeEntity);
                } else if (this.beforeEntity?.polyline != null && this.degrees.length == 6) {
                    this.viewer?.entities.remove(this.beforeEntity as Cesium.Entity);

                    const drawingCoords = new Cesium.CallbackProperty((time, result) => {
                        return new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
                            this.degrees,
                            Cesium.Ellipsoid.WGS84,
                            result
                        ));
                    }, false);

                    this.beforeEntity = this.enttFctry?.getPolygon({
                        type: this.drawType,
                        coordinates: drawingCoords,
                        fillColor: Cesium.Color.WHITE.withAlpha(0.4),
                        lineColor: Cesium.Color.WHITE.withAlpha(1)
                    }) as Cesium.Entity;

                    this.viewer?.entities.add(this.beforeEntity);
                }

                this.handleRightClick = (click: any) => {
                    if (this.degrees.length <= 2) return;

                    const endPosition = this.viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3
                    if (endPosition == undefined) return;

                    if (this.beforeEntity != null) {
                        this.viewer?.entities.remove(this.beforeEntity);
                        this.beforeEntity = null;
                    }

                    const coords = new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
                        this.degrees,
                        Cesium.Ellipsoid.WGS84
                    ));
                    const entity = this.enttFctry?.getPolygon({
                        coordinates: coords,
                        fillColor: this.fillColor,
                        lineColor: this.lineColor
                    }) as Cesium.Entity;
                    this.viewer?.entities.add(entity);

                    const drawEndEvent = {
                        type: 'drawEnd',
                        data: {
                            entity: entity,
                            geometry: {
                                type: this.drawType,
                                coordinates: coords,
                                fillColor: this.fillColor,
                                lineColor: this.lineColor
                            }
                        }
                    };
                    this.notify('drawEnd', drawEndEvent);
                    this.degrees = [];

                    this.handleMouseMove = null;
                    this.handleRightClick = null;
                }
            }
        } catch (error) {
            this.terminate();
            console.log('ERROR: Draw.handleLeftClickForDrawPoly() : ', error);
        }
    });
}
