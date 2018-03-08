path = require 'path'
$= require 'jquery'
Backbone = require 'backbone'
Marionette = require 'backbone.marionette'
tc = require 'teacup'
marked = require 'marked'

MainChannel = Backbone.Radio.channel 'global'

THEMES = ['vanilla', 'cornsilk', 'BlanchedAlmond', 'DarkSeaGreen',
  'LavenderBlush']

class ThemeSwitchView extends Backbone.Marionette.View
  ui:
    stylesheet: '#main-stylesheet'
    theme: '.theme'
  events: ->
    'click @ui.theme': 'switch_theme'
  templateContext: ->
    ui: @ui
  template: tc.renderable (model) ->
    tc.div ->
      THEMES.forEach (theme) ->
        tc.div ".theme.btn.btn-default", theme
  switch_theme: (event) ->
    target = $(event.target)
    theme = target.html()
    @performSwitch theme
  performSwitch: (theme) ->
    console.log "performSwitch", theme
    MainChannel.request 'main:app:set-theme', theme
    MainChannel.request 'main:app:switch-theme', theme
    
module.exports = ThemeSwitchView
