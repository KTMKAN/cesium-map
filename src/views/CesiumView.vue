<template>
    <div class="cesium-container">
        <div class="cesium-map" id="cesiumContainer"></div>
        <IncreaseCount :bears="data.bears" :ducks="data.ducks" :onIncreaseBears="(by: number) => data.bears += by"
            :onIncreaseDucks="(by: number) => data.ducks += by" :onAlertMessage="() => handleAlert('test')" />
</div>
</template>

<script setup lang="ts">

import { onMounted, reactive, watch } from "@vue/runtime-core";
import 'cesiumModule/Widgets/widgets.css';
import * as Cesium from 'cesium';
import IncreaseCount from "@/components/increase-count/IncreaseCount"

// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MTQ5NDMwMC0xZGU5LTQ0MmUtYmNmOC01YWRmNzA3ZjkxMDAiLCJpZCI6MTAxODIxLCJpYXQiOjE2NzY1MzYzNTF9.87aPfeKY-EqOYfaYYEIOxy88GKo5a09mbaHzefXTCu4';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDIxNWEzNi1jMjVlLTQ4ZjUtYjY1MS1mNjU4ZTdkM2IyOWYiLCJpZCI6MzM1NzUsImlhdCI6MTU5ODkzNDg1MH0.LEV5sH3jYnHCLFD3e90TjkvieBBjsJf5wQ52FCTlZuk';
let viewer: Cesium.Viewer | null = null;
const data = reactive({
    bears: 0,
    ducks: 0
});

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
        maximumLevel: 12
    });

    let planetOsmRoads = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:9090/geoserver/wms',
        parameters: {
            format: 'image/png',
            transparent: 'true',
            tiled: true,
            enablePickFeatures: true,
        },
        // layers: 'florida:FL_planet_osm_roads',  // comma separated listing
        layers: 'qqq',  // comma separated listing
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
    // imageryLayers.addImageryProvider(planetOsmPoint);
    // imageryLayers.addImageryProvider(planetOsmRoads);
    // imageryLayers.addImageryProvider(nurcMosaic);
    // debugger
    // imageryLayers.addImageryProvider(
    //     new Cesium.IonImageryProvider({ assetId: 1069119 })
    // );
    let screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    let handleClick: any = null;
    screenSpaceEventHandler.setInputAction(handleClick = (click: any) => {
        let clickPosition = viewer?.camera.pickEllipsoid(click.position);
        let startPoint = addPoint(clickPosition, Cesium.Color.YELLOW);
        console.log(clickPosition)
        let endPoint: any = null;
        let beforeLine: any = null;
        screenSpaceEventHandler.setInputAction((movement: any) => {
            var mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
            if (mousePosition == undefined) return;
            if (endPoint != null)
                viewer?.entities.remove(endPoint);
            if (beforeLine != null)
                viewer?.entities.remove(beforeLine);
            endPoint = addPoint(mousePosition, Cesium.Color.LIGHTBLUE);
            beforeLine = addLine(clickPosition, mousePosition, Cesium.Color.WHITE);

            screenSpaceEventHandler.setInputAction((click: any) => {
                if (startPoint != null) viewer?.entities.remove(startPoint);
                if (endPoint != null) viewer?.entities.remove(endPoint);
                if (beforeLine != null) viewer?.entities.remove(beforeLine);
                addLine(clickPosition, mousePosition, Cesium.Color.YELLOW);
                screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                screenSpaceEventHandler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});

let addPoint = ((position: any, color: Cesium.Color) => {
    let entity = new Cesium.Entity({
        position: position,
        point: {
            pixelSize: 5,
            color: color,
        }
    });
    viewer?.entities.add(entity);

    return entity;
});

let addLine = ((start: any, end: any, color: Cesium.Color) => {
    let entity = new Cesium.Entity({
        polyline: {
            positions: [start, end],
            width: 2,
            material: color
        }
    });
    viewer?.entities.add(entity);

    return entity;
});

let handleAlert = ((message: string) => {
    alert(message)
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
