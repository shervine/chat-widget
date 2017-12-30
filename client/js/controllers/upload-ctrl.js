angular.module('menChat')
  .controller('uploadCtrl', ['$scope', 'Upload', '$timeout', '$rootScope', 'toastr',
  function ($scope, Upload, $timeout, $rootScope, toastr) {
    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
      if ($scope.file != null) {
        $scope.files = [$scope.file];
      }
    });
    $scope.log = '';
    $scope.upload = function (files) {

      if (files && files.length) {

        if (!$rootScope.selectedUser) {
          alert('No user selected');
          return;
        }

        $scope.uploadProgress = true;
        $rootScope.$broadcast('uploadProgress', true);

        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (!file.$error) {

            console.log('Uploading file ', file);

            var reader = new FileReader();
            reader.onload = function (fileLoadEvent) {
              var uploadFileObj = {
                name: file.name,
                size: file.size,
                type: file.type
              }
              Meteor.call('uploadFile', uploadFileObj, reader.result, 
                 window.authObj, $rootScope.selectedUser.u_id, 
                function (err, response) {
                  console.log('Upload callback: ', err, response);
                  if(err){
                    var errMsg = typeof err !== 'undefined' && typeof err.reason !== 'undefined' ? err.reason.toString() : 'Uploading error';
                    toastr.error(errMsg);
                  } else {
                    toastr.success(response);
                  }
                  $scope.uploadProgress = false;
                  $rootScope.$broadcast('uploadProgress', false);
                  $scope.$apply();
                });
            };
            reader.readAsBinaryString(file);
          }
        }
      }
    };
  }]);
