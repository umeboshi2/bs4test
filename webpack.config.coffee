path = require 'path'

webpack = require 'webpack'

#ManifestPlugin = require 'webpack-manifest-plugin'
#StatsPlugin = require 'stats-webpack-plugin'
#BundleTracker = require 'webpack-bundle-tracker'

#loaders = require 'tbirds/src/webpack/loaders'
#vendor = require 'tbirds/src/webpack/vendor'
#resolve = require './webpack-config/resolve'
#loaderRules = require './loader-rules'

BuildEnvironment = process.env.NODE_ENV

DefinePluginOpts =
  development:
    __DEV__: 'true'
    DEBUG: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  production:
    __DEV__: 'false'
    DEBUG: 'false'
    'process.env':
      'NODE_ENV': JSON.stringify 'production'
    
StatsPluginFilename =
  development: 'stats-dev.json'
  production: 'stats.json'

common_plugins = [
  #new webpack.DefinePlugin DefinePluginOpts[BuildEnvironment]
  # This is to ignore moment locales with fullcalendar
  # https://github.com/moment/moment/issues/2416#issuecomment-111713308
  new webpack.IgnorePlugin /^\.\/locale$/, /moment$/
  ]

AllPlugins = common_plugins.concat []

#webpack.optimization.splitChunks.chunks: "all"

WebPackConfig =
  #entry:
  #  index: './client/entries/index.coffee'
  #  admin: './client/entries/admin.coffee'
  #  foo: './client/entries/foo.coffee'
  #output: WebPackOutput
  plugins: AllPlugins
  module:
    rules: [
      {
        test: /\.css$/
        use: ['style-loader', 'css-loader']
      }
      {
        test: /\.scss$/
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
      {
        test: /\.coffee$/
        use: ['coffee-loader']
      }
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      }
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
        loader: "file-loader"
      }
    ]
  #resolve: resolve
  resolve:
    extensions: [".wasm", ".mjs", ".js", ".json", ".coffee"]
  stats:
    colors: true
    modules: false
    chunks: true
    maxModules: 9999
    #reasons: true
  optimization:
    splitChunks:
      chunks: 'all'



if BuildEnvironment is 'development'
  WebPackConfig.devtool = 'source-map'
  WebPackConfig.devServer =
    host: 'localhost'
    port: 8081
    historyApiFallback: true
    stats:
      colors: true
      modules: false
      chunks: true
      maxModules: 9999
      #reasons: true
      
module.exports = WebPackConfig
