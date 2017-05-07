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
    },
    totalOrderCostCalc(collectionId) {
    	var x = Orders.aggregate([
    	{$unwind: { path: "$orderedRecipes", preserveNullAndEmptyArrays: true}},
    	{$unwind: { path: "$orderedItems", preserveNullAndEmptyArrays: true}},
    	{$group: {"_id": "$_id", totalOrderCost: {$sum: "$orderedRecipes.totalRecipeCost"}, totalCost: {$sum: "$orderedItems.totalCost"}}}]);

    	// var y = Orders.aggregate([
    	// {$unwind: { path: "$orderedItems"}},
    	// {$group: {"_id": "$_id", totalCost: {$sum: "$orderedItems.totalCost"}}}
    	// ]);
    	console.log(x)
    	var total =  (x[0].totalOrderCost == null ? 0 :  x[0].totalOrderCost) + (x[0].totalCost == null ? 0 : x[0].totalCost)

    	Orders.update({_id: collectionId}, {$set: {"totalOrderCost": total}});
    	//console.log(x);
    	console.log(total)
    }
});