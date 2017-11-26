angular.module('menChat')
.directive('filter', function ($timeout, $rootScope) {
  return {
    restrict: 'E',
    scope: {},
    link: function ($scope) {
      $scope.class = {
        'r_start_date': 'All'
      };
      $scope.statuses = ['All', 'Inactive', 'Pending', 'Active'];
      $scope.status = $scope.statuses[0];
      $scope.classes = $rootScope.bootcampClasses.reactive();

      $scope.selectClass = function (classObj) {
        console.log('Selected class ', classObj);
        $scope.class = typeof classObj !== 'undefined' ? classObj : {
          'r_start_date': 'All'
        };
        $rootScope.$broadcast('filter-class', classObj);
      }
      $scope.selectStatus = function (statusObj) {
        $scope.status = statusObj;
      }
    },
    templateUrl: 'filter.html'
  }
})
