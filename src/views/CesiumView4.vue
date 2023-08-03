<template>
    <div class="cesium-container">
        <div class="sidebar">
            <div id="layerList"></div>
        </div>
        <div class="content">
            <div class="cesium-map" id="cesiumMap"></div>

            <div class="cesium-toolbar">
                <a class="tool-toggle-btn on" id="tool-toggle-btn" href="#"
                    v-on:click="(e) => handleClickToolToggleBtn(e)">
                    ◀
                </a>
                <div class="tool-list" id="tool-list">
                    <select id="layerCombobox" class="layerCombobox" v-on:click="(e) => handleClickToolbar(e, 'none')">
                        <option v-for="layer in data.nodes" :value="layer.id" :key="layer.id">{{ layer.name }}</option>
                    </select>
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
                    <span id="fillColorPickerLabel" class="colorPickerLabel">Fill : </span>
                    <input type="color" colorformat="rgba" id="fillColorPicker" class="colorPicker" value="#FFFFFF">
                    <span id="lineColorPickerLabel" class="colorPickerLabel">Line : </span>
                    <input type="color" colorformat="rgba" id="lineColorPicker" class="colorPicker" value="#FFFFFF">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "@vue/runtime-core";

import LayerList from "@/components/layerList/LayerList";
import BasicMap from "@/components/cesiummap/BasicMap";

const data = reactive({
    nodes: [
        {
            checked: false,
            childNodes: [],
            expended: false,
            id: "layer1",
            leaf: false,
            name: "layer1",
            visible: true,
        },
        {
            checked: false,
            childNodes: [],
            expended: false,
            id: "layer2",
            leaf: false,
            name: "layer2",
            visible: true,
        },
        {
            checked: false,
            childNodes: [],
            expended: false,
            id: "layer3",
            leaf: false,
            name: "layer3",
            visible: true,
        }
    ]
});

let layerList: LayerList | null = null;
let basicMap: BasicMap | null = null;

let initLayerList = (() => {
    let container = document.getElementById("layerList");
    if (container == null) return;

    layerList = new LayerList(container, {
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
    basicMap = new BasicMap("cesiumMap", {
        nodes: data.nodes,
    });
});

let initToolBar = (() => {
    let fillColorPickerElm = document.getElementById("fillColorPicker") as HTMLInputElement;
    fillColorPickerElm.onchange = ((e) => handleChangeFillColor(e));

    let lineColorPickerElm = document.getElementById("lineColorPicker") as HTMLInputElement;
    lineColorPickerElm.onchange = ((e) => handleChangeLineColor(e));
});

let handleChangeNodes = ((e: any) => {
    if (e.type == "checked" || e.type == "visible" || e.type == "dragdrop")
        basicMap?.reDrawEntity();
});

let handleAddNode = ((e: any) => {
    let layerComboboxElm = document.getElementById('layerCombobox') as HTMLSelectElement;
    let idx = data.nodes.findIndex(node => node.id == layerComboboxElm.value);

    data.nodes[idx].childNodes.push(e.node as never);

    basicMap?.reDrawEntity();
    layerList?.reRendering();
});

let handleClickToolToggleBtn = ((e: any) => {
    handleClickToolbar(e, "none");

    let toggleBtnElm = document.getElementById("tool-toggle-btn");
    let toolListElm = document.getElementById("tool-list");
    if (toggleBtnElm?.classList.contains('on')) {
        toggleBtnElm.classList.remove('on');
        toggleBtnElm.classList.add('off');
        toggleBtnElm.innerHTML = "▶";
        toolListElm?.classList.add('hide');
    } else if (toggleBtnElm != null && toolListElm != null) {
        toggleBtnElm.classList.remove('off');
        toggleBtnElm.classList.add('on');
        toggleBtnElm.innerHTML = "◀";
        toolListElm.classList.remove('hide');
    }
});

let handleClickToolbar = ((e: any, type: string) => {
    let beforeDrawType = basicMap?.getDrawType();
    if (beforeDrawType != null) {
        let beforeToolBtn = document.getElementById("tool-" + basicMap?.getDrawType());
        if (beforeToolBtn?.classList.contains('tool-selected'))
            beforeToolBtn?.classList.remove('tool-selected');

        basicMap?.changeMode(BasicMap.MODE.SELECT);
    }

    if (type != 'none' && beforeDrawType != type) {
        basicMap?.changeMode(BasicMap.MODE.DRAW, { drawType: type });
        let fillColorPickerElm = document.getElementById("fillColorPicker") as HTMLInputElement
        basicMap?.setDrawFillColor(fillColorPickerElm.value);
        let lineColorPickerElm = document.getElementById("lineColorPicker") as HTMLInputElement
        basicMap?.setDrawLineColor(lineColorPickerElm.value);

        let selectedToolBtn = document.getElementById("tool-" + type);
        selectedToolBtn?.classList.add('tool-selected');
    }
});

let handleChangeFillColor = ((e: any) => {
    basicMap?.setDrawFillColor(e.target.value);
});

let handleChangeLineColor = ((e: any) => {
    basicMap?.setDrawLineColor(e.target.value);
});

onMounted(() => {
    initLayerList();
    initMap();
    initToolBar();

    layerList?.on("change", handleChangeNodes);
    basicMap?.on("addNode", handleAddNode);
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

        .cesium-toolbar {
            display: flex;
            position: absolute;
            top: calc(10% + 10px);
            left: calc(250px + 10px);
            background-color: gray;
            padding: 1px;
            border-radius: 0.1rem;

            .tool-toggle-btn {
                background-color: lightcyan;
                padding: 1px;
                border-radius: 0.4rem;
                width: 30px;
                height: 40px;
                line-height: 40px;
                margin: 1px;
                display: inline-block;
                text-align: center;
                text-decoration: none;
            }

            .tool-toggle-btn:link {
                color: black;
                font-weight: 400;
                background-color: lightskyblue;
            }

            .tool-toggle-btn:hover {
                color: black;
                background-color: lightskyblue;
            }

            .tool-toggle-btn:active {
                color: black;
                background-color: lightgoldenrodyellow;
            }

            .tool-list {
                display: flex;

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

                .layerCombobox {
                    background-color: lightblue;
                    padding: 1px;
                    border-radius: 0.4rem;
                    width: 150px;
                    height: 40px;
                    line-height: 40px;
                    margin: 1px;
                    display: inline-block;
                    text-align: center;
                    text-decoration: none;
                }

                .colorPickerLabel {
                    background-color: lightblue;
                    padding: 1px;
                    border-radius: 0.7rem 0rem 0rem 0.7rem;
                    width: 50px;
                    height: 40px;
                    line-height: 40px;
                    margin: 1px;
                    display: inline-block;
                    text-align: center;
                    text-decoration: none;
                    font-size: 1rem;
                }

                .colorPicker {
                    background-color: lightblue;
                    padding: 1px;
                    border-radius: 0rem 0.5rem 0.5rem 0rem;
                    width: 50px;
                    height: 40px;
                    line-height: 40px;
                    margin: 1px;
                    display: inline-block;
                    text-align: center;
                    text-decoration: none;
                }
            }

            .hide {
                display: none;
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
