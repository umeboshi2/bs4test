# require important "toplevel stuff"
# FIXME use "import"
$ = require 'jquery'
_ = require 'underscore'
Backbone = require 'backbone'
Marionette = require 'backbone.marionette'
Toolkit = require 'marionette.toolkit'


import "bootstrap"

#import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/scss/font-awesome.scss'

import 'sass/cornsilk.scss'

require './applet-router'

appConfig = require './app-config'


MainChannel = Backbone.Radio.channel 'global'
MessageChannel = Backbone.Radio.channel 'messages'


TopApp = Toolkit.App.extend
  options:
    appConfig: {}
  onBeforeStart: ->
    console.log "onBeforeStart called"
    appConfig = @options.appConfig
    MainChannel.reply 'main:app:object', =>
      @
    MainChannel.reply 'main:app:config', ->
      appConfig
    region = new Marionette.Region el: appConfig?.appRegion or 'body'
    @setRegion region
  initPage: ->
    appConfig = @options.appConfig
    AppLayout = appConfig?.layout or MainPageLayout
    layoutOpts = appConfig.layoutOptions
    layout = new AppLayout appConfig.layoutOptions
    @showView layout
  onStart: ->
    @initPage()
    

app = new TopApp
  appConfig: appConfig

#app.start()

startApp = ->
  console.log("Hello World", appConfig)
  app.start()
  
setTimeout startApp, 5000

