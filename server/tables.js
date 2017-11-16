users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');
userData = new PgSubscription('userData');

liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);
Meteor.publish('allUsers', function () {

  var res = liveDb.select('select * \
                          from v5_classes r \
                          inner join v5_class_students ru on r.r_id = ru.ru_r_id \
                          inner join v5_users u on u_id = ru.ru_u_id');
  return res;

});
Meteor.publish('userMessages', function (userId) {
  if (!userId) {
    return [];
  }

  var res = liveDb.select('select * from v5_engagements \
                          left join v5_engagement_types on a_id = e_type_id \
                          where e_type_id in (6,7) and (e_initiator_u_id = '+userId+' or \
                          e_recipient_u_id = '+userId+')\
                          order by e_id desc \
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
