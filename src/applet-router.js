/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Marionette = require('backbone.marionette');

const MainChannel = Backbone.Radio.channel('global');
const MessageChannel = Backbone.Radio.channel('messages');

// FIXME
// applets/appname/main needs to be resolvable
// by using webpack resolve alias

// Object to contain registered applets
// Using this prevents a loop when a approute
// is requested but not matched in an AppRouter
// Unless the AppRouter has a match for the requested
// approute, the main router will try to load the
// AppRouter again, causing a loop.
const registered_apps = {};

// FIXME
// This isn't being used currently.  This is here
// when the code develops to the point of being
// able to remove unused child apps to save memory.
MainChannel.reply('main:applet:unregister', function(appname) {
  delete registered_apps[appname];
});
  
MainChannel.reply('main:applet:register', function(appname, applet) {
  registered_apps[appname] = applet;
});
  
MainChannel.reply('main:applet:get-applet', function(appname) {
  registered_apps[appname];
});

class RequireController extends Marionette.Object {
  loadFrontDoor() {
    const config = MainChannel.request('main:app:config');
    const appname = (config != null ? config.frontdoorApplet : undefined) || 'frontdoor';
    const handler = import(`applets/${appname}/main`);
    if (__DEV__) {
      console.log("Frontdoor import()", appname);
    }
    handler.then(Applet => {
      console.log("Applet", Applet);
      const applet = new Applet.default({
        appConfig: config,
        isFrontdoorApplet: true
      });
      MainChannel.request('main:applet:register', appname, applet);
      applet.start();
      if (!Backbone.history.started) { Backbone.history.start(); }
    });
  }
    
  _handleRoute(appname, suffix) {
    let needle, needle1;
    if (__DEV__) {
      console.log("_handleRoute", appname, suffix);
    }
    const config = MainChannel.request('main:app:config');
    if (!appname) {
      console.warn("No applet recognized", appname);
      appname = 'frontdoor';
    }
    if ((needle = appname, Array.from(Object.keys(config.appletRoutes)).includes(needle))) {
      appname = config.appletRoutes[appname];
      console.log("Using defined appletRoute", appname);
    }
    if ((needle1 = appname, Array.from(Object.keys(registered_apps)).includes(needle1))) {
      throw new Error(`Unhandled applet path #${appname}/${suffix}`);
    }
    const handler = import(`applets/${appname}/main`);
    if (__DEV__) {
      console.log("import()", appname);
    }
    handler.then(function(Applet) {
      const applet = new Applet.default({
        appConfig: config});
      MainChannel.request('main:applet:register', appname, applet);
      applet.start();
      Backbone.history.loadUrl();
      }).catch(function(err) {
      if (err.message.startsWith('Cannot find module')) {
        MessageChannel.request('warning', `Bad route ${appname}, ${suffix}!!`);
        return;
      // catch this here for initial page load with invalid
      // subpath
      } else if (err.message.startsWith('Unhandled applet')) {
        MessageChannel.request('warning', err.message);
        return;
      } else {
        throw err;
      }
    });
  }
      
  routeApplet(applet, href) {
    try {
      this._handleRoute(applet, href);
    } catch (err) {
      if (err.message.startsWith('Unhandled applet')) {
        MessageChannel.request('warning', err.message);
        return;
      }
    }
  }
    
  directLink(remainder) {
    if (__DEV__) {
      console.log("directLink", remainder);
    }
  }
}
    
class AppletRouter extends Marionette.AppRouter {
  static initClass() {
    this.prototype.appRoutes = {
      'http*remainder': 'directLink',
      ':applet' : 'routeApplet',
      ':applet/*path': 'routeApplet'
    };
  }

  onRoute(name, path, args) {
    if (name === 'directLink') {
      if (args.length === 2) {
        let url;
        if (args[1] !== null) {
          url = `http${args.join('?')}`;
        } else {
          url = `http${args[0]}`;
        }
        window.open(url, '_blank');
      } else {
        console.log("unhandled directLink");
      }
    }
    if (__DEV__) {
      return console.log("MainRouter.onRoute", name, path, args);
    }
  }
}
AppletRouter.initClass();

MainChannel.reply('main:app:route', function() {
  const controller = new RequireController;
  const router = new AppletRouter({
    controller});
  MainChannel.reply('main-controller', () => controller);
  MainChannel.reply('main-router', () => router);
});
  
module.exports = {
  RequireController,
  AppletRouter
};

  
