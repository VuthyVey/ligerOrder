Meteor.subscribe('items');
Meteor.subscribe('recipes');

Meteor.startup(function() {
     Session.set('data_loaded', false); 
  }); 

  Meteor.subscribe('orders', function(){
     //Set the reactive session as true to indicate that the data have been loaded
     Session.set('data_loaded', true); 
  });
