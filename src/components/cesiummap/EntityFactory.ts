import * as Cesium from 'cesium';

export default class EntityFactory {
    private static enttFctry: EntityFactory | null = null;

    constructor() {
        if (EntityFactory.enttFctry) return EntityFactory.enttFctry;
        EntityFactory.enttFctry = this;
    }

    public getPoint = ((geometry: any, zIndex: any = 99999)
        : Cesium.Entity => {
        let entity = new Cesium.Entity({
            position: geometry.coordinates,
            point: {
                pixelSize: 5,
                color: geometry.fillColor,
            },
            properties: {
                geometryType: "point",
            },
        });

        return entity;
    });

    public getLine = ((geometry: any, zIndex: any = 99999)
        : Cesium.Entity => {

        console.log(geometry.coordinates);
        let entity = new Cesium.Entity({
            polyline: {
                positions: geometry.coordinates,
                width: geometry.width ? geometry.width : 1,
                material: geometry.lineColor,
                zIndex: zIndex,
                clampToGround: true,
            },
            properties: {
                geometryType: "polyline",
            },
        });

        return entity;
    });

    public getCircle = ((geometry: any, zIndex: any = 99999)
        : Cesium.Entity => {

        console.log(geometry.coordinates);
        let entity = new Cesium.Entity({
            position: geometry.coordinates,
            ellipse: {
                semiMinorAxis: geometry.radius,
                semiMajorAxis: geometry.radius,
                // granularity : 0.0523598776,
                material: geometry.fillColor,
                outline: true, // height must be set for outline to display
                outlineColor: geometry.lineColor,
                zIndex: zIndex
            },
            properties: {
                geometryType: "ellipse",
            },
        });

        return entity;
    });

    public getPolygon = ((geometry: any, zIndex: any = 99999)
        : Cesium.Entity => {
        console.log(geometry.coordinates);
        let entity = new Cesium.Entity({
            polygon: {
                hierarchy: geometry.coordinates,
                material: geometry.fillColor,
                outline: true,
                outlineColor: geometry.lineColor,
                zIndex: zIndex
            },
            properties: {
                geometryType: "polygon",
            },
        });

        return entity;
    });
}