<template>
    <div class="wrap">
        <div class="header">
            <Header :title="'cesium draw interaction'"></Header>
        </div>
        <div class="container">
            <router-view></router-view>
        </div>
        <div class="footer">

        </div>
    </div>
</template>

<script setup lang="ts">
import Header from "@/components/layouts/Header.vue";

</script>

<style lang="scss">
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
}

.wrap {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;

    .header {
        width: 100%;
        height: 10%;
        background-color: lightblue;
    }

    .container {
        width: 100%;
        height: 80%;
        background-color: azure;
    }

    .footer {
        width: 100%;
        height: 10%;
        background-color: lightgoldenrodyellow;
    }
}
</style>