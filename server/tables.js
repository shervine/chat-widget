users = new PgSubscription('allUsers');

if (Meteor.isServer) {
  liveDb = new LivePg(process.env.POSTGRESQL_URL, process.env.CHANNEL);
  Meteor.publish('allUsers', function () {
    var res = liveDb.select('SELECT v5_users.*, b.*  FROM v5_users \
                            LEFT JOIN v5_bootcamps b ON b.b_creator_id = v5_users.u_id\
                            ORDER BY v5_users.u_id DESC limit 10');
    return res;
  });
} 