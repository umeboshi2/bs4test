tc = require 'teacup'

module.exports =tc.renderable () ->
  tc.div '#navbar-view-container'
  tc.div ".container-fluid", ->
    tc.div '.row', ->
      tc.div '#messages'
    tc.div '#applet-content'
    tc.div '#footer'
  tc.div '#modal'
