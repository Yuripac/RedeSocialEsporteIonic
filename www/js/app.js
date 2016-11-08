// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngOpenFB', 'ngCordova'])

.run(function($ionicPlatform, ngFB) {
  ngFB.init({appId: '1646643982279130'});
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js]

  $ionicConfigProvider.tabs.position('bottom');
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'login': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.logout', {
    url: '/logout',
    resolve: {
      redirect: function($location, Auth) {
        Auth.logout()
        $location.path('/app/login');
      }
    }
  })

  .state('app.profile', {
    url: "/profile",
    views: {
      'tab-profile': {
        templateUrl: "templates/profile.html",
        controller: "ProfileCtrl"
      }
    }
  })

  .state('app.groups', {
    url: '/groups',
    onEnter: function($state, Auth) {
      console.log('Filtrou ' + Auth.isLoggedIn());
      if(!Auth.isLoggedIn())
        $state.go('app.login');
    },
    views: {
      'tab-groups': {
        templateUrl: 'templates/tab-groups.html',
        controller: 'GroupCtrl'
      }
    }
  })

  .state('app.group-detail', {
    url: '/groups/:groupId',
    views: {
      'tab-groups': {
        templateUrl: 'templates/group-detail.html',
        controller: 'GroupDetailCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/groups')

});
