# require important "toplevel stuff"
# FIXME use "import"
$ = require 'jquery'
_ = require 'underscore'
Backbone = require 'backbone'
Marionette = require 'backbone.marionette'


import "bootstrap"

#import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/scss/font-awesome.scss'

import 'sass/cornsilk.scss'

appConfig = require './app-config'


MainChannel = Backbone.Radio.channel 'global'
MessageChannel = Backbone.Radio.channel 'messages'


console.log("Hello World", appConfig)
