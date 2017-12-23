
var logger = Npm.require('tracer').colorConsole();

users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');
userData = new PgSubscription('userData');
instructorData = new PgSubscription('instructorData');
bootcampClasses = new PgSubscription('bootcampClasses');

//access token salt
//&token='.md5($bootcamp['b_id'].'ChatiFrameS@lt'.$udata['u_id']).
const salt = 'ChatiFrameS@lt';
const saltSendMsg = '7H6hgtgtfii87';
const menchApiUrl = 'https://mench.co/api_chat_v1';

liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);

function checkAuth(authObj) {
  if (!authObj) {
    return;
  }
  return authObj.authToken == md5(authObj.bootcampId + salt + authObj.instructorId);
}

Meteor.publish('allUsers', function (filterObj, authObj) {

  if (!checkAuth(authObj)) {
    logger.log('allUsers Authentication failed ', authObj);
    throw new Meteor.Error(500, 'Error');
  }

  let instructorId = authObj.instructorId;
  let bootcampId = authObj.bootcampId;

  check(bootcampId, String);
  check(instructorId, String);

  var classFilter = '';
  var statusFilter = '';

  if (filterObj) {
    if (typeof filterObj.class.r_id !== 'undefined') {
      classFilter = ' and  ru.ru_r_id = ' + filterObj.class.r_id.toString();
    }

    if (typeof filterObj.status.val !== 'undefined' && filterObj.status.val != -10) {

      if (filterObj.status.txt == 'Rejected') {
        statusFilter = ' and  ru.ru_status < 0 ';
      }

      if (filterObj.status.txt == 'Pending') {
        statusFilter = ' and  ru_status >= 0 AND ru_status < 4 ';
      }

      if (filterObj.status.txt == 'Active') {
        statusFilter = ' and  ru_status >= 4 ';
      }

    }
  }

  logger.log('Meteor publish all users with filter ', filterObj);

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

Meteor.publish('userMessages', function (userId, authObj) {
  if (!userId) {
    return [];
  }

  if (!checkAuth(authObj)) {
    logger.log('userMessages Authentication failed ', authObj);
    throw new Meteor.Error(500, 'Error');
  }

  check(userId, Number);

  var mSubscription = liveDb.select('select e.*, a.a_name from v5_engagements e \
                          left join v5_engagement_types a on a_id = e_type_id \
                          where e_type_id in (6,7,9,12,26,27,28,29,30,31,32,33,38,41,43,44) and (e_initiator_u_id = $1 or \
                          e_recipient_u_id = $1)\
                          order by e_timestamp DESC \
                          limit 100', [userId]);

  // Subscription has been stopped, also stop supporting query
  this.onStop(function () {
    mSubscription.stop();
  });

  return mSubscription;
});

// Meteor.publish('userData', function (userId, authObj) {

//   if (!checkAuth(authObj)) {
//     logger.log('userMessages Authentication failed ', authObj);
//     throw new Meteor.Error(500, 'Error');
//   }

//   if (!userId) {
//     return [];
//   }

//   check(userId, Number);

//   var res = liveDb.select('select * from v5_users where u_id = ' + userId);
//   return res;
// });

Meteor.publish('instructorData', function (userId, authObj) {
  if (!checkAuth(authObj)) {
    logger.log('instructorData Authentication failed ', authObj);
    throw new Meteor.Error(500, 'Error');
  }
  if (!userId) {
    return [];
  }

  check(userId, String);

  var res = liveDb.select('select u_id, u_email, u_website_url, u_image_url, u_lname, \
                          u_fname, u_url_key from v5_users where u_id = $1' , [userId]);
  return res;
});

Meteor.publish('bootcampClasses', function (authObj) {

  if (!checkAuth(authObj)) {
    logger.log('bootcampClasses Authentication failed ', authObj);
    throw new Meteor.Error(500, 'Error');
  }

  let instructorId = authObj.instructorId;
  let bootcampId = authObj.bootcampId;

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

function postMench(url, data, cb) {
  logger.log('postMench data: ', data, ' to ', url);

  needle('post', url, data)
    .then(function (response) {
      logger.log('postMench response: ', response.body, response.body.status);

      if (response.body.status === 0) {
        logger.log('Error posting to url:', url, response.body);
        var errMsg = typeof response.body !== 'undefined' && typeof response.body.message !== 'undefined' 
        ? response.body.message : 'Error posting';
        // throw new Meteor.Error(errMsg);
        cb(errMsg);
        return;
      }

      var successMessage = response.body && response.body.message ? response.body.message : 'Success';
      cb(null, successMessage);
    }, function(err){
        console.log(' Error postinttggggg ', err);
        cb(err);
    });
    // .catch(function (err) {
    //   logger.log('Error posting using postMEnch !', err);
    //   var errMsg = typeof err !== 'undefined' && typeof err.reason !== 'undefined' ? err.reason.toString() : 'General error';
    //   // throw new Meteor.Error(errMsg);
    //   logger.log('Error posting using postMEnch formatted msg ', errMsg);
    //   cb(errMsg);
    // });
}

function sendChatMessage(formData, authObj) {

  if (!checkAuth(authObj)) {
    logger.log('sendChatMessage authentication failed ', authObj);
    throw new Meteor.Error(500, 'Error');
  }

  var auth_hash = md5(formData.senderId.toString() + formData.receiverId.toString() +
    formData.messageType + saltSendMsg);

  var data = {
    'b_id': formData.bId,
    'message_type': formData.messageType, //(Facebook 5 Message Types: text, audio, image, video, file)
    'initiator_u_id': formData.senderId,
    'recipient_u_id': formData.receiverId, //The Student ID
    'auth_hash': auth_hash,
    'text_payload': formData.message ? formData.message : '' //IF message_type=TEXT (Maximum 640 characters)
  }

  if (formData.attachUrl) {
    data.attach_url = formData.attachUrl;
  }

  var postUrl = menchApiUrl + '/send_message';

  var responsePromise = new Promise((resolve, reject) => {
    postMench(postUrl, data, function(err, result) {
      if (err) {
        logger.log('got error :', err);
        // throw new Meteor.Error(500, err);
        reject(err.toString());
        return;
      }
      resolve(result);
    });
  });

  return responsePromise.await();
}

var fs = Npm.require('fs');
// var meteor_root = fs.realpathSync(process.cwd() + '/../../../../../');
// var temPath = meteor_root + '/uploads/';
var uuid = Npm.require('node-uuid');

Meteor.methods({
   changeStudentStatus(student, newStatus, authObj) {
    if (!checkAuth(authObj)) {
      logger.log('uploadFile authentication failed ', authObj);
      throw new Meteor.Error(500, 'General Error');
    }
  
    // logger.log('typeof cb1 ', student, newStatus, authObj);
    if (typeof student === 'undefined') {
      throw new Meteor.Error(500, 'Invalid params');
    }
  
    var studentId = student.u_id;
    var currentStatus = student.ru_status;
    var postUrl = menchApiUrl + '/update_admission_status';
  
    logger.log('changeStudentStatus curr-newStatus', currentStatus, newStatus);
  
    if (currentStatus == 2 && !(newStatus == 4 || newStatus == -1)) {
      throw new Meteor.Error(500, 'Invalid status set');
    }
  
    if (currentStatus == 4 && !(newStatus == -3 || newStatus == 7)) {
      throw new Meteor.Error(500, 'Invalid status set');
    }
  
    data = {
      b_id: authObj.bootcampId,
      initiator_u_id: authObj.instructorId,
      recipient_u_ids: [studentId],
      ru_status: newStatus,
      auth_hash: md5(authObj.instructorId.toString() + newStatus.toString() + saltSendMsg),
      status_change_note: currentStatus == 4 ? '' : null
    }
  
    var responsePromise = new Promise((resolve, reject) => {
      postMench(postUrl, data, (err, result) => {
        if (err) {
          reject(err);
          //throw new Meteor.Error(500, errMsg);
          return;
        }
        resolve(result);
      });
    });
  
    return responsePromise.await();
  
    // logger.log('changeStudentStatus data to send: ', data);
    // var syncFunc = Meteor.wrapAsync(postMench);
    // syncFunc(postUrl, data, (err, result) => {
    //   logger.log('Posted Mench ', err, result);
  
    //   if(err){
    //     callback(err);
    //     // return err;
    //     // throw new Meteor.Error(500, err);
    //   }
  
    //   callback(null,result);
    //   // return result;
    // });
  },
  'uploadFile': function (fileInfo, fileData, authObj, receiverId, cb) {

    if (!checkAuth(authObj)) {
      logger.log('uploadFile authentication failed ', authObj);
      throw new Meteor.Error(500, 'GeneralError');
    }

    logger.log("received file " + fileInfo.name);

    // + " data: " + fileData
    //logger.log('Uploading to :', temPath);
    //fs.writeFileSync(temPath + fileInfo.name, fileData, 'binary');

    var splitted = fileInfo.name.split('.');
    var extension = splitted.slice(-1).pop();

    fileInfo.name = uuid.v4() + '.' + extension;
    var cb1 = (err) => {
      if (err) {
        throw new Meteor.Error(500, 'Cannot upload file');
      }
      logger.log('File uploaded to amazon s3');
      return 'https://s3-us-west-2.amazonaws.com/mench-chat/' + fileInfo.name;
    }

    var syncS3UploadSync = Meteor.wrapAsync(menchUpload);
    var S3syncResponse = syncS3UploadSync(fileData, fileInfo.name, cb1);
    logger.log('Uploaded to Amazon S3 reponse: ', S3syncResponse);

    //send chat message with attached file
    var sendChatSync = Meteor.wrapAsync(sendChatMessage);

    var uploadedFilePath = 'https://s3-us-west-2.amazonaws.com/mench-chat/' + fileInfo.name;

    var messageType;

    if (extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'png' || extension == 'bmp') {
      messageType = 'image';
    }

    if (extension == 'mp4' || extension == 'wmv' || extension == 'avi' || extension == 'mkv' || extension == 'bmp') {
      messageType = 'video';
    }

    if (extension == 'mp3' || extension == 'wav') {
      messageType = 'audio';
    }

    if (!messageType) {
      throw new Meteor.Error(500, 'File type not accepted.');
    }

    var dataObj = {
      bId: authObj.bootcampId,
      messageType: messageType,
      senderId: authObj.instructorId,
      receiverId: receiverId,
      attachUrl: uploadedFilePath
    }

    logger.log('Sending message with attachment :', dataObj);

    var sendChatSyncResponse = sendChatSync(dataObj, cb);
    logger.log('sendChatSyncResponse :', sendChatSyncResponse);
    return uploadedFilePath;
  },
  'checkToken': function (token, instructorId, bootcampId) {
    check(instructorId, String);
    check(bootcampId, String);
    check(token, String);

    var authToken = md5(bootcampId + salt + instructorId);
    logger.log('checkToken bootcampId, instructorId: ', bootcampId, instructorId);
    logger.log('checkToken passedToken, generatedToken:', token, authToken);
    return authToken == token;
  },
  'sendChatMessage': sendChatMessage
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