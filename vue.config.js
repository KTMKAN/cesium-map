const path = require('path');

const { defineConfig } = require('@vue/cli-service');

const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = defineConfig({
  configureWebpack: (config) => {
    // Needed to compile multiline strings in Cesium
    config.output.sourcePrefix = '';
    config.amd = {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true,
    };
    // config.node = {
    //     // Resolve node module use of fs
    //     fs: 'empty'
    // };

    config.resolve.alias.cesiumModule = path.resolve(__dirname, cesiumSource);

    config.plugins.push(new NodePolyfillPlugin());

    // Copy Cesium Assets, Widgets, and Workers to a static directory
    config.plugins.push(
      new CopywebpackPlugin({
        patterns: [
          {
            from: path.join(cesiumSource, cesiumWorkers),
            to: 'cesium/Workers',
            toType: 'dir',
          },
          {
            from: path.join(cesiumSource, 'Assets'),
            to: 'cesium/Assets',
            toType: 'dir',
          },
          {
            from: path.join(cesiumSource, 'Widgets'),
            to: 'cesium/Widgets',
            toType: 'dir',
          },
        ],
      })
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('./cesium'),
      })
    );

    console.debug("config", config);
  },

  transpileDependencies: true,
  lintOnSave: false,

  // 프록시 설정
  // devServer: {
  //     proxy: {
  //         "/geoserver": {
  //             target: "http://localhost:9090",
  //         },
  //     },
  // },
})
