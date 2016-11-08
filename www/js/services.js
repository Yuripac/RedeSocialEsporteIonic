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

.factory('Groups', function($http) {
  var url = 'http://localhost:3000/api/v1';

  return {
    fromUser: function(apiKey) {
      var config = { headers: { 'X-Api-Key': apiKey } };

      return $http.get(url + '/groups/my', config)
    },
    get: function(groupId) {
      return $http.get(url + '/groups/' + groupId);
    }
  }
})

.factory('User', function($http) {
  var urlUser = 'http://rocky-cliffs-4726.herokuapp.com/api/v1/login';
  urlUser = 'http://localhost:3000/api/v1/login';

  var user;

  return {
    getApiKey: function(token) {
      var config = { headers: { 'X-Access-Token': token } };

      return $http.get(urlUser, config)
        .success(function(data) {
          window.localStorage['user'] = data.user.id;
        })
        .error(function(data) {
          alert('Erro na conexão com a aplicação');
        });
    },
    get: function() {
      return window.localStorage['user'];
    }
  }
})
