<template>
    <div class="cesium-container">
        <div class="cesium-map" id="cesiumContainer"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import 'cesiumModule/Widgets/widgets.css';
import * as Cesium from 'cesium';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDIxNWEzNi1jMjVlLTQ4ZjUtYjY1MS1mNjU4ZTdkM2IyOWYiLCJpZCI6MzM1NzUsImlhdCI6MTU5ODkzNDg1MH0.LEV5sH3jYnHCLFD3e90TjkvieBBjsJf5wQ52FCTlZuk';
let viewer: Cesium.Viewer | null = null;

let initMap = (() => {
    let worldMap = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:9090/geoserver/wms',
        parameters: {
            format: 'image/png',
            transparent: 'true',
            tiled: true,
            enablePickFeatures: true,
        },
        layers: 'florida:NE1_50M_SR_W',  // comma separated listing
        maximumLevel: 12,
    });

    let planetOsmRoads = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:9090/geoserver/wms',
        parameters: {
            format: 'image/png',
            transparent: 'true',
            tiled: true,
            enablePickFeatures: true,
        },
        layers: 'florida:FL_planet_osm_roads',  // comma separated listing
        maximumLevel: 20
    });

    let planetOsmPoint = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:9090/geoserver/wms',
        parameters: {
            format: 'image/png',
            transparent: 'true',
            tiled: true,
            enablePickFeatures: true,
        },
        layers: 'FL_planet_osm_point',  // comma separated listing
        maximumLevel: 20
    });

    let nurcMosaic = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:9090/geoserver/wms',
        parameters: {
            format: 'image/png',
            transparent: 'true',
            tiled: true,
            enablePickFeatures: true,
        },
        layers: 'nurc:mosaic',  // comma separated listing
        maximumLevel: 20
    });

    viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain(),
        baseLayerPicker: true,
    });

    let imageryLayers = viewer.imageryLayers;
    // imageryLayers.addImageryProvider(worldMap);
    imageryLayers.addImageryProvider(planetOsmPoint);
    imageryLayers.addImageryProvider(planetOsmRoads);
    imageryLayers.addImageryProvider(nurcMosaic);

    let screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 1000;

    let handleClick: any = null;
    screenSpaceEventHandler.setInputAction(handleClick = (click: any) => {
        let clickPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
        if (clickPosition == undefined) return;

        let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
        let startDegree = {
            long: Cesium.Math.toDegrees(startCarto.longitude),
            lat: Cesium.Math.toDegrees(startCarto.latitude)
        }
        let startRadians = {
            long: Cesium.Math.toRadians(startDegree.long),
            lat: Cesium.Math.toRadians(startDegree.lat)
        }

        let beforePoly: any = null;
        screenSpaceEventHandler.setInputAction((movement: any) => {
            var mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;

            let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
            let moveDegree = {
                long: Cesium.Math.toDegrees(moveCarto.longitude),
                lat: Cesium.Math.toDegrees(moveCarto.latitude)
            }
            let moveRadians = {
                long: Cesium.Math.toRadians(moveDegree.long),
                lat: Cesium.Math.toRadians(moveDegree.lat)
            }

            if (beforePoly != null)
                viewer?.entities.remove(beforePoly);
            beforePoly = addPolygon(startRadians, moveRadians, Cesium.Color.WHITE);

            screenSpaceEventHandler.setInputAction((click: any) => {
                let endPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
                if (mousePosition == undefined) return;
                let endCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(endPosition);
                let endDegree = {
                    long: Cesium.Math.toDegrees(endCarto.longitude),
                    lat: Cesium.Math.toDegrees(endCarto.latitude)
                }
                let endRadians = {
                    long: Cesium.Math.toRadians(endDegree.long),
                    lat: Cesium.Math.toRadians(endDegree.lat)
                }

                if (beforePoly != null)
                    viewer?.entities.remove(beforePoly);
                addPolygon(startRadians, endRadians, Cesium.Color.YELLOW);
                screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                screenSpaceEventHandler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});
function toDegrees(cartesian3Pos: any) {
    let pos = Cesium.Cartographic.fromCartesian(cartesian3Pos)
    return { long: pos.longitude / Math.PI * 180, lat: pos.latitude / Math.PI * 180 }
}

let addPolygon = ((start: any, end: any, color: Cesium.Color) => {
    let entity = new Cesium.Entity({
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromRadiansArray([
                    start.long, start.lat,
                    start.long, end.lat,
                    end.long, end.lat,
                    end.long, start.lat,
                ])
            ),
            height: 0,
            material: color.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.BLACK
        }
    });

    viewer?.entities.add(entity);
    return entity;
});

onMounted(() => {
    initMap();
});

</script>

<style lang="scss">
.cesium-container {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    .cesium-map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
