tc = require 'teacup'

module.exports =tc.renderable () ->
  tc.div '#navbar-view-container'
  tc.div ".container-fluid", ->
    tc.div '.row', ->
      tc.div '.col-sm-10.col-sm-offset-1', ->
        tc.div '#messages'
    tc.div '#applet-content.row'
    tc.div '#footer.row'
  tc.div '#modal'
