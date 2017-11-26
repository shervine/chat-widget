angular.module('menChat')
.directive('userMessages', function ($rootScope, $timeout, $interval) {
  return {
    restrict: 'E',
    scope: {
      selectedUser: '='
    },
    controller: 'chatCtrl',
    link: function ($scope, iElem, iAttr) {
      $scope.msgs = [];
      $scope.$watch('selectedUser', function (newVal) {
        if (!newVal) {
          return;
        }
        $scope.loading = true;

          $scope.$on('filter-class', function (ev, classObj) {
            if ($scope.messages && typeof $scope.messages.stop == 'function') {
              $scope.messages.stop();
            }

            $scope.messages = [];
            $rootScope.selectedUser = null;
            $scope.selectedUser = null;
          });

          //observer for chat messages content to enable scroll down
          //when new content is inserted
          var observer = new MutationObserver(function(mutations) {
             console.log('New content into messages div');
            var d = angular.element('.user-messages');
            d.animate({
              scrollTop: d.prop('scrollHeight')
            }, 1);

        });
        observer.observe(iElem.find('.user-messages')[0], {
            childList: true,
            subtree: true
        });

        if ($scope.messages && typeof $scope.messages.stop == 'function') {
          $scope.messages.stop();
        }

        $scope.messages = new PgSubscription('userMessages', $scope.selectedUser.u_id).reactive();

        $scope.messages.addEventListener('updated', function(diff, data){
            console.log('Subscription updated ', diff, data);
            //remove any previous tmpInserts
            angular.element('.user-messages ul .tmpInsert').remove();
            $scope.$apply();
        });

        var stop;

        $scope.loading = true;
        stop = $interval(function(){
           if (!$scope.messages.ready()){
             return;
           }
           console.log('userMessages populated ', $scope.messages);
           $timeout(function(){
              $scope.$apply();
              var d = angular.element('.user-messages');
              d.animate({
                scrollTop: d.prop('scrollHeight')
              }, 1);

           }, 50);
           $scope.stopInterval();
         }, 60);

         $scope.stopInterval = function() {
          if (angular.isDefined(stop)) {
              $scope.loading = false;
              $interval.cancel(stop);
              stop = undefined;
            }
         };
      });
    },
    templateUrl: 'user-messages.html'
  }
})
.filter('reverse', function() {
  return function(items) {
    if(typeof items === 'undefined') {
      return null;
    }
    return items.slice().reverse();
  };
});
