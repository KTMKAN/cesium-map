<template>
    <div class="header-wrap">
        <div class="header-title">
            {{props.title}}
        </div>
        <div class="top-menu-bar">
            <a id="menu1" class="top-menu" href="/cesiumview">CesiumView</a>
            <a id="menu2" class="top-menu" href="/cesiumview2">CesiumView2</a>
            <a id="menu3" class="top-menu" href="/cesiumview3">CesiumView3</a>
            <a id="menu4" class="top-menu" href="/cesiumview4">CesiumView4</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import "@/assets/css/header.css";

import {
    defineComponent, inject,
    onBeforeMount, onBeforeUnmount, onBeforeUpdate,
    onErrorCaptured, onMounted, onUnmounted, onUpdated,
    reactive, ref, toRefs, useAttrs, useSlots, watch, watchEffect
} from "vue";

const props = defineProps({
    title: String
})

watchEffect(() => {
    console.log(props.title);
});

// beforeCreate, created => setup()

onBeforeMount(() => {

});

onMounted(() => {
    let url = window.location.href;
    let menu: HTMLElement | null = null;
    url = url.split("/").pop() as string;
    switch (url) {
        case "cesiumview":
            menu = document.getElementById("menu1");
            break;
        case "cesiumview2":
            menu = document.getElementById("menu2");
            break;
        case "cesiumview3":
            menu = document.getElementById("menu3");
            break;
        case "cesiumview4":
            menu = document.getElementById("menu4");
            break;
    }

    if (menu != null) {
        menu?.classList.add("selected-menu");
    }
});

onBeforeUpdate(() => {

});
onUpdated(() => {

});
onBeforeUnmount(() => { // beforeDestroy

});
onUnmounted(() => { // distroyed

});
onErrorCaptured(() => {

});

</script>
