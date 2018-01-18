users = new PgSubscription('allUsers');
messages = new PgSubscription('userMessages');
userData = new PgSubscription('userData');
instructorData = new PgSubscription('instructorData');
bootcampClasses = new PgSubscription('bootcampClasses');

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
        // check(filterObj.status.val, Integer)
        statusFilter = " and  ru_status = '"  + filterObj.status.val + "' ";
      }
    }
  
    logger.log('Meteor publish all users with filter ', filterObj);
  
    var res = liveDb.select(`select ru.ru_status, ru.ru_application_survey, u.*, 
                            (select e.e_message from v5_engagements e 
                            left join v5_engagement_types a on a_id = e_type_id 
                            where e_type_id in (6,7) and (e_initiator_u_id = u_id or 
                            e_recipient_u_id = u_id)
                            order by e_timestamp DESC 
                            limit 1) as e_message,

                            (select e.e_timestamp from v5_engagements e 
                              left join v5_engagement_types a on a_id = e_type_id 
                              where e_type_id in (6,7) and (e_initiator_u_id = u_id or 
                              e_recipient_u_id = u_id)
                              order by e_timestamp DESC 
                              limit 1) as e_timestamp,
                            
                              (select e.e_type_id from v5_engagements e 
                                left join v5_engagement_types a on a_id = e_type_id 
                                where e_type_id in (6,7) and (e_initiator_u_id = u_id or 
                                e_recipient_u_id = u_id)
                                order by e_timestamp DESC 
                                limit 1) as e_type_id
                              
                            from v5_classes r 
                            inner join v5_class_students ru on r.r_id = ru.ru_r_id `
                            +' inner join v5_users u on u_id = ru.ru_u_id ' +
                            ' where r.r_b_id = $1 ' +
                            classFilter + statusFilter +
                            ' order by e_timestamp DESC', [bootcampId]);
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
                            where e_type_id in (6,7,12,26,27,29,30,31,32,33,38,41,43,44) and (e_initiator_u_id = $1 or \
                            e_recipient_u_id = $1)\
                            order by e.e_id \
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
                            where \
                            b.b_id = $1 ', [bootcampId]);
    return res;

    // and ba.ba_u_id = $2
  });