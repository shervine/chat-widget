angular.module('menChat')
  .directive('userDetails', function ($rootScope, $timeout, toastr) {
    return {
      restrict: 'E',
      scope: {
        selectedUser: '=',
      },
      link: function ($scope, iElem, iAttr) {
        $scope.userDetails = {};

        $scope.userStatuses = [
          { id: '-3', status: 'STUDENT DISPELLED' },
          { id: '-2', status: 'STUDENT WITHDREW' },
          { id: '-1', status: 'ADMISSION REJECTED' },
          { id: '0', status: 'ADMISSION INITIATED' },
          { id: '2', status: 'PENDING ADMISSION' },
          { id: '4', status: 'BOOTCAMP STUDENT' },
          { id: '7', status: 'BOOTCAMP GRADUATE' },
        ];

        $scope.$watch('selectedUser', function (newVal) {
          if (!newVal) {
            return;
          }
          $scope.userDetails = newVal;
          console.log('User details : ', newVal);

          if ($scope.userDetails.ru_status == 4) {
            $scope.userStatuses = [
              { id: '-3', status: 'STUDENT DISPELLED' },
              { id: '4', status: 'BOOTCAMP STUDENT' },
              { id: '7', status: 'BOOTCAMP GRADUATE' }
            ];
          }

          if ($scope.userDetails.ru_status == 2) {
            $scope.userStatuses = [
              { id: '-1', status: 'ADMISSION REJECTED' },
              { id: '2', status: 'PENDING ADMISSION' },
              { id: '4', status: 'BOOTCAMP STUDENT' }
            ];
          }

          if($scope.userDetails.ru_status != 2 && $scope.userDetails.ru_status !=4) {
            $scope.userStatuses = [
              { id: '-3', status: 'STUDENT DISPELLED' },
              { id: '-2', status: 'STUDENT WITHDREW' },
              { id: '-1', status: 'ADMISSION REJECTED' },
              { id: '0', status: 'ADMISSION INITIATED' },
              { id: '2', status: 'PENDING ADMISSION' },
              { id: '4', status: 'BOOTCAMP STUDENT' },
              { id: '7', status: 'BOOTCAMP GRADUATE' },
            ];
          }


          for (let i in $scope.userStatuses) {
            if ($scope.userDetails.ru_status == $scope.userStatuses[i].id) {
              $scope.studentStatus = $scope.userStatuses[i];
            }
          }
        });

        $rootScope.$on('new-filter', function (ev, filterObj) {
          //reseting user details when filter is changed
          $scope.userDetails = {};
          console.log('New filter obj: ', filterObj);
        });


        $scope.changeStudentStatus = function (newStatus) {

          //studentId, classId, currentStatus, newStatus, authObj, cb
          Meteor.call('changeStudentStatus', $scope.userDetails, newStatus.id, window.authObj, function (err, success) {

            console.log('Change status Object ', err, success);

            if (err) {
              var msg = typeof err.reason !== 'undefined' ? err.reason : 'Error changing status';
              toastr.error(msg);
              return;
            }

            toastr.success('Changed student status to ' + newStatus.status);
          });

          // $scope.userDetails.u_id, $scope.classId,
          //   $scope.studentStatus.id, newStatus.id, window.authObj, $scope.cb

        };
      },
      templateUrl: 'user-details.html',
    };
  });
