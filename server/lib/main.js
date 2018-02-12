var needle = Npm.require('needle');
md5 = Npm.require('md5');
logger = Npm.require('tracer').colorConsole();

//access token salt
salt = 'ChatiFrameS@lt';
saltSendMsg = '7H6hgtgtfii87';
menchApiUrl = 'https://mench.co/api_chat_v1';
globalMenchConfig = null;
liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);
Meteor.startup(() => {
    fetchMenchConfig(function(data){
        globalMenchConfig = data;
        // logger.log('globalMenchConfig ', globalMenchConfig);
    });
});

fetchMenchConfig = function(cb){
    var configUrl = 'https://mench.co/api_v1/config?token=1f8e38384ddc45d0d19c706e21950643';
  
    needle('get', configUrl)
    .then(function (response) {
    //   logger.log('Got mench config data: ', response.body, response.body.status);
  
      if (response && response.body && response.body.status !== 0) {
        logger.log('Error fetching configuration data from url:', configUrl, response.body);
        cb({});
      }
  
      data = response && response.body && response.body.config ? response.body.config : {};
      cb(data);
    })
    .catch(function (err) {
      logger.log('Error posting using postMEnch !', err);
      var errMsg = typeof err !== 'undefined' && typeof err.reason !== 'undefined' ? err.reason.toString() : 'General error';
      // throw new Meteor.Error(errMsg);
      logger.log('Error posting using postMEnch formatted msg ', errMsg);
      cb({});
    });
  }
