users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');
userData = new PgSubscription('userData');
bootcampClasses = new PgSubscription('bootcampClasses');

liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);
Meteor.publish('allUsers', function (classId) {
  
  var classFilter = '';

  if (classId) {
    classFilter = ' and  ru.ru_r_id = ' + classId.toString(); 
  }

  var res = liveDb.select('select * \
                          from v5_classes r \
                          inner join v5_class_students ru on r.r_id = ru.ru_r_id \
                          inner join v5_users u on u_id = ru.ru_u_id ' +
                          ' where ru.ru_status >=4 '+
                          classFilter);
  return res;

});
Meteor.publish('userMessages', function (userId) {
  if (!userId) {
    return [];
  }

  var res = liveDb.select('select * from v5_engagements e \
                          left join v5_engagement_types on a_id = e_type_id \
                          where e_type_id in (6,7) and (e_initiator_u_id = ' + userId + ' or \
                          e_recipient_u_id = ' + userId + ')\
                          order by e_timestamp DESC \
                          limit 100');
  return res;
});

Meteor.publish('userData', function (userId) {
  if (!userId) {
    return [];
  }

  check(userId, Number);

  var res = liveDb.select('select * from v5_users where u_id = ' + userId);
  return res;
});

Meteor.publish('bootcampClasses', function (bootcampId, instructorId) {
  if (!instructorId && !bootcampId) {
    return [];
  }
  
  var res = liveDb.select('select distinct b.*, r.* from v5_bootcamps b \
                          inner join v5_classes r on b.b_id = r.r_b_id and r.r_status >= 1\
                          inner join v5_bootcamp_instructors ba on ba.ba_b_id  = b.b_creator_id \
                          where \
                          b.b_id = ' + bootcampId
                          );
  return res;

  //ba.ba_u_id  = ' + instructorId +
});

// var request = Npm.require('request');

// Meteor.methods({
//   'sendChatMessage' : function(formData) {
//     // var formData = {
//     //   // Pass a simple key-value pair
//     //   my_field: 'my_value',
//     //   // Pass data via Buffers
//     //   my_buffer: new Buffer([1, 2, 3]),
//     //   // Pass data via Streams
//     //   my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
//     //   // Pass multiple values /w an Array
//     //   attachments: [
//     //     fs.createReadStream(__dirname + '/attachment1.jpg'),
//     //     fs.createReadStream(__dirname + '/attachment2.jpg')
//     //   ],
//     //   // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
//     //   // Use case: for some types of streams, you'll need to provide "file"-related information manually.
//     //   // See the `form-data` README for more information about options: https://github.com/form-data/form-data
//     //   custom_file: {
//     //     value:  fs.createReadStream('/dev/urandom'),
//     //     options: {
//     //       filename: 'topsecret.jpg',
//     //       contentType: 'image/jpeg'
//     //     }
//     //   }
//     // };

//     var syncFunc = Meteor.wrapAsync(function(fromData){
//       request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
//         if (err) {
//           return console.error('upload failed:', err);
//           throw new Meteor.Error(500, 'Error sending message');
//         }
//         // console.log('Upload successful!  Server responded with:', body);
//         return body;
//       });
//     });
//     var result = syncFunc(formData);
    
//     console.log('post result ',result);
//     return;

//   }
// });

/**
 * HTTP Header Security
 *
 * enforce HTTP Strict Transport Security (HSTS) to prevent ManInTheMiddle-attacks
 * on supported browsers (all but IE)
 * > http://www.html5rocks.com/en/tutorials/security/transport-layer-security
 *
 * @header Strict-Transport-Security: max-age=2592000; includeSubDomains
 */

var connectHandler = WebApp.connectHandlers; // get meteor-core's connect-implementation

// attach connect-style middleware for response header injection
Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
    return next();
  })
})
