Meteor.publish("items", function() { 
    return Items.find();
});

Meteor.publish("orders", function() { 
    return Orders.find();
});

Meteor.publish("recipes", function() { 
    return Recipes.find();
});