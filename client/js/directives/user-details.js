angular.module('menChat')
  .directive('userDetails', function ($rootScope, $timeout, toastr, ngDialog) {
    return {
      restrict: 'E',
      scope: {
        selectedUser: '=',
      },
      link: function ($scope, iElem, iAttr) {
        $scope.userDetails = {};
        $scope.changeNote = '';

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
          $scope.changeNote = '';
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

          if ($scope.userDetails.ru_status != 2 && $scope.userDetails.ru_status != 4) {
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
          $scope.changeNote = '';
          console.log('New filter obj: ', filterObj);
        });

        $scope.getStudentApplicationAnswers = function (student) {
          $scope.applicationAnswers = null;
          
          try {
            $scope.applicationAnwers = JSON.parse(student.ru_application_survey);
            console.log($scope.applicationAnwers);
          } catch (err){
            console.log(err);
            toastr.error('Cannot show Application Answers');
            return;
          }
          if($scope.applicationAnwers === null){
            toastr.error('No Application Answers');
            return;
          }

          ngDialog.open({
            template: 'application-answers.html',
            // plain: true,
            scope: $scope,
            width: '80%'
          });
        }

        $scope.changeStudentStatus = function (newStatus) {

          // if (($scope.userDetails.ru_status == 4 || $scope.userDetails.ru_status == 2) &&
          //   (!$scope.changeNote || $scope.changeNote.length < 50)) {
          //   toastr.error('Change note must have at least 50 characters');
          //   return;
          // }

          //studentId, classId, currentStatus, newStatus, authObj, cb
          Meteor.call('changeStudentStatus', $scope.userDetails, newStatus.id,
            window.authObj, $scope.changeNote,
            function (err, success) {
              console.log('Response status: ', err, success);

              if (err) {
                var msg = typeof err.reason !== 'undefined' ? err.reason : 'Error changing status';
                toastr.error(msg);
                return;
              } else {
                toastr.success(success);
                $scope.studentStatus = newStatus;
                $scope.changeNote = '';

                if (newStatus.id == 4) {
                  console.log('Should enable chat ');
                  $('.dimmed').hide();
                }
              }
            });
        };
      },
      templateUrl: 'user-details.html?cbv=' + document.cbv,
    };
  });
