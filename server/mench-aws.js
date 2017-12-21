// var exports = module.exports = {};

var AWS = Npm.require('aws-sdk');
// var     fs = Npm.require('fs');

AWS.config.update({ accessKeyId: 'AKIAJOLBLKFSYCCYYDRA', secretAccessKey: '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' });

var s3 = new AWS.S3();

menchUpload = function(fileBlob, fileName, cb) {

  var base64data = new Buffer(fileBlob, 'binary');

    s3.putObject({
      Bucket: 'mench-chat',
      Key: fileName,
      Body: base64data,
      ACL: 'public-read'
    },cb);
};

// Read in the file, convert it to base64, store to S3
// fs.readFile('del.txt', function (err, data) {
//   if (err) { throw err; }
//
//   var base64data = new Buffer(data, 'binary');
//
//   var s3 = new AWS.S3();
//   s3.client.putObject({
//     Bucket: 'banners-adxs',
//     Key: 'del2.txt',
//     Body: base64data,
//     ACL: 'public-read'
//   },function (resp) {
//     console.log(arguments);
//     console.log('Successfully uploaded package.');
//   });
//
// });
