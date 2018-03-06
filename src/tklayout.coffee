Marionette = require 'backbone.marionette'

class MainPageLayout extends Marionette.View
  template: require './templates/tklayout.coffee'

  regions:
    messages: '#messages'
    navbar: '#navbar-view-container'
    modal: '#modal'
    applet: '#applet-content'
    footer: '#footer'
    
module.exports = MainPageLayout


