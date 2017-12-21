angular.module('menChat')
  .controller('uploadCtrl', ['$scope', 'Upload', '$timeout', '$rootScope', function ($scope, Upload, $timeout, $rootScope) {
    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
      if ($scope.file != null) {
        $scope.files = [$scope.file];
      }
    });
    $scope.log = '';
    $scope.filesUploaded = [];
    $scope.upload = function (files) {

      if (files && files.length) {

        if (!$rootScope.selectedUser) {
          alert('No user selected');
          return;
        }

        $scope.uploadProgress = true;

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
                  $scope.uploadProgress = false;
                  $scope.filesUploaded.push(file);
                  $scope.$apply();
                });

            };
            reader.readAsBinaryString(file);

            // $scope.policy = {
            //     "expiration": "2017-12-10T12:00:00.000Z",
            //     "conditions": [
            //       {"acl": "public-read" },
            //       {"bucket": "mech-chat" },
            //       ["starts-with", "$key", "user/chat/"],
            //     ]
            //   }

            // Upload.upload({
            //     url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
            //     data: {
            //       file: file
            //     }
            // })

            //Meteor.call('getSignature', )
            var mySignature = ''; //TODO implementation

            // Upload.upload({
            //     url: 'https://mench-chat.s3.amazonaws.com/', //S3 upload url including bucket name
            //     method: 'POST',
            //     data: {
            //         key: file.name, // the key to store the file on S3, could be file name or customized
            //         AWSAccessKeyId: 'AKIAJOLBLKFSYCCYYDRA',
            //         acl: 'public', // sets the access to the uploaded file in the bucket: private, public-read, ...
            //         policy: $scope.policy, // base64-encoded json policy (see article below)
            //         signature: mySignature, // base64-encoded signature based on policy string (see article below)
            //         "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
            //         filename: file.name, // this is needed for Flash polyfill IE8-9
            //         file: file
            //     }
            // })
            // .then(function (resp) {
            //     $timeout(function() {
            //        console.log('Uploaded file response: ', resp);
            //         $scope.log = 'file: ' +
            //         resp.config.data.file.name +
            //         ', Response: ' + JSON.stringify(resp.data) +
            //         '\n' + $scope.log;
            //     });
            // }
            // , function (resp) {
            //       console.log('Error status: ' + resp.status);
            //   }
            // , function (evt) {
            //     var progressPercentage = parseInt(100.0 *
            //     		evt.loaded / evt.total);
            //     $scope.log = 'progress: ' + progressPercentage +
            //     	'% ' + evt.config.data.file.name + '\n' ;
            // });
          }
        }
      }
    };
  }]);
