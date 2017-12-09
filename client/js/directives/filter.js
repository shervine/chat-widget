angular.module('menChat')
.directive('filter', function ($timeout, $rootScope) {
  return {
    restrict: 'E',
    scope: {},
    link: function ($scope) {
      $scope.class = {
        'r_start_date': 'All Classes'
      };
      $scope.statuses = [{val: -10,
                          txt: 'All Statuses'
                          },
                          {
                            val: -2,
                            txt: 'Rejected'
                          },
                          {
                            val: 2,
                            txt: 'Pending'
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
      $timeout(function(){
        $rootScope.$broadcast('new-filter', $scope.filterObj);
      }, 200);

      $scope.selectClass = function (classObj) {
        
        $scope.class = typeof classObj !== 'undefined' ? classObj : {
          'r_start_date': 'All Classes'
        };

        if(typeof classObj !== 'undefined') {
           if (classObj.r_status>=-1 &&  classObj.r_status<=1) {
              $scope.status = $scope.statuses[0];
           }
           if (classObj.r_status<-1 || classObj.r_status>1) {
              $scope.status = $scope.statuses[3];
           }
        }

        $scope.filterObj = {
                            'class': $scope.class,
                            'status' : $scope.status
                            }

        console.log('New Filter  ', $scope.filterObj);                   
        $rootScope.$broadcast('new-filter', $scope.filterObj);
      }
      $scope.selectStatus = function (statusObj) {
        $scope.status = statusObj;
        $scope.filterObj = {
                            'class': $scope.class,
                            'status' : $scope.status
                            }
        $rootScope.$broadcast('new-filter', $scope.filterObj);
        console.log('New Filter  ', $scope.filterObj);
      }
    },
    templateUrl: 'filter.html'
  }
})
