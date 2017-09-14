Meteor.subscribe('items');
Meteor.subscribe('recipes');
Meteor.subscribe('system');
Meteor.subscribe('userApartment')
Meteor.startup(function() {
    Session.set('data_loaded', false);
});

Meteor.subscribe('orders', function() {
    //Set the reactive session as true to indicate that the data have been loaded
    Session.set('data_loaded', true);

    var order = Orders.find({
        apartment: Meteor.user().apartment
    }).fetch()[0];

    $('#orderDateSelect').val(order.for);
    console.log(order.for)
    $('#orderDateSelect').select(order.for);
    Session.set("orderID", order._id);
    Meteor.call('totalOrderCostCalc', Session.get("orderID"))
});


const settings = Meteor.settings.google;

if (settings) {
    ServiceConfiguration.configurations.remove({
        service: 'google'
    });

    ServiceConfiguration.configurations.insert({
        service: 'google',
        clientId: settings.clientId,
        secret: settings.secret
    });
}