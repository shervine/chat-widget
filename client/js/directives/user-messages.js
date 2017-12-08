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

          $scope.$on('new-filter', function (ev, filterObj) {
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

        $rootScope.$watch('instructorData', function(newData){
            if (!newData) {
              return;
            }

            $scope.instructorData = newData[0] ? newData[0] : null;
            console.log('Instructor data ', $scope.instructorData);
        });

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
})
.filter('formatMsg', function($sce) {
  return function($e_message) {
    
        // console.log('Formatting msg ', $e_message);

        function linkify(inputText) {
            var replacedText, replacePattern1, replacePattern2, replacePattern3;

            //URLs starting with http://, https://, or ftp://
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

            //Change email addresses to mailto:: links.
            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

            return replacedText;
        }

         function nl2br (str, is_xhtml) {
            // var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
            // return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');

            return str.replace('<br />', "<br>");
         }
        
                if($e_message.indexOf('/attach') >= 0 ){

                  var $attachementsTxt = $e_message.split(' ');
                  console.log('aaa ', $attachementsTxt);
                  if(typeof $attachementsTxt[1] !== 'undefined'){
                    var attachement = $attachementsTxt[1];
                    // attachements = attachements.split(':');
                  } 
                  if(!attachement) {
                    return;
                  }
                  console.log('Attachement: ', attachement);

                      var $segments = attachement.split(':https:');
                      var $sub_segments = 'https:' + $segments[1]; 

                      console.log('Attachement type : ', $segments[0]);
                      if($segments[0]=='image'){
                          $e_message = '<a href="'+$sub_segments+'" target="_blank"><img src="'+
                          $sub_segments+'" style="max-width:90%" /></a>';
                      } else if($segments[0]=='audio'){
                          $e_message = '<audio controls><source src="'+$sub_segments+'" type="audio/mpeg"></audio>';
                      } else if($segments[0]=='video'){
                          $e_message = '<video width="90%" onclick="this.play()" controls><source src="'+
                          $sub_segments+'" type="video/mp4"></video>';
                      } else if($segments[0]=='file'){
                          $e_message = '<a href="'+$sub_segments+'" class="btn btn-primary" target="_blank">'+
                          '<i class="fa fa-cloud-download" aria-hidden="true"></i> Download File</a>';
                      }
                      
              } else {
                  $e_message = linkify($e_message);
              }

              $e_message = nl2br($e_message);
              

              return $sce.trustAsHtml($e_message);
        
  };
});
