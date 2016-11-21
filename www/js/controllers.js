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
              $location.path('/app/activities');
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

.controller('GroupCtrl', function($scope, $ionicModal, $location, Group, Sport, Auth) {
  $scope.$on('$ionicView.enter', function() {
    $scope.loading = true;
    Group.getAllByUser().then(function(groups) {
      $scope.groups = groups;
    })
    .finally(function() {
      $scope.loading = false;
    });
  });

  $scope.$on('$ionicView.leave', function() {
    $scope.groups = {};
  })

  $ionicModal.fromTemplateUrl('templates/group_form.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalGroup = modal;
  });

  $scope.openModalGroup = function(group) {
    $scope.groups = {};
    Sport.getAll().then(function(sports) {
      $scope.sports = sports;
    })
    $scope.modalGroup.show();
  };

  $scope.$on('modal.hidden', function() {
    $scope.loading = true;
    Group.getAllByUser()
      .then(function(groups) {
      $scope.groups = groups;
      })
      .finally(function() {
        $scope.loading = false;
      });
  });

  $scope.group = {};
  $scope.submitGroup = function(group) {
    Group.set(group).then(function(response) {
      return response;
    })
  }
})

.controller('GroupDetailCtrl', function($scope, $ionicModal, $stateParams, Group, User, Sport) {
  $scope.createActivity = { checked: false };
  $scope.dateActivity = {};

  Group.get($stateParams.groupId).then(function(group) {
    $scope.group = group;
    $scope.user = User.get();

    $scope.joinActivity = function() {
      Group.joinActivity($scope.group.id).then(function(response) {
        $scope.group.activity.hasUser = true;
      });
    };

    $scope.unjoinActivity = function() {
      Group.unjoinActivity($scope.group.id).then(function(response) {
        $scope.group.activity.hasUser = false;
      });
    };

    $scope.newActivity = function(activity) {
      Group.newActivity($scope.group.id, activity).then(function(response) {
        Group.get($stateParams.groupId).then(function(group) {
          $scope.group = group;
        });
      });
    };

    $scope.updateActivity = function(activity) {
      Group.updateActivity($scope.group.id, activity).then(function(response) {
        Group.get($stateParams.groupId).then(function(group) {
          $scope.group = group;
        });
      });
    };

    $scope.deleteActivity = function() {
      Group.deleteActivity($scope.group.id).then(function(response) {
        Group.get($stateParams.groupId).then(function(group) {
          $scope.group = group;
        });
      })
    }

    $scope.isUserAdmin = function() {
      var userId = parseInt($scope.user);
      return $scope.group.admin_ids.indexOf(userId) > -1;
    }

    Group.getMembers($scope.group.id).then(function(users) {
      $scope.group.members = users;
      $scope.group.hasUser = User.hasUser($scope.group.members, $scope.user)
    });

    if($scope.group.activity) {
      Group.getActivityParticipants($scope.group.id).then(function(users) {
        $scope.group.activity.participants = users;
        $scope.group.activity.hasUser = User.hasUser($scope.group.activity.participants, $scope.user);
      });
    }

    $scope.submitGroup = function(group) {
      Group.update(group).then(function(response) {
        return response;
      })
    }

    // MODAL EDIT GROUP
    $ionicModal.fromTemplateUrl('templates/group_form.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalGroup = modal;
    });
    $scope.openModalGroup = function() {
      Sport.getAll().then(function(sports) {
        $scope.sports = sports;
      })

      $scope.modalGroup.show();
    }

    // MODAL NEW ACTIVITY ADDRESS

    $scope.saveAddress = function(marker) {
      $scope.group.activity = $scope.group.activity || {};
      $scope.group.activity.latitude = $scope.marker.getPosition().lat();
      $scope.group.activity.longitude = $scope.marker.getPosition().lng();
    }

    var initModalMap = function() {
      if($scope.modalMap)
        return $scope.modalMap;
      else {
        return $ionicModal.fromTemplateUrl('templates/activity_form.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modalMap = modal;
        });
      }
    }

    $scope.removeModalMap = function() {
      $scope.modalMap.remove().then(function() {
        $scope.modalMap = null;
      });
    }

    $scope.openModalMap = function() {
      initModalMap().then(function() {
        $scope.modalMap.show();

        var map = new google.maps.Map(document.getElementById('map-search'), {
          center: {lat: -3.7664705, lng: -38.5420017},
          zoom: 11,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Event to add a marker
        var placeMarker = function(position) {
          if($scope.marker) $scope.marker.setMap(null);
          $scope.marker = new google.maps.Marker({ position: position, map: map });
        };

        map.addListener('click', function(event) {
          placeMarker(event.latLng);
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      });
    };
  });
})

.controller('ActivityCtrl', function($scope, $ionicModal, Group, User) {
  $ionicModal.fromTemplateUrl('templates/map.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function(group) {
    $scope.group = group;
    $scope.modal.show();
    var latLng = new google.maps.LatLng(group.activity.latitude, group.activity.longitude);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    new google.maps.Marker({position: latLng, map: map})
  };

  $scope.$on('$ionicView.enter', function() {

    Group.getAllByUser().then(function(groups) {
      $scope.groups = groups.filter(function(group) {
        return group.activity !== null
      });

      $scope.groups.forEach(function(group) {
        Group.getActivityParticipants(group.id).then(function(users) {
          group.activity.hasUser = User.hasUser(users, User.get());
        });
      });

      $scope.joinActivity = function(group) {
        Group.joinActivity(group.id).then(function(response) {
          group.activity.hasUser = true;
        });
      }

      $scope.unjoinActivity = function(group) {
        Group.unjoinActivity(group.id).then(function(response) {
          group.activity.hasUser = false;
        })
      };
    });

  });
})

.controller('SearchCtrl', function($scope, Group) {

});
