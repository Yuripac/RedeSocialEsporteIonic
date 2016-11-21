// var url = "http://localhost:3000/api/v1";
var url = "http://rocky-cliffs-4726.herokuapp.com/api/v1"

angular.module('starter.services', [])

.factory('Auth', function () {
   if (window.localStorage['session']) {
      var _user = JSON.parse(window.localStorage['session']);
   }
   var setUser = function (session) {
      _user = session;
      window.localStorage['session'] = JSON.stringify(_user);
   }

   return {
      setUser: setUser,
      isLoggedIn: function () {
         return _user ? true : false;
      },
      getUser: function () {
         return _user;
      },
      logout: function () {
         window.localStorage.removeItem("session");
         window.localStorage.removeItem("list_dependents");
         _user = null;
      }
   }
})

.factory('Sport', function($http) {
  return {
    getAll: function() {
      return $http.get(url + '/sports').then(function(response) {
        return response.data.sports;
      });
    }
  }
})

.factory('Group', function($http, Auth) {
  var config = { headers: { 'X-Api-Key': Auth.getUser() } };
  return {
    set: function(group) {
      return $http.post(url + '/groups', group, config).then(function(response) {
        return response;
      });
    },

    update: function(group) {
      return $http.put(url + '/groups/' + group.id, group, config).then(function(response) {
        return response;
      });
    },

    getAllByUser: function() {
      return $http.get(url + '/groups/my', config).then(function(response) {
        return response.data.groups
      });
    },

    get: function(groupId) {
      return $http.get(url + '/groups/' + groupId).then(function(response) {
        return response.data.group
      });
    },

    getMembers: function(groupId) {
      return $http.get(url + '/groups/' + groupId + '/members').then(function(response) {
        return response.data.users
      });
    },

    getActivityParticipants: function(groupId) {
      return $http.get(url + '/groups/' + groupId + '/activity/participants').then(function(response) {
        return response.data.users
      });
    },

    joinActivity: function(groupId) {
      return $http.get(url + '/groups/' + groupId + '/activity/join', config);
    },

    unjoinActivity: function(groupId) {
      return $http.get(url + '/groups/' + groupId + '/activity/unjoin', config);
    },

    newActivity: function(groupId, activity) {
      $http.post(url + '/groups/' + groupId + '/activity', activity, config);
    },

    updateActivity: function(groupId, activity) {
      $http.put(url + '/groups/' + groupId + '/activity', activity, config);
    },

    deleteActivity: function(groupId) {
      $http.delete(url + '/groups/' + groupId + '/activity', config);
    }
  }
})

.factory('User', function($http) {
  var user;

  return {
    getApiKey: function(token) {
      var config = { headers: { 'X-Access-Token': token } };

      return $http.get(url + '/login', config)
        .success(function(data) {
          window.localStorage['user'] = data.user.id;
        })
        .error(function(data) {
          alert('Erro na conexão com a aplicação');
        });
    },
    get: function() {
      return window.localStorage['user'];
    },
    hasUser: function hasUser(users, userId) {
      var result = users.find(function(user) {
        return user.id === parseInt(userId);
      });
      return result ? true : false;
    }
  }

})
