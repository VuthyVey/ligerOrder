Meteor.publish("items", function() { 
    return Items.find();
});

Meteor.publish("orders", function() { 
    return Orders.find();
});

Meteor.publish("recipes", function() { 
    return Recipes.find();
});

Meteor.publish('userId', function() {
	this.userId;
})

Meteor.publish('userApartment', function() {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {fields: {apartment: 1}})
	} else {
		this.ready();
	}
})

Meteor.publish("system", function() { 
    return System.find();
});