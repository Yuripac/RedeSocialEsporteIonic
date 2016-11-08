angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.showRightMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };
})

.controller('LoginCtrl', function ($location, $scope, $ionicModal, $timeout, ngFB, User, Auth) {
  $scope.fbLogin = function () {
    ngFB.login({scope: 'email'}).then(
      function (response) {
        $scope.loading = true;

        if (response.status === 'connected') {
          var accessToken = response.authResponse.accessToken

          User.getApiKey(accessToken)
            .then(function (response) {
              Auth.setUser(response.headers('x-api-key'));
              $location.path('/app/groups');
            })
            .finally(function() {
              $scope.loading = false;
            });
        } else {
          alert('Facebook login failed');
        }
      });
  };
})

.controller('GroupCtrl', function($scope, $location, $ionicLoading, Groups, Auth) {
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...',
      duration: 3000
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };
  $scope.$on('$ionicView.enter', function() {
    Groups.fromUser(Auth.getUser()).then(function(response) {
      $scope.groups = response.data.groups;
    });
  });
})

.controller('GroupDetailCtrl', function($scope, $stateParams, Groups, User) {
  Groups.get($stateParams.groupId).then(function(response) {
    $scope.group = response.data.group;
    $scope.user = User.get();

    var latLng = new google.maps.LatLng($scope.group.activity.latitude, $scope.group.activity.longitude);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    new google.maps.Marker({position: latLng, map: map})
  });
})

.controller('ProfileCtrl', function ($scope, ngFB) {
  ngFB.api({
    path: '/me',
    params: {fields: 'id,name'}
  })
  .then(
    function (user) {
      $scope.user = user;
    },
    function (error) {
      alert('Facebook error: ' + error.error_description);
    }
  );
});
