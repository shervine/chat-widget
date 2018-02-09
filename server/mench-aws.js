// var exports = module.exports = {};

var AWS = Npm.require('aws-sdk');

AWS.config.update({ accessKeyId: 'AKIAJOLBLKFSYCCYYDRA', secretAccessKey: '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' });

var s3 = new AWS.S3();

menchUpload = function(fileBlob, fileName, cb) {

  var base64data = new Buffer(fileBlob, 'binary');
  var metaData = getContentTypeByFile(fileName);
  var ext = fileName.split('.')[1];

    s3.putObject({
      Bucket: 'mench-chat',
      Key: fileName,
      Body: base64data,
      ACL: 'public-read',
      ContentType: metaData
    },cb);
};

function getContentTypeByFile(fileName) {
  var rc = 'application/octet-stream';
  var fn = fileName.toLowerCase();

  if (fn.indexOf('.html') >= 0) rc = 'text/html';
  else if (fn.indexOf('.css') >= 0) rc = 'text/css';
  else if (fn.indexOf('.json') >= 0) rc = 'application/json';
  else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
  else if (fn.indexOf('.png') >= 0) rc = 'image/png';
  else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

  return rc;
}
