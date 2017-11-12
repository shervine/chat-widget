if (Meteor.isClient) {
  users = new PgSubscription('allUsers');
  Template.usersTpl.helpers({
    bootcamps() {
      return Bootcamps.select();
    },
    users() {
      return users.reactive();
    }
  });
  Template.usersTpl.events({
    "click .user-row"(ev, a) {
      console.log('Clicked user ', ev.target.attributes["user-id"]);
      var selUserId = ev.target.attributes["user-id"];
      //Meteor.call("/selectedUser/" + selUserId, (err) => { err && alert(err) });
    }
  });
} 