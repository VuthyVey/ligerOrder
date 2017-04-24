Meteor.methods({
    amountUpdateMethod(collectionId, ingredientEnName, amount) {
    	var currentAmount = Orders.find({ _id: collectionId, "orderedItems.name": ingredientEnName},
    				{fields: {"orderedItems.$": 1, _id: 0}}).fetch()[0].orderedItems[0].amount;
    	currentAmount += amount;
        Orders.update(
			{ _id: collectionId, "orderedItems.name": ingredientEnName},
			{ $set: { "orderedItems.$.amount" : currentAmount } }
		)
		console.log("done");
    }
});