Backbone = require 'backbone'
Marionette = require 'backbone.marionette'
Toolkit = require 'marionette.toolkit'

Controller = require './controller'

MainChannel = Backbone.Radio.channel 'global'
AppChannel = Backbone.Radio.channel 'frontdoor'

###############################
TkApplet = Toolkit.App.extend
  onBeforeStart: ->
    controller = new @Controller
    controller.applet = @
    @router = new @Router
      controller: controller
    if @?.appRoutes
      appRoutes = @appRoutes?() or @appRoutes
      Object.keys(appRoutes).forEach (r) =>
        @router.appRoute r, appRoutes[r]
    # we want to adjust the approuter for frontdoor
    # use here, instead of in the AppRouter class,
    # so hopefully, only one applet handles the "empty route.
    if @options?.isFrontdoorApplet
      method = @options.appConfig?.startFrontdoorMethod or 'start'
      unless '' in Object.keys @router.appRoutes
        if __DEV__
          console.warn "Adding start to TkApplet"
        @router.appRoute '', method
    @_extraRouters = {}
    @initExtraRouters()
  onStop: ->
    if __DEV__
      console.log "Stopping TkApplet", @.isRunning()
  setExtraRouter: (name, routerClass, controllerClass) ->
    c = new controllerClass
    r = new routerClass
      controller: c
    @_extraRouters[name] = r
  initExtraRouters: ->
    extraRouters = @getOption 'extraRouters'
    exRtrs = @getOption 'extraRouters'
    for rtr of extraRouters
      ropts = extraRouters[rtr]
      console.log "rtr", rtr, ropts
      @setExtraRouter rtr, ropts['router'], ropts['controller']
      if __DEV__
        console.log "extra router #{rtr} created"
  getExtraRouter: (name) ->
    @_extraRouters[name]
    
      
################################


class Router extends Marionette.AppRouter
  appRoutes:
    '': 'viewIndex'
    'frontdoor': 'viewIndex'
    'frontdoor/themes': 'themeSwitcher'
    'pages/:name': 'viewPage'
    
class Applet extends TkApplet
  Controller: Controller
  Router: Router

#module.exports = Applet
export default Applet
