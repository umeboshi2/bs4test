MainPageLayout = require './tklayout'

module.exports =
  # This is the html element to attach
  # the app.  This is to be marionette Region
  appRegion: 'body'
  # This is a marionette view with regions
  layout: MainPageLayout
  # here you can set options to be passed
  # to the layout
  layoutOptions: {}
  # set this to false if you don't need
  # messages
  useMessages: true
  # set useNavbar to false to skip
  # using a navbar in the app
  useNavbar: true
  # this is the brand entry for the navbar
  brand:
    label: 'TBirds'
    url: '#'
  # applet to be used for frontdoor
  frontdoorApplet: 'frontdoor'

  # Does the application have a user?
  # If this is true, a userMenuApp must be set
  # to a toolkit App
  hasUser: false

  # If there is a user, provide a user menu app
  userMenuApp: undefined
  
  # if needLogin is true, frontdoorApplet should
  # provide a #frontdoor/login route which will
  # be displayed by default
  needLogin: false

  # the url for login
  loginUrl: '/#frontdoor/login'
  guestUserName: 'Guest'
  
  # navbar entries is an array of objects
  navbarEntries: []
  # appletRoutes lets you place
  # the applet name as a property
  # with the applet directory name
  # as a value.  The AppRouter should
  # respond to property prefixes urls.
  appletRoutes:
    pages: 'frontdoor'
    

  # authToken is for auth token config
  authToken:
    refreshInterval: '5m'
    refreshIntervalMultiple: 3
    loginUrl: '#frontdoor/login'
    refreshUrl: '/auth/refresh'
    bearerName: 'Bearer'
    requestHeader: 'Authorization'
    tokenKeyName: 'auth_token'
    tokenResponseProperty: 'token'
    
    
