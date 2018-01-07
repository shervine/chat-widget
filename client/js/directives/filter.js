angular.module('menChat')
  .directive('filter', function ($timeout, $rootScope, $window) {
    return {
      restrict: 'E',
      scope: {},
      link: function ($scope, $rootScope) {
        $scope.bootcampClasses = new PgSubscription('bootcampClasses', window.authObj).reactive();

        $scope.class = {
          'r_start_date': 'All Classes',
        };
        $scope.statuses = [{
          val: -10,
          txt: 'All Statuses',
        },
        {
          val: -2,
          txt: 'Rejected',
        },
        {
          val: 2,
          txt: 'Pending',
        },
        {
          val: 4,
          txt: 'Active',
        }];
        $scope.status = $scope.statuses[0];

        $timeout(function () {
          $scope.classes = $scope.bootcampClasses;
        }, 1000);

        $scope.filterObj = {
          'class': $scope.class,
          'status': $scope.status,
        };

        // broadcast the initial filters
        $timeout(function () {
          $scope.$emit('new-filter', $scope.filterObj);
          $scope.$broadcast('new-filter', $scope.filterObj);
        }, 50);

        $scope.selectClass = function (classObj) {
          $scope.class = typeof classObj !== 'undefined' ? classObj : {
            'r_start_date': 'All Classes',
          };

          if (typeof classObj !== 'undefined') {
            if (classObj.r_status >= -1 && classObj.r_status <= 1) {
              $scope.status = $scope.statuses[0];
            }
            if (classObj.r_status < -1 || classObj.r_status > 1) {
              $scope.status = $scope.statuses[3];
            }
          }

          $scope.filterObj = {
            'class': $scope.class,
            'status': $scope.status,
          };

          console.log('New Filter  ', $scope.filterObj);
          $timeout(function () {
            $scope.$emit('new-filter', $scope.filterObj);
            $scope.$broadcast('new-filter', $scope.filterObj);
          }, 50);
        };
        $scope.selectStatus = function (statusObj) {
          $scope.status = statusObj;
          $scope.filterObj = {
            'class': $scope.class,
            'status': $scope.status,
          };
          $timeout(function () {
            $scope.$emit('new-filter', $scope.filterObj);
            $scope.$broadcast('new-filter', $scope.filterObj);
          }, 50);
        };
      },
      templateUrl: 'filter.html?cbv=' + document.cbv,
    };
  });
