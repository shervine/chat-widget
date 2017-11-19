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
    ' where ru.ru_status >=4 ' +
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
                          b.b_id = ' + bootcampId);
  return res;

  //ba.ba_u_id  = ' + instructorId +
});

var md5 = Npm.require('md5');
var needle = Npm.require('needle');

function postMench(data, done) {
  // the callback is optional, and needle returns a `readableStream` object
  // that triggers a 'done' event when the request/response process is complete.
  needle
    .post('https://mench.co/bot/send_message', data, {
      multipart: true
    })
    .on('readable', function () { /* eat your chunks */
      done();
    })
    .on('done', function (err, resp) {
      console.log('Ready-o!');
      done(err, resp);
    })
}

Meteor.methods({
  'sendChatMessage': function (formData) {

    // var data = {
    //   file: '/home/johnlennon/walrus.png',
    //   content_type: 'image/png'
    // };
    console.log('sendChatMessage formData ', formData);

    var body = formData.message;
    var sender_u_id = '1';
    var receiver_u_id = '112'; //leo
    var message_type = 'text';
    var auth_hash = md5(sender_u_id + receiver_u_id + message_type + '7H6hgtgtfii87');

    var data = {
      'b_id': 1,
      'message_type': message_type, //(Facebook 5 Message Types: text, audio, image, video, file)
      'sender_u_id': formData.senderId,
      'receiver_u_id': formData.receiverId, //The Student ID
      'auth_hash': auth_hash,
      'text_payload': body //IF message_type=TEXT (Maximum 640 characters)
    }

    console.log('post data :', data);

    var syncFunc = Meteor.wrapAsync(postMench);
    var result = syncFunc(data, function(err, res){
        console.log('CB: ', err, res);
        if(err){
          throw new Meteor.Error(500, 'Cannot send message');
        }

        return 'ok';
    });

    console.log('post result ', result);
    return 'ok';
  }
});

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
