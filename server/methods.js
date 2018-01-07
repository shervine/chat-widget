
function checkAuth(authObj) {
  if (!authObj) {
    return;
  }
  return authObj.authToken == md5(authObj.bootcampId + salt + authObj.instructorId);
}

var needle = Npm.require('needle');

function postMench(url, data, cb) {
  logger.log('postMench data: ', data, ' to ', url);

  needle('post', url, data)
    .then(function (response) {
      logger.log('postMench response: ', response.body, response.body.status);

      if (response.body.status === 0) {
        logger.log('Error posting to url:', url, response.body);
        logger.log('Response status code:', response.statusCode);

        var errMsg = typeof response.body !== 'undefined' && typeof response.body.message !== 'undefined'
          ? response.body.message : 'Error posting';
        // throw new Meteor.Error(errMsg);
        cb(errMsg);
        return;
      }

      var successMessage = response.body && response.body.message ? response.body.message : 'Success';
      cb(null, successMessage);
    }
    // , function (err) {
    //   console.log(' Error postinttggggg ', err);
    //   cb(err);
    // }
    )
    .catch(function (err) {
      logger.log('Error posting using postMEnch !', err);
      var errMsg = typeof err !== 'undefined' && typeof err.reason !== 'undefined' ? err.reason.toString() : 'General error';
      // throw new Meteor.Error(errMsg);
      logger.log('Error posting using postMEnch formatted msg ', errMsg);
      cb(errMsg);
    });
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
    postMench(postUrl, data, function (err, result) {
      if (err) {
        logger.log('Postingmench got error :', err);
         //throw new Meteor.Error(500, err);
        reject(new Meteor.Error(500, err));
        return;
      }
      resolve(result);
    });
  });

  return responsePromise.await();
}

//var fs = Npm.require('fs');
// var meteor_root = fs.realpathSync(process.cwd() + '/../../../../../');
// var temPath = meteor_root + '/uploads/';
var uuid = Npm.require('node-uuid');

Meteor.methods({
  changeStudentStatus(student, newStatus, authObj, note) {
    if (!checkAuth(authObj)) {
      logger.log('ChangeStatus authentication failed ', authObj);
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
      status_change_note: currentStatus == 4 || currentStatus == 2 ? note : null
    }

    var responsePromise = new Promise((resolve, reject) => {
      postMench(postUrl, data, (err, result) => {
        if (err) {
          reject(new Meteor.Error(500, err));
          return;
        }
        resolve(result);
      });
    });

    return responsePromise.await();
  },
  'uploadFile': function (fileInfo, fileData, authObj, receiverId) {

    if (!checkAuth(authObj)) {
      logger.log('uploadFile authentication failed ', authObj);
      throw new Meteor.Error(500, 'GeneralError');
    }

    logger.log("received file " + fileInfo.name);

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

    var data = {
      bId: authObj.bootcampId,
      messageType: messageType,
      senderId: authObj.instructorId,
      receiverId: receiverId,
      attachUrl: uploadedFilePath
    }

    logger.log('Sending message with attachment :', data);

    var responsePromise = new Promise((resolve, reject) => {
      var sent = sendChatMessage(data, authObj);

      logger.log('sendChatMessage responser ', sent);

      if (sent != 'Message sent') {
        reject(new Meteor.Error(500, sent));
      } else {
        resolve(sent);
      }

    });

    return responsePromise.await();
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