<template>
    <div class="cesium-container">
        <div class="sidebar">
            <div id="layerList">

            </div>
        </div>
        <div class="content">
            <div class="cesium-map" id="cesiumMap"></div>
            <div class="cesium-toolbar-list">
                <a class="tool-item" id="tool-point" href="#" v-on:click="(e) => handleClickToolbar(e, 'point')">
                    Point
                </a>
                <a class="tool-item" id="tool-line" href="#" v-on:click="(e) => handleClickToolbar(e, 'line')">
                    Line
                </a>
                <a class="tool-item" id="tool-rect" href="#" v-on:click="(e) => handleClickToolbar(e, 'rect')">
                    Rect
                </a>
                <a class="tool-item" id="tool-circle" href="#" v-on:click="(e) => handleClickToolbar(e, 'circle')">
                    Circle
                </a>
                <a class="tool-item" id="tool-poly" href="#" v-on:click="(e) => handleClickToolbar(e, 'poly')">
                    Poly
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from "@vue/runtime-core";
import 'cesiumModule/Widgets/widgets.css';
import * as Cesium from 'cesium';

import LayerList from "@/components/layerList/LayerList";
const data = reactive({
    nodes: [
        {
            checked: true,
            childNodes: [],
            expended: false,
            id: "EnitiyList",
            leaf: false,
            name: "EnitiyList",
            visible: true,
        }
    ]
});

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDIxNWEzNi1jMjVlLTQ4ZjUtYjY1MS1mNjU4ZTdkM2IyOWYiLCJpZCI6MzM1NzUsImlhdCI6MTU5ODkzNDg1MH0.LEV5sH3jYnHCLFD3e90TjkvieBBjsJf5wQ52FCTlZuk';
let viewer: Cesium.Viewer | null = null;
let screenSpaceEventHandler: Cesium.ScreenSpaceEventHandler | null = null;
let layerList: LayerList | null = null;

let entities: Array<Cesium.Entity> = [];

let points: any = [];
let beforeEntity: any = null;
let beforePoint: Cesium.Entity | null = null;
let drawType: string | null = null;

let initLayerList = (() => {
    layerList = new LayerList("layerList", {
        nodes: data.nodes,
        renderOption: {
            nodeTitleClsList: [
                "node-title-cls-level1",
                "node-title-cls-level2",
                "node-title-cls-level3",
                "node-title-cls-level4",
            ],
            expendedOnBtnClsList: [
                // "node-expended-on-btn-cls-level1",
                // "node-expended-on-btn-cls-level2",
                "node-expended-on-btn-cls-level3",
            ],
            visibleOnBtnClsList: [
                "node-visible-on-btn-cls-level1",
                // "node-visible-on-btn-cls-level2",
                // "node-visible-on-btn-cls-level3",
            ],
            keyNameDefs: [
                { keyName: "id", defKeyName: "id" },
                { keyName: "name", defKeyName: "name" },
                { keyName: "checked", defKeyName: "checked" },
                { keyName: "visible", defKeyName: "visible" },
                { keyName: "leaf", defKeyName: "leaf" },
                { keyName: "expended", defKeyName: "expended" },
                { keyName: "childNodes", defKeyName: "childNodes" },
            ],
        },
    });
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

    viewer = new Cesium.Viewer('cesiumMap', {
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
        targetFrameRate: 60,
    });
    // viewer._cesiumWidget._creditContainer.style.display = "none";

    // viewer.scene.screenSpaceCameraController.enableTilt = false;    
    // viewer.scene.screenSpaceCameraController.enableRotate = false;
    // viewer.scene.screenSpaceCameraController.enableZoom = false;

    viewer.scene.debugShowFramesPerSecond = true;

    let imageryLayers = viewer.imageryLayers;
    // imageryLayers.addImageryProvider(worldMap);
    // imageryLayers.addImageryProvider(planetOsmPoint);
    // imageryLayers.addImageryProvider(planetOsmRoads);
    // imageryLayers.addImageryProvider(nurcMosaic);

    screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    Cesium.ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 600;

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(127.3, 37.2, 10000000),
    });

    layerList?.on("change", handleChangeNodes);
});

let initDraw = (() => {
    points = [];

    if (beforeEntity != null)
        viewer?.entities.remove(beforeEntity);
    beforeEntity = null;

    if (beforePoint != null)
        viewer?.entities.remove(beforePoint);
    beforePoint = null;

    screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
});

let handleClickForDrawPoint = ((click: any) => {
    let clickPosition = viewer?.camera.pickEllipsoid(click.position);
    if (clickPosition == undefined) return;

    let width = viewer?.camera.position.z;
    if (width == null) return;
    width = (width / 300);

    let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
    let startDegree = {
        lon: Cesium.Math.toDegrees(startCarto.longitude),
        lat: Cesium.Math.toDegrees(startCarto.latitude),
        width: width,
    }
    addEntity("point", [startDegree]);
});

let handleClickForDrawLine = ((click: any) => {
    let clickPosition = viewer?.camera.pickEllipsoid(click.position);
    if (clickPosition == undefined) return;

    let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
    let startDegree = {
        lon: Cesium.Math.toDegrees(startCarto.longitude),
        lat: Cesium.Math.toDegrees(startCarto.latitude)
    }
    let startRadians = {
        lon: Cesium.Math.toRadians(startDegree.lon),
        lat: Cesium.Math.toRadians(startDegree.lat)
    }

    screenSpaceEventHandler?.setInputAction((movement: any) => {
        let mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
        if (mousePosition == undefined) return;

        let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
        let moveDegree = {
            lon: Cesium.Math.toDegrees(moveCarto.longitude),
            lat: Cesium.Math.toDegrees(moveCarto.latitude)
        }
        let moveRadians = {
            lon: Cesium.Math.toRadians(moveDegree.lon),
            lat: Cesium.Math.toRadians(moveDegree.lat)
        }

        if (beforePoint != null)
            viewer?.entities.remove(beforePoint);
        if (beforeEntity != null)
            viewer?.entities.remove(beforeEntity);

        let tmpPoints = [
            { lon: startDegree.lon, lat: startDegree.lat },
            { lon: moveDegree.lon, lat: moveDegree.lat },
        ]

        beforePoint = getPoint(tmpPoints[1], Cesium.Color.LIGHTBLUE);
        viewer?.entities.add(beforePoint);

        beforeEntity = getLine(tmpPoints, Cesium.Color.WHITE);
        viewer?.entities.add(beforeEntity);

        screenSpaceEventHandler?.setInputAction((click: any) => {

            if (beforeEntity != null) viewer?.entities.remove(beforeEntity);
            if (beforePoint != null) viewer?.entities.remove(beforePoint);
            addEntity("line", tmpPoints);

            screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            screenSpaceEventHandler?.setInputAction(handleClickForDrawLine, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
});

let handleClickForDrawCircle = ((click: any) => {
    let clickPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
    if (clickPosition == undefined) return;

    let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
    let startDegree = {
        lon: Cesium.Math.toDegrees(startCarto.longitude),
        lat: Cesium.Math.toDegrees(startCarto.latitude),
        width: 0,
    }

    screenSpaceEventHandler?.setInputAction((movement: any) => {
        let mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
        if (mousePosition == undefined) return;

        let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
        let moveDegree = {
            lon: Cesium.Math.toDegrees(moveCarto.longitude),
            lat: Cesium.Math.toDegrees(moveCarto.latitude)
        }

        if (beforeEntity != null)
            viewer?.entities.remove(beforeEntity);

        let width = 100000;
        width = Cesium.Cartesian3.distance(clickPosition, mousePosition);
        startDegree.width = width;

        beforeEntity = getCircle([startDegree], Cesium.Color.WHITE, Cesium.Color.WHITE, 9999);
        // beforeEntity = getRectangle(startRadians, moveRadians, Cesium.Color.WHITE);

        viewer?.entities.add(beforeEntity);
        screenSpaceEventHandler?.setInputAction((click: any) => {
            let endPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (endPosition == undefined) return;

            if (beforeEntity != null)
                viewer?.entities.remove(beforeEntity);
            addEntity("circle", [startDegree]);

            screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            screenSpaceEventHandler?.setInputAction(handleClickForDrawCircle, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
});

let handleClickForDrawRect = ((click: any) => {
    let clickPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
    if (clickPosition == undefined) return;

    let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
    let startDegree = {
        lon: Cesium.Math.toDegrees(startCarto.longitude),
        lat: Cesium.Math.toDegrees(startCarto.latitude)
    }
    let startRadians = {
        lon: Cesium.Math.toRadians(startDegree.lon),
        lat: Cesium.Math.toRadians(startDegree.lat)
    }

    screenSpaceEventHandler?.setInputAction((movement: any) => {
        let mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
        if (mousePosition == undefined) return;

        let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
        let moveDegree = {
            lon: Cesium.Math.toDegrees(moveCarto.longitude),
            lat: Cesium.Math.toDegrees(moveCarto.latitude)
        }
        let moveRadians = {
            lon: Cesium.Math.toRadians(moveDegree.lon),
            lat: Cesium.Math.toRadians(moveDegree.lat)
        }

        if (beforeEntity != null)
            viewer?.entities.remove(beforeEntity);
        let tmpPoints = [
            { lon: startDegree.lon, lat: startDegree.lat },
            { lon: startDegree.lon, lat: moveDegree.lat },
            { lon: moveDegree.lon, lat: moveDegree.lat },
            { lon: moveDegree.lon, lat: startDegree.lat },
        ]

        beforeEntity = getPolygon(tmpPoints, Cesium.Color.WHITE, Cesium.Color.WHITE, 9999);
        // beforeEntity = getRectangle(startRadians, moveRadians, Cesium.Color.WHITE);

        viewer?.entities.add(beforeEntity);

        screenSpaceEventHandler?.setInputAction((click: any) => {
            let endPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (endPosition == undefined) return;
            let endCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(endPosition);
            let endDegree = {
                lon: Cesium.Math.toDegrees(endCarto.longitude),
                lat: Cesium.Math.toDegrees(endCarto.latitude)
            }
            let endRadians = {
                lon: Cesium.Math.toRadians(endDegree.lon),
                lat: Cesium.Math.toRadians(endDegree.lat)
            }
            points = [
                { lon: startDegree.lon, lat: startDegree.lat },
                { lon: startDegree.lon, lat: endDegree.lat },
                { lon: endDegree.lon, lat: endDegree.lat },
                { lon: endDegree.lon, lat: startDegree.lat },
            ]

            if (beforeEntity != null)
                viewer?.entities.remove(beforeEntity);
            // let poly = getRectangle(startRadians, endRadians, Cesium.Color.YELLOW);
            addEntity("rect", points);

            screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            screenSpaceEventHandler?.setInputAction(handleClickForDrawRect, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
});

let handleClickForDrawPoly = ((click: any) => {
    let clickPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
    if (clickPosition == undefined) return;

    let startCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(clickPosition);
    let startDegree = {
        lon: Cesium.Math.toDegrees(startCarto.longitude),
        lat: Cesium.Math.toDegrees(startCarto.latitude)
    }

    // let Points: any = [];
    points.push(startDegree);

    screenSpaceEventHandler?.setInputAction((movement: any) => {
        var mousePosition: any = viewer?.camera.pickEllipsoid(movement.endPosition);
        if (mousePosition == undefined) return;

        let moveCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(mousePosition);
        let moveDegree = {
            lon: Cesium.Math.toDegrees(moveCarto.longitude),
            lat: Cesium.Math.toDegrees(moveCarto.latitude)
        }

        if (beforeEntity != null)
            viewer?.entities.remove(beforeEntity);
        let tmpPoints = JSON.parse(JSON.stringify(points));
        tmpPoints.push(moveDegree)

        if (tmpPoints.length == 2)
            beforeEntity = getLine([tmpPoints[0], tmpPoints[1]], Cesium.Color.WHITE);
        else
            beforeEntity = getPolygon(tmpPoints, Cesium.Color.WHITE, Cesium.Color.WHITE, 99999);
        viewer?.entities.add(beforeEntity);

        if (beforePoint != null)
            viewer?.entities.remove(beforePoint);
        beforePoint = getPoint(mousePosition, Cesium.Color.LIGHTBLUE);
        viewer?.entities.add(beforePoint);

        screenSpaceEventHandler?.setInputAction((click: any) => {
            if (points.length <= 1) return;

            let endPosition = viewer?.camera.pickEllipsoid(click.position) as Cesium.Cartesian3;
            if (endPosition == undefined) return;
            let endCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(endPosition);
            let endDegree = {
                lon: Cesium.Math.toDegrees(endCarto.longitude),
                lat: Cesium.Math.toDegrees(endCarto.latitude)
            }

            if (beforePoint != null)
                viewer?.entities.remove(beforePoint);
            if (beforeEntity != null)
                viewer?.entities.remove(beforeEntity);
            points.push(endDegree);
            addEntity("poly", points);

            points = [];
            beforeEntity = null;
            screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            screenSpaceEventHandler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
});

let getPoint = ((point: any, color: Cesium.Color, zIndex: any = 99999) => {
    let entity = new Cesium.Entity({
        position: point,
        point: {
            pixelSize: 5,
            color: color,
        }
    });

    return entity;
});

let getLine = ((points: any, color: Cesium.Color, zIndex: any = 99999) => {
    let coords: any = [];
    points.forEach((point: any) => {
        coords.push(point.lon);
        coords.push(point.lat);
    });

    let entity = new Cesium.Entity({
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(coords),
            width: 3,
            material: color,
            zIndex: zIndex,
            clampToGround: true,
        }
    });

    return entity;
});

let getCircle = ((points: any, bgColor: Cesium.Color, lineColor: Cesium.Color, zIndex: any) => {
    let coords: any = [];
    points.forEach((point: any) => {
        coords.push(point.lon);
        coords.push(point.lat);
        coords.push(point.width);
    });

    let entity = new Cesium.Entity({
        position: Cesium.Cartesian3.fromDegrees(coords[0], coords[1]),
        ellipse: {
            semiMinorAxis: coords[2],
            semiMajorAxis: coords[2],
            // granularity : 0.0523598776,
            material: bgColor.withAlpha(0.4),
            outline: true, // height must be set for outline to display
            outlineColor: lineColor.withAlpha(1),
            zIndex: zIndex
        },
    });

    return entity;
});

let getPolygon = ((points: any, bgColor: Cesium.Color, lineColor: Cesium.Color, zIndex: any = 99999) => {
    let coords: any = [];
    points.forEach((point: any) => {
        coords.push(point.lon);
        coords.push(point.lat);
    });

    let entity = new Cesium.Entity({
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(coords)
            ),
            material: bgColor.withAlpha(0.4),
            outline: true,
            outlineColor: lineColor.withAlpha(1),
            zIndex: zIndex
        }
    });

    return entity;
});

let addEntity = ((type: string, points: any) => {
    let length = viewer?.entities.values.length;
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
    data.nodes[0].childNodes.push(node as never);
    layerList?.reRendering();
    reDrawEntity();
});

let reDrawEntity = (() => {
    viewer?.entities.removeAll();
    entities = [];

    let zindex = 0;
    data.nodes.forEach((list: any) => {
        if (list.visible) {
            list.childNodes.forEach((entity: any) => {
                if (entity.visible) {
                    let color = entity.checked ? Cesium.Color.BLUE : Cesium.Color.YELLOW
                    drawEntity(entity.geometry.type, entity.geometry.points, color, zindex++);
                }
            });
        }
    });
});

let drawEntity = ((type: string, points: any, color: any, zindex: any) => {
    console.log(type, points);
    let entity: Cesium.Entity | null = null
    switch (type) {
        case "point":
        case "circle":
            entity = getCircle(points, color, Cesium.Color.BLACK, zindex++);
            break;
        case "line":
            entity = getLine(points, color, zindex++);
            break;
        case "rect":
        case "poly":
            entity = getPolygon(points, color, Cesium.Color.BLACK, zindex++);
            break;
    }

    if (entity != null) {
        viewer?.entities.add(entity);
    }
});

let handleChangeNodes = ((e: any) => {
    if (e.type == "checked" || e.type == "visible" || e.type == "dragdrop")
        reDrawEntity();
});

let handleClickToolbar = ((e: any, type: string) => {
    if (drawType != null) {
        let beforeToolBtn = document.getElementById("tool-" + drawType);
        if (beforeToolBtn?.classList.contains('tool-selected'))
            beforeToolBtn?.classList.remove('tool-selected');
        initDraw();
    }

    if (drawType == type) {
        drawType = null;
        return;
    }

    drawType = type;
    let selectedToolBtn = document.getElementById("tool-" + drawType);
    selectedToolBtn?.classList.add('tool-selected');

    switch (drawType) {
        case "point":
            screenSpaceEventHandler?.setInputAction(handleClickForDrawPoint, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
        case "line":
            screenSpaceEventHandler?.setInputAction(handleClickForDrawLine, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
        case "circle":
            screenSpaceEventHandler?.setInputAction(handleClickForDrawCircle, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
        case "rect":
            screenSpaceEventHandler?.setInputAction(handleClickForDrawRect, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
        case "poly":
            screenSpaceEventHandler?.setInputAction(handleClickForDrawPoly, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
    }
});


onMounted(() => {
    initLayerList();
    initMap();
});

</script>

<style lang="scss">
.cesium-container {
    display: flex;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    .sidebar {
        width: 250px;
        height: 100%;
        background-color: bisque;
    }

    .content {
        width: calc(100% - 250px);
        height: 100%;

        .cesium-map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }

        .cesium-toolbar-list {
            display: flex;
            position: absolute;
            top: calc(10% + 10px);
            left: calc(250px + 10px);
            background-color: gray;
            padding: 1px;
            border-radius: 0.1rem;

            .tool-item {
                background-color: lightgrey;
                padding: 1px;
                border-radius: 0.4rem;
                width: 50px;
                height: 40px;
                line-height: 40px;
                margin: 1px;
                display: inline-block;
                text-align: center;
                text-decoration: none;
            }

            .tool-item:link {
                color: black;
                font-weight: 400;
                background-color: lightcyan;
            }

            .tool-item:hover {
                color: black;
                background-color: lightcyan;
            }

            .tool-item:active {
                color: black;
                background-color: lightgoldenrodyellow;
            }

            .tool-selected {
                color: black;
                background-color: lightcyan;
            }

        }
    }
}

/* layerList cls list */
.node-title-cls-level1 {
    font-size: 1.2rem;
    background-color: lightpink;
    border: 1px solid lightseagreen;
}

.node-title-cls-level2 {
    font-size: 1rem;
    background-color: lightskyblue;
    border: 1px solid lightcoral;
}

.node-title-cls-level3 {
    font-size: 0.8rem;
    background-color: lightgoldenrodyellow;
    border: 1px solid lightpink;
}

.node-title-cls-level4 {
    font-size: 0.8rem;
    background-color: linen;
    border: 1px solid lightgrey;
}

.node-expended-on-btn-cls-level1 {
    background-color: lightblue;
    border-radius: 5px;
}

.node-expended-on-btn-cls-level2 {
    background-color: lightyellow;
    border-radius: 5px;
}

.node-expended-on-btn-cls-level3 {
    background-color: lightcoral;
    border-radius: 5px;
}

.node-visible-on-btn-cls-level1 {
    background-color: lightcyan;
    border-radius: 10px;
}

.node-visible-on-btn-cls-level2 {
    background-color: lightyellow;
    border-radius: 10px;
}

.node-visible-on-btn-cls-level3 {
    background-color: lightcoral;
    border-radius: 10px;
}

/* /layerList cls list */
</style>
