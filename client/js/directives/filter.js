angular.module('menChat')
.directive('filter', function ($timeout, $rootScope) {
  return {
    restrict: 'E',
    scope: {},
    link: function ($scope) {
      $scope.class = {
        'r_start_date': 'All Channels'
      };
      $scope.statuses = [{val: -10,
                          txt: 'All Statuses'
                          },
                          {
                            val: -2,
                            txt: 'Student Withdrew'
                          },
                          {
                            val: 0,
                            txt: 'Admission Initiated by Student'
                          },
                          {
                            val: 2,
                            txt: 'Pending Admission'
                          },
                          {
                            val: 4,
                            txt: 'Active'
                          }];
      $scope.status = $scope.statuses[0];

      $scope.classes = $rootScope.bootcampClasses.reactive();
      $scope.filterObj = {
                          'class': $scope.class,
                          'status' : $scope.status
                        };

      //broadcast the initial filters
      // $timeout(function(){
      //     $rootScope.$broadcast('new-filter', $scope.filterObj);
      // });

      $scope.selectClass = function (classObj) {
        console.log('Selected class ', classObj);
        $scope.class = typeof classObj !== 'undefined' ? classObj : {
          'r_start_date': 'All'
        };

        $scope.filterObj = {
                            'class': $scope.class,
                            'status' : $scope.status
                            }
        $rootScope.$broadcast('new-filter', $scope.filterObj);
      }
      $scope.selectStatus = function (statusObj) {
        $scope.status = statusObj;
        $scope.filterObj = {
                            'class': $scope.class,
                            'status' : $scope.status
                            }
        $rootScope.$broadcast('new-filter', $scope.filterObj);
      }
    },
    templateUrl: 'filter.html'
  }
})
