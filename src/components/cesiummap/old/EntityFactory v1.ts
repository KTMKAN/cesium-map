import * as Cesium from 'cesium';

export default class EntityFactory {
    private static enttFctry: EntityFactory | null = null;

    constructor() {
        if (EntityFactory.enttFctry) return EntityFactory.enttFctry;
        EntityFactory.enttFctry = this;
    }

    public getPoint = ((geometry: any, color: Cesium.Color, zIndex: any = 99999)
        : Cesium.Entity => {
        let entity = new Cesium.Entity({
            position: geometry.coordinates,
            point: {
                pixelSize: 5,
                color: color,
            }
        });

        return entity;
    });

    public getLine = ((geometry: any, color: Cesium.Color, zIndex: any = 99999)
        : Cesium.Entity => {

        let entity = new Cesium.Entity({
            polyline: {
                positions: geometry.coordinates,
                width: 3,
                material: color,
                zIndex: zIndex,
                clampToGround: true,
            }
        });

        return entity;
    });

    public getCircle = ((geometry: any, bgColor: Cesium.Color, lineColor: Cesium.Color, zIndex: any = 99999)
        : Cesium.Entity => {

        let entity = new Cesium.Entity({
            position: geometry.coordinates,
            ellipse: {
                semiMinorAxis: geometry.radius,
                semiMajorAxis: geometry.radius,
                // granularity : 0.0523598776,
                material: bgColor.withAlpha(0.7),
                outline: true, // height must be set for outline to display
                outlineColor: lineColor.withAlpha(1),
                zIndex: zIndex
            },
        });

        return entity;
    });

    public getPolygon = ((geometry: any, bgColor: Cesium.Color, lineColor: Cesium.Color, zIndex: any = 99999)
        : Cesium.Entity => {
        let entity = new Cesium.Entity({
            polygon: {
                hierarchy: geometry.coordinates,
                material: bgColor.withAlpha(0.7),
                outline: true,
                outlineColor: lineColor.withAlpha(1),
                zIndex: zIndex
            }
        });

        return entity;
    });
}