Backbone = require 'backbone'
Marionette = require 'backbone.marionette'
tc = require 'teacup'
ms = require 'ms'

ToolbarView = require 'tbirds/views/button-toolbar'
{ MainController } = require 'tbirds/controllers'
{ ToolbarAppletLayout } = require 'tbirds/views/layout'
navigate_to_url = require 'tbirds/util/navigate-to-url'
scroll_top_fast = require 'tbirds/util/scroll-top-fast'

MainChannel = Backbone.Radio.channel 'global'
MessageChannel = Backbone.Radio.channel 'messages'
DocChannel = Backbone.Radio.channel 'static-documents'
AppChannel = Backbone.Radio.channel 'todos'

toolbarEntries = [
  {
    button: '#list-button'
    label: 'List'
    url: '#frontdoor'
    icon: '.fa.fa-list'
  }
  {
    button: '#calendar-button'
    label: 'Calendar'
    url: '#frontdoor/calendar'
    icon: '.fa.fa-calendar'
  }
  ]


toolbarEntryCollection = new Backbone.Collection toolbarEntries
AppChannel.reply 'get-toolbar-entries', ->
  toolbarEntryCollection


class Controller extends MainController
  _viewResource: (doc) ->
    require.ensure [], () =>
      View = require './views/index-view'
      view = new View
        model: doc
      @layout.showChildView 'content', view
      scroll_top_fast()
    # name the chunk
    , 'frontdoor-view-page'
    
  viewPage: (name) ->
    @setup_layout_if_needed()
    doc = DocChannel.request 'get-document', name
    response = doc.fetch()
    response.done =>
      @_viewResource doc
      return
    response.fail =>
      MessageChannel.request 'danger', 'Failed to get document'
      return
    return
    
  viewIndex: ->
    #@setupLayoutIfNeeded()
    @viewPage 'intro'
    return

  themeSwitcher: ->
    @setup_layout_if_needed()
    require.ensure [], () =>
      View = require './views/theme-switch'
      view = new View
      @layout.showChildView 'content', view
      scroll_top_fast()
    # name the chunk
    , 'frontdoor-view-switch-theme'
    
module.exports = Controller

