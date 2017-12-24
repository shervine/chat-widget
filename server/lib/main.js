Meteor.startup(() => {


});

md5 = Npm.require('md5');
logger = Npm.require('tracer').colorConsole();

//access token salt
salt = 'ChatiFrameS@lt';
saltSendMsg = '7H6hgtgtfii87';
menchApiUrl = 'https://mench.co/api_chat_v1';

liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);