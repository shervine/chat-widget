users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');
userData = new PgSubscription('userData');
instructorData = new PgSubscription('instructorData');
bootcampClasses = new PgSubscription('bootcampClasses');

//access token salt
//&token='.md5($bootcamp['b_id'].'ChatiFrameS@lt'.$udata['u_id']).
const salt = 'ChatiFrameS@lt';
liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);

Meteor.publish('allUsers', function (filterObj, bootcampId, instructorId, authHash) {
  
  check(bootcampId, String);
  check(instructorId, String);

  var classFilter = '';
  var statusFilter = '';

  if(filterObj) {
    if (typeof filterObj.class.r_id !== 'undefined' ) {
      classFilter = ' and  ru.ru_r_id = ' + filterObj.class.r_id.toString();
    };

    if (typeof filterObj.status.val !== 'undefined' && filterObj.status.val != -10 ) {

      if(filterObj.status.txt == 'Rejected') {
        statusFilter = ' and  ru.ru_status < 0 ';
      }  

      if(filterObj.status.txt == 'Pending') {
        statusFilter = ' and  ru_status >= 0 AND ru_status < 4 ';
      }  

      if(filterObj.status.txt == 'Active') {
        statusFilter = ' and  ru_status >= 4 ';
      }  
      
    };
  }

  console.log('Meteor publish all users with filter ', filterObj);

  var res = liveDb.select('select ru.ru_status, u.*, \
                          (select e.e_message from v5_engagements e \
                          left join v5_engagement_types a on a_id = e_type_id \
                          where e_type_id in (6,7) and (e_initiator_u_id = u_id or \
                          e_recipient_u_id = u_id)\
                          order by e_timestamp DESC \
                          limit 1) as e_message \
                          from v5_classes r \
                          inner join v5_class_students ru on r.r_id = ru.ru_r_id \
                          inner join v5_users u on u_id = ru.ru_u_id and u_status > 0 ' +
                          ' where r.r_b_id = $1 ' +
                          classFilter + statusFilter, [bootcampId]);
  return res;
});

Meteor.publish('userMessages', function (userId) {
  if (!userId) {
    return [];
  }

  check(userId, Number);

  var mSubscription = liveDb.select('select e.* from v5_engagements e \
                          left join v5_engagement_types a on a_id = e_type_id \
                          where e_type_id in (6,7) and (e_initiator_u_id = $1 or \
                          e_recipient_u_id = $1)\
                          order by e_timestamp DESC \
                          limit 100', [userId]);

  // Subscription has been stopped, also stop supporting query
  this.onStop(function() {
    mSubscription.stop();
  });

  return mSubscription;
});

Meteor.publish('userData', function (userId) {
  if (!userId) {
    return [];
  }

  check(userId, Number);

  var res = liveDb.select('select * from v5_users where u_id = ' + userId);
  return res;
});

Meteor.publish('instructorData', function (userId) {
  if (!userId) {
    return [];
  }

  check(userId, String);

  var res = liveDb.select('select u_id, u_email, u_website_url, u_image_url, u_lname, \
                          u_fname, u_url_key from v5_users where u_id = $1' ,[userId]);
  return res;
});

Meteor.publish('bootcampClasses', function (bootcampId, instructorId) {
  if (!instructorId && !bootcampId) {
    return [];
  }

  var res = liveDb.select('select distinct b.*, r.* from v5_bootcamps b \
                          inner join v5_classes r on b.b_id = r.r_b_id and r.r_status >= 1\
                          inner join v5_bootcamp_instructors ba on ba.ba_b_id  = b.b_creator_id \
                          and ba.ba_u_id = $2 \
                          where \
                          b.b_id = $1 ', [bootcampId, instructorId]);
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
  'checkToken' : function (token, instructorId, bootcampId){  
    check(instructorId, String);
    check(bootcampId, String);
    check(token, String);

    //&token='.md5($bootcamp['b_id'].'ChatiFrameS@lt'.$udata['u_id']).
    var authToken = md5(bootcampId + salt + instructorId);
    console.log('checkToken: ', bootcampId,  instructorId);
    console.log('checkToken :',token, authToken);
    return authToken == token;
  },
  'sendChatMessage': function (formData) {

    // var data = {
    //   file: '/home/johnlennon/walrus.png',
    //   content_type: 'image/png'
    // };
    console.log('sendChatMessage formData ', formData);

    var auth_hash = md5(formData.senderId.toString() + formData.receiverId.toString() + formData.messageType + '7H6hgtgtfii87');

    var data = {
      'b_id': formData.bId,
      'message_type': formData.messageType, //(Facebook 5 Message Types: text, audio, image, video, file)
      'sender_u_id': formData.senderId,
      'receiver_u_id': formData.receiverId, //The Student ID
      'auth_hash': auth_hash,
      'text_payload': formData.message //IF message_type=TEXT (Maximum 640 characters)
    }
    console.log('formData :', formData);
    console.log('post data :', data);

    var syncFunc = Meteor.wrapAsync(postMench);
    var result = syncFunc(data, function(err, res){
        console.log('CB: ', err, res);
        if(err){
          throw new Meteor.Error(500, 'Cannot send message');
        }

        return 'ok';
    });

    console.log('post result: ', result);
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
