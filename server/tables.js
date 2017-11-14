users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');

liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);
Meteor.publish('allUsers', function () {
  var res = liveDb.select('SELECT v5_users.*, b.*  FROM v5_users \
                            LEFT JOIN v5_bootcamps b ON b.b_creator_id = v5_users.u_id\
                            ORDER BY v5_users.u_id DESC limit 1000');
  return res;
});
Meteor.publish('userMessages', function (userId) {
  if (!userId) {
    return [];
  }

  console.log('userMessages passed user id ', userId)

  var res = liveDb.select('select e_message, e_creator_id, e_type_id  from v5_engagements \
                          left join v5_engagement_types on a_id = e_type_id \
                          where e_type_id in (6,7) and e_creator_id = '+userId+' \
                          order by e_timestamp desc \
                          limit 100');
  return res;
});
