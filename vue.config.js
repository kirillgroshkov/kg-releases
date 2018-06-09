
const WorkboxPlugin = require('workbox-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

module.exports = {
  lintOnSave: false,

  // NO, because it pollutes index.html with icon urls, etc
  /* pwa: {
    name: 'Releases',
    themeColor: '#448aff',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'no',
    // appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
      exclude: [
        new RegExp('static/'),
        /\.map/,
        /_redirects/,
        /_headers/,
      ],
    }
  },*/

  configureWebpack: {
    plugins: [
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/sw.js',
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        exclude: [
          new RegExp('static/'),
          /\.map/,
          /_redirects/,
          /_headers/,
        ],
        /* manifestTransforms: [
          (entries) => {
            const manifest = entries.map(entry => {
              if (entry.url === '/index.html') entry.url = '/'
              return entry
            })
            return {manifest, warnings: []}
          },
        ],*/
      }),
      /*
      new ManifestPlugin({
        fileName: 'webpackManifest.json',
      }),*/
    ],
  },
}
