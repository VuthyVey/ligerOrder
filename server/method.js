Meteor.methods({
    amountUpdateMethod(collectionId, ingredientEnName, amount) {
    	var currentItem = Orders.find({ _id: collectionId, "orderedItems.name": ingredientEnName},
    				{fields: {"orderedItems.$": 1, _id: 0}}).fetch()[0].orderedItems[0];
    	
    	currentItem.amount += amount;

        Orders.update(
			{ _id: collectionId, "orderedItems.name": ingredientEnName},
			{ $set: { "orderedItems.$.amount" : currentItem.amount, "orderedItems.$.totalCost": currentItem.amount * currentItem.cost} }
		)
		console.log("done");
    }
});