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
    	var groupedCostsArray = Orders.aggregate([
    	{$unwind: { 
    		path: "$orderedRecipes", "preserveNullAndEmptyArrays": true}
    	},
    	{$group: {
    		"_id": "$_id", 
    		totalRecipeCost: {$sum: "$orderedRecipes.totalRecipeCost"},
    		orderedItems: {$first: "$orderedItems"}
    	}},
    	{$unwind: 
    		{ path: "$orderedItems", "preserveNullAndEmptyArrays": true}
    	},
    	{$group: {
    		"_id": "$_id", 
    		totalItemCost: {$sum: "$orderedItems.totalCost"},
    		totalRecipeCost: {$first: "$totalRecipeCost"}
    	}}
    	]);

    	var total =  (groupedCostsArray[0].totalRecipeCost == null ? 0 :  groupedCostsArray[0].totalRecipeCost) + (groupedCostsArray[0].totalItemCost == null ? 0 : groupedCostsArray[0].totalItemCost) 
 
      	Orders.update({_id: collectionId}, {$set: {"totalOrderCost": total}});//Orders.update({_id: collectionId}, {$set: {"totalOrderCost": total}});

    }
});