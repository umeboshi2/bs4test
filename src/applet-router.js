var AppletRouter, MainChannel, Marionette, MessageChannel, RequireController, registered_apps,
  indexOf = [].indexOf;

Marionette = require('backbone.marionette');

MainChannel = Backbone.Radio.channel('global');

MessageChannel = Backbone.Radio.channel('messages');

// FIXME
// applets/appname/main needs to be resolvable
// by using webpack resolve alias

// Object to contain registered applets
// Using this prevents a loop when a approute
// is requested but not matched in an AppRouter
// Unless the AppRouter has a match for the requested
// approute, the main router will try to load the
// AppRouter again, causing a loop.
registered_apps = {};

// FIXME
// This isn't being used currently.  This is here
// when the code develops to the point of being
// able to remove unused child apps to save memory.
MainChannel.reply('main:applet:unregister', function(appname) {
  return delete registered_apps[appname];
});

MainChannel.reply('main:applet:register', function(appname, applet) {
  return registered_apps[appname] = applet;
});

MainChannel.reply('main:applet:get-applet', function(appname) {
  return registered_apps[appname];
});

RequireController = class RequireController extends Marionette.Object {
  loadFrontDoor() {
    var appname, config, handler;
    config = MainChannel.request('main:app:config');
    appname = (config != null ? config.frontdoorApplet : void 0) || 'frontdoor';
    handler = import(`applets/${appname}/main`);
    if (__DEV__) {
      console.log("Frontdoor system.import", appname);
    }
    return handler.then((Applet) => {
      var applet;
      applet = new Applet({
        appConfig: config,
        isFrontdoorApplet: true
      });
      MainChannel.request('main:applet:register', appname, applet);
      applet.start();
      if (!Backbone.history.started) {
        return Backbone.history.start();
      }
    });
  }

  _handle_route(appname, suffix) {
    var config, handler;
    if (__DEV__) {
      console.log("_handle_route", appname, suffix);
    }
    config = MainChannel.request('main:app:config');
    if (!appname) {
      console.warn("No applet recognized", appname);
      appname = 'frontdoor';
    }
    if (indexOf.call(Object.keys(config.appletRoutes), appname) >= 0) {
      appname = config.appletRoutes[appname];
      console.log("Using defined appletRoute", appname);
    }
    if (indexOf.call(Object.keys(registered_apps), appname) >= 0) {
      throw new Error(`Unhandled applet path #${appname}/${suffix}`);
    }
    handler = import(`applets/${appname}/main`);
    if (__DEV__) {
      console.log("system.import", appname);
    }
    return handler.then(function(Applet) {
      var applet;
      applet = new Applet({
        appConfig: config
      });
      MainChannel.request('main:applet:register', appname, applet);
      applet.start();
      return Backbone.history.loadUrl();
    }).catch(function(err) {
      if (err.message.startsWith('Cannot find module')) {
        return MessageChannel.request('warning', `Bad route ${appname}, ${suffix}!!`);
      // catch this here for initial page load with invalid
      // subpath
      } else if (err.message.startsWith('Unhandled applet')) {
        return MessageChannel.request('warning', err.message);
      } else {
        throw err;
      }
    });
  }

  routeApplet(applet, href) {
    var err;
    try {
      return this._handle_route(applet, href);
    } catch (error) {
      err = error;
      if (err.message.startsWith('Unhandled applet')) {
        return MessageChannel.request('warning', err.message);
      }
    }
  }

  directLink(remainder) {
    if (__DEV__) {
      return console.log("directLink", remainder);
    }
  }

};

AppletRouter = (function() {
  class AppletRouter extends Marionette.AppRouter {
    onRoute(name, path, args) {
      var url;
      if (name === 'directLink') {
        if (args.length === 2) {
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

  };

  AppletRouter.prototype.appRoutes = {
    'http*remainder': 'directLink',
    ':applet': 'routeApplet',
    ':applet/*path': 'routeApplet'
  };

  return AppletRouter;

}).call(this);

MainChannel.reply('main:app:route', function() {
  var controller, router;
  controller = new RequireController;
  router = new AppletRouter({
    controller: controller
  });
  MainChannel.reply('main-controller', function() {
    return controller;
  });
  return MainChannel.reply('main-router', function() {
    return router;
  });
});

module.exports = {
  RequireController: RequireController,
  AppletRouter: AppletRouter
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0LXJvdXRlci5qcyIsInNvdXJjZXMiOlsiYXBwbGV0LXJvdXRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxlQUFBO0VBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUjs7QUFFYixXQUFBLEdBQWMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFmLENBQXVCLFFBQXZCOztBQUNkLGNBQUEsR0FBaUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFmLENBQXVCLFVBQXZCLEVBSGpCOzs7Ozs7Ozs7Ozs7QUFlQSxlQUFBLEdBQWtCLENBQUEsRUFmbEI7Ozs7OztBQXFCQSxXQUFXLENBQUMsS0FBWixDQUFrQix3QkFBbEIsRUFBNEMsUUFBQSxDQUFDLE9BQUQsQ0FBQTtTQUMxQyxPQUFPLGVBQWdCLENBQUEsT0FBQTtBQURtQixDQUE1Qzs7QUFHQSxXQUFXLENBQUMsS0FBWixDQUFrQixzQkFBbEIsRUFBMEMsUUFBQSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQUE7U0FDeEMsZUFBZ0IsQ0FBQSxPQUFBLENBQWhCLEdBQTJCO0FBRGEsQ0FBMUM7O0FBR0EsV0FBVyxDQUFDLEtBQVosQ0FBa0Isd0JBQWxCLEVBQTRDLFFBQUEsQ0FBQyxPQUFELENBQUE7U0FDMUMsZUFBZ0IsQ0FBQSxPQUFBO0FBRDBCLENBQTVDOztBQUlNLG9CQUFOLE1BQUEsa0JBQUEsUUFBZ0MsVUFBVSxDQUFDLE9BQTNDO0VBQ0UsYUFBZSxDQUFBLENBQUE7QUFDYixRQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7SUFBQSxNQUFBLEdBQVMsV0FBVyxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCO0lBQ1QsT0FBQSxxQkFBVSxNQUFNLENBQUUseUJBQVIsSUFBMkI7SUFDckMsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQSxRQUFBLENBQUEsQ0FBVyxPQUFY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V0FBVyxDQUFDLEtBQVosQ0FBa0IsZ0JBQWxCLEVBQW9DLFFBQUEsQ0FBQSxDQUFBO0FBQ2xDLE1BQUEsVUFBQSxFQUFBO0VBQUEsVUFBQSxHQUFhLElBQUk7RUFDakIsTUFBQSxHQUFTLElBQUksWUFBSixDQUNQO0lBQUEsVUFBQSxFQUFZO0VBQVosQ0FETztFQUVULFdBQVcsQ0FBQyxLQUFaLENBQWtCLGlCQUFsQixFQUFxQyxRQUFBLENBQUEsQ0FBQTtXQUNuQztFQURtQyxDQUFyQztTQUVBLFdBQVcsQ0FBQyxLQUFaLENBQWtCLGFBQWxCLEVBQWlDLFFBQUEsQ0FBQSxDQUFBO1dBQy9CO0VBRCtCLENBQWpDO0FBTmtDLENBQXBDOztBQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxpQkFBQSxFQUFtQixpQkFBbkI7RUFDQSxZQUFBLEVBQWM7QUFEZCIsInNvdXJjZXNDb250ZW50IjpbIk1hcmlvbmV0dGUgPSByZXF1aXJlICdiYWNrYm9uZS5tYXJpb25ldHRlJ1xuXG5NYWluQ2hhbm5lbCA9IEJhY2tib25lLlJhZGlvLmNoYW5uZWwgJ2dsb2JhbCdcbk1lc3NhZ2VDaGFubmVsID0gQmFja2JvbmUuUmFkaW8uY2hhbm5lbCAnbWVzc2FnZXMnXG5cbiMgRklYTUVcbiMgYXBwbGV0cy9hcHBuYW1lL21haW4gbmVlZHMgdG8gYmUgcmVzb2x2YWJsZVxuIyBieSB1c2luZyB3ZWJwYWNrIHJlc29sdmUgYWxpYXNcblxuIyBPYmplY3QgdG8gY29udGFpbiByZWdpc3RlcmVkIGFwcGxldHNcbiMgVXNpbmcgdGhpcyBwcmV2ZW50cyBhIGxvb3Agd2hlbiBhIGFwcHJvdXRlXG4jIGlzIHJlcXVlc3RlZCBidXQgbm90IG1hdGNoZWQgaW4gYW4gQXBwUm91dGVyXG4jIFVubGVzcyB0aGUgQXBwUm91dGVyIGhhcyBhIG1hdGNoIGZvciB0aGUgcmVxdWVzdGVkXG4jIGFwcHJvdXRlLCB0aGUgbWFpbiByb3V0ZXIgd2lsbCB0cnkgdG8gbG9hZCB0aGVcbiMgQXBwUm91dGVyIGFnYWluLCBjYXVzaW5nIGEgbG9vcC5cbnJlZ2lzdGVyZWRfYXBwcyA9IHt9XG5cbiMgRklYTUVcbiMgVGhpcyBpc24ndCBiZWluZyB1c2VkIGN1cnJlbnRseS4gIFRoaXMgaXMgaGVyZVxuIyB3aGVuIHRoZSBjb2RlIGRldmVsb3BzIHRvIHRoZSBwb2ludCBvZiBiZWluZ1xuIyBhYmxlIHRvIHJlbW92ZSB1bnVzZWQgY2hpbGQgYXBwcyB0byBzYXZlIG1lbW9yeS5cbk1haW5DaGFubmVsLnJlcGx5ICdtYWluOmFwcGxldDp1bnJlZ2lzdGVyJywgKGFwcG5hbWUpIC0+XG4gIGRlbGV0ZSByZWdpc3RlcmVkX2FwcHNbYXBwbmFtZV1cblxuTWFpbkNoYW5uZWwucmVwbHkgJ21haW46YXBwbGV0OnJlZ2lzdGVyJywgKGFwcG5hbWUsIGFwcGxldCkgLT5cbiAgcmVnaXN0ZXJlZF9hcHBzW2FwcG5hbWVdID0gYXBwbGV0XG5cbk1haW5DaGFubmVsLnJlcGx5ICdtYWluOmFwcGxldDpnZXQtYXBwbGV0JywgKGFwcG5hbWUpIC0+XG4gIHJlZ2lzdGVyZWRfYXBwc1thcHBuYW1lXVxuICBcblxuY2xhc3MgUmVxdWlyZUNvbnRyb2xsZXIgZXh0ZW5kcyBNYXJpb25ldHRlLk9iamVjdFxuICBsb2FkRnJvbnREb29yOiAtPlxuICAgIGNvbmZpZyA9IE1haW5DaGFubmVsLnJlcXVlc3QgJ21haW46YXBwOmNvbmZpZydcbiAgICBhcHBuYW1lID0gY29uZmlnPy5mcm9udGRvb3JBcHBsZXQgb3IgJ2Zyb250ZG9vcidcbiAgICBoYW5kbGVyID0gU3lzdGVtLmltcG9ydCBcImFwcGxldHMvI3thcHBuYW1lfS9tYWluXCJcbiAgICBpZiBfX0RFVl9fXG4gICAgICBjb25zb2xlLmxvZyBcIkZyb250ZG9vciBzeXN0ZW0uaW1wb3J0XCIsIGFwcG5hbWVcbiAgICBoYW5kbGVyLnRoZW4gKEFwcGxldCkgPT5cbiAgICAgIGFwcGxldCA9IG5ldyBBcHBsZXRcbiAgICAgICAgYXBwQ29uZmlnOiBjb25maWdcbiAgICAgICAgaXNGcm9udGRvb3JBcHBsZXQ6IHRydWVcbiAgICAgIE1haW5DaGFubmVsLnJlcXVlc3QgJ21haW46YXBwbGV0OnJlZ2lzdGVyJywgYXBwbmFtZSwgYXBwbGV0XG4gICAgICBhcHBsZXQuc3RhcnQoKVxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydCgpIHVubGVzcyBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0ZWRcbiAgICAgIFxuICBfaGFuZGxlX3JvdXRlOiAoYXBwbmFtZSwgc3VmZml4KSAtPlxuICAgIGlmIF9fREVWX19cbiAgICAgIGNvbnNvbGUubG9nIFwiX2hhbmRsZV9yb3V0ZVwiLCBhcHBuYW1lLCBzdWZmaXhcbiAgICBjb25maWcgPSBNYWluQ2hhbm5lbC5yZXF1ZXN0ICdtYWluOmFwcDpjb25maWcnXG4gICAgaWYgbm90IGFwcG5hbWVcbiAgICAgIGNvbnNvbGUud2FybiBcIk5vIGFwcGxldCByZWNvZ25pemVkXCIsIGFwcG5hbWVcbiAgICAgIGFwcG5hbWUgPSAnZnJvbnRkb29yJ1xuICAgIGlmIGFwcG5hbWUgaW4gT2JqZWN0LmtleXMgY29uZmlnLmFwcGxldFJvdXRlc1xuICAgICAgYXBwbmFtZSA9IGNvbmZpZy5hcHBsZXRSb3V0ZXNbYXBwbmFtZV1cbiAgICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgZGVmaW5lZCBhcHBsZXRSb3V0ZVwiLCBhcHBuYW1lXG4gICAgaWYgYXBwbmFtZSBpbiBPYmplY3Qua2V5cyByZWdpc3RlcmVkX2FwcHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVuaGFuZGxlZCBhcHBsZXQgcGF0aCAjI3thcHBuYW1lfS8je3N1ZmZpeH1cIlxuICAgIGhhbmRsZXIgPSBTeXN0ZW0uaW1wb3J0IFwiYXBwbGV0cy8je2FwcG5hbWV9L21haW5cIlxuICAgIGlmIF9fREVWX19cbiAgICAgIGNvbnNvbGUubG9nIFwic3lzdGVtLmltcG9ydFwiLCBhcHBuYW1lXG4gICAgaGFuZGxlci50aGVuIChBcHBsZXQpIC0+XG4gICAgICBhcHBsZXQgPSBuZXcgQXBwbGV0XG4gICAgICAgIGFwcENvbmZpZzogY29uZmlnXG4gICAgICBNYWluQ2hhbm5lbC5yZXF1ZXN0ICdtYWluOmFwcGxldDpyZWdpc3RlcicsIGFwcG5hbWUsIGFwcGxldFxuICAgICAgYXBwbGV0LnN0YXJ0KClcbiAgICAgIEJhY2tib25lLmhpc3RvcnkubG9hZFVybCgpXG4gICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICBpZiBlcnIubWVzc2FnZS5zdGFydHNXaXRoICdDYW5ub3QgZmluZCBtb2R1bGUnXG4gICAgICAgIE1lc3NhZ2VDaGFubmVsLnJlcXVlc3QgJ3dhcm5pbmcnLCBcIkJhZCByb3V0ZSAje2FwcG5hbWV9LCAje3N1ZmZpeH0hIVwiXG4gICAgICAjIGNhdGNoIHRoaXMgaGVyZSBmb3IgaW5pdGlhbCBwYWdlIGxvYWQgd2l0aCBpbnZhbGlkXG4gICAgICAjIHN1YnBhdGhcbiAgICAgIGVsc2UgaWYgZXJyLm1lc3NhZ2Uuc3RhcnRzV2l0aCAnVW5oYW5kbGVkIGFwcGxldCdcbiAgICAgICAgTWVzc2FnZUNoYW5uZWwucmVxdWVzdCAnd2FybmluZycsIGVyci5tZXNzYWdlXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVyclxuICAgICAgXG4gIHJvdXRlQXBwbGV0OiAoYXBwbGV0LCBocmVmKSAtPlxuICAgIHRyeVxuICAgICAgQF9oYW5kbGVfcm91dGUgYXBwbGV0LCBocmVmXG4gICAgY2F0Y2ggZXJyXG4gICAgICBpZiBlcnIubWVzc2FnZS5zdGFydHNXaXRoICdVbmhhbmRsZWQgYXBwbGV0J1xuICAgICAgICBNZXNzYWdlQ2hhbm5lbC5yZXF1ZXN0ICd3YXJuaW5nJywgZXJyLm1lc3NhZ2VcbiAgZGlyZWN0TGluazogKHJlbWFpbmRlcikgLT5cbiAgICBpZiBfX0RFVl9fXG4gICAgICBjb25zb2xlLmxvZyBcImRpcmVjdExpbmtcIiwgcmVtYWluZGVyXG4gICAgXG5jbGFzcyBBcHBsZXRSb3V0ZXIgZXh0ZW5kcyBNYXJpb25ldHRlLkFwcFJvdXRlclxuICBhcHBSb3V0ZXM6XG4gICAgJ2h0dHAqcmVtYWluZGVyJzogJ2RpcmVjdExpbmsnXG4gICAgJzphcHBsZXQnIDogJ3JvdXRlQXBwbGV0J1xuICAgICc6YXBwbGV0LypwYXRoJzogJ3JvdXRlQXBwbGV0J1xuXG4gIG9uUm91dGU6IChuYW1lLCBwYXRoLCBhcmdzKSAtPlxuICAgIGlmIG5hbWUgaXMgJ2RpcmVjdExpbmsnXG4gICAgICBpZiBhcmdzLmxlbmd0aCA9PSAyXG4gICAgICAgIGlmIGFyZ3NbMV0gaXNudCBudWxsXG4gICAgICAgICAgdXJsID0gXCJodHRwI3thcmdzLmpvaW4oJz8nKX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdXJsID0gXCJodHRwI3thcmdzWzBdfVwiXG4gICAgICAgIHdpbmRvdy5vcGVuIHVybCwgJ19ibGFuaydcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2cgXCJ1bmhhbmRsZWQgZGlyZWN0TGlua1wiXG4gICAgaWYgX19ERVZfX1xuICAgICAgY29uc29sZS5sb2cgXCJNYWluUm91dGVyLm9uUm91dGVcIiwgbmFtZSwgcGF0aCwgYXJnc1xuXG5NYWluQ2hhbm5lbC5yZXBseSAnbWFpbjphcHA6cm91dGUnLCAoKSAtPlxuICBjb250cm9sbGVyID0gbmV3IFJlcXVpcmVDb250cm9sbGVyXG4gIHJvdXRlciA9IG5ldyBBcHBsZXRSb3V0ZXJcbiAgICBjb250cm9sbGVyOiBjb250cm9sbGVyXG4gIE1haW5DaGFubmVsLnJlcGx5ICdtYWluLWNvbnRyb2xsZXInLCAtPlxuICAgIGNvbnRyb2xsZXJcbiAgTWFpbkNoYW5uZWwucmVwbHkgJ21haW4tcm91dGVyJywgLT5cbiAgICByb3V0ZXJcbiAgICBcbm1vZHVsZS5leHBvcnRzID1cbiAgUmVxdWlyZUNvbnRyb2xsZXI6IFJlcXVpcmVDb250cm9sbGVyXG4gIEFwcGxldFJvdXRlcjogQXBwbGV0Um91dGVyXG5cbiAgXG4iXX0=
