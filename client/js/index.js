if (Meteor.isClient) {
  users = new PgSubscription('allUsers');
  // Template.usersTpl.helpers({
  //   bootcamps() {
  //     return Bootcamps.select();
  //   },
  //   users() {
  //     return users.reactive();
  //   }
  // });
  // Template.usersTpl.events({
  //   "click .user-row" (ev, a) {
  //     console.log('Clicked user ', ev.target.attributes["user-id"]);
  //     var selUserId = ev.target.attributes["user-id"];
  //     //Meteor.call("/selectedUser/" + selUserId, (err) => { err && alert(err) });
  //   }
  // });


  // setTimeout(function () {

  // }, 300);

}

(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .config(function () {
      console.log('angular menchat config triggered');
    })
    .run(function ($rootScope) {
      console.log('angular menchat run triggered');
      $rootScope.users = users.reactive();
    })
    .directive('filter', function () {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
          console.log('directive filter link function ');
          $scope.checkModel = {'left': false , 'right': false};

        },
        templateUrl: 'filter.html'
      }
    })
    .directive('usersList', function ($rootScope) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope, iElem, iAttr) {
          console.log('directive usersList link function ');
          $scope.users = $rootScope.users;
        },
        templateUrl: 'users-list.html'
      }
    })
})();
