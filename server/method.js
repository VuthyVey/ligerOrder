Meteor.methods({
    amountUpdateMethod(collectionId, ingredientEnName, amount) {
        console.log('Hello the universe')
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
            {$match :{ _id :collectionId }},
            {$project : {orderedItems: 1}},
            {$unwind: { path: "$orderedItems", "preserveNullAndEmptyArrays": false}},
            {$group: {_id: "$_id", totalItemCost: {$sum: "$orderedItems.totalCost"}}}
            ]);


    	// var groupedCostsArray = Orders.aggregate([
    	// {$unwind: { 
    	// 	path: "$orderedRecipes", "preserveNullAndEmptyArrays": true}
    	// },
    	// {$group: {
    	// 	"_id": "$_id", 
    	// 	totalRecipeCost: {$sum: "$orderedRecipes.totalRecipeCost"},
    	// 	orderedItems: {$first: "$orderedItems"}
    	// }},
    	// {$unwind: 
    	// 	{ path: "$orderedItems", "preserveNullAndEmptyArrays": true}
    	// },
    	// {$group: {
    	// 	"_id": "$_id", 
    	// 	totalItemCost: {$sum: "$orderedItems.totalCost"},
    	// 	totalRecipeCost: {$first: "$totalRecipeCost"}
    	// }}
    	// ]);

    	// var total =  (groupedCostsArray[0].totalRecipeCost == null ? 0 :  groupedCostsArray[0].totalRecipeCost) + (groupedCostsArray[0].totalItemCost == null ? 0 : groupedCostsArray[0].totalItemCost) 
        
        
        if (groupedCostsArray.length == 0) {
            var total = 0;
        } else {
            var total = groupedCostsArray[0].totalItemCost;
        }

     	Orders.update({_id: collectionId}, {$set: {"totalOrderCost": total}});//Orders.update({_id: collectionId}, {$set: {"totalOrderCost": total}});

    },
    updateOrderCost(collectionId, value){
    	Orders.update(
		   { "_id": collectionId },
		    { $inc: { "totalOrderCost": value }}
		  
		)
    }
}); 