# require important "toplevel stuff"
# FIXME use "import"
import $ from 'jquery'
import _ from 'underscore'
import Backbone from 'backbone'
import Marionette from 'backbone.marionette'
import Toolkit from 'marionette.toolkit'
import TopApp from 'tbirds/top-app'

import './applet-router'
#import 'tbirds/applet-router'

import "bootstrap"
#import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/scss/font-awesome.scss'
import 'tbirds/sass/cornsilk.scss'
#import dimport from './di-fill'



import appConfig from './app-config'


misc_menu =
  label: 'Misc Applets'
  menu: [
    {
      label: 'Themes'
      url: '#frontdoor/themes'
    }
  ]

#config.navbarEntries = [ misc_menu ]
appConfig.navbarEntries = [
  {
    label: "Bumblr"
    url: '#bumblr'
  }
  misc_menu
  ]
  



MainChannel = Backbone.Radio.channel 'global'
MessageChannel = Backbone.Radio.channel 'messages'

MainChannel.request 'main:app:route'

app = new TopApp
  appConfig: appConfig

#app.start()

startApp = ->
  app.start()
  console.log("Hello World", appConfig)
  console.log window.__DEV__
  MessageChannel.request 'info', "App Started"
setTimeout startApp, 1000

