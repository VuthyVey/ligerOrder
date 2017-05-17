Session.setDefault("searchItem", "");
Session.setDefault("orderID", "");
Session.setDefault("userServe", 6);

Template.registerHelper('unitFilter', function(amount, unit) {
		if(amount < 1 && unit == "kg") {
			return (parseFloat(amount * 1000)) + "g";
		} else {
			return amount + unit
		}
	}
);

Template.home.rendered = function () {
$('.pushpin-demo-nav').each(function() {
    var $this = $(this);
    var $target = $('#' + $(this).attr('data-target'));
    $this.pushpin({
      top: 62,
      bottom: 10000,
      offset: 0
    });
  });


        
}

Template.orderList.helpers({
	//Return all of the items from database
	orders: function(){
		return Orders.find({});
	}
});


Template.orderList.onCreated(function bodyOnCreated(){
	Meteor.autorun(function() {
		if(Session.get("data_loaded")) {
			//Set the session of orderID to the the first ordering
			Session.set("orderID", Orders.find({}).fetch()[0]._id);		
		}
	});
});

Template.orderList.events({
	'click #orderDelIngre' : function (e, tpl) {
		var id =  Session.get('orderID');
		console.log(id)
		var name = this.name;
		console.log(this.totalCost)
		var totalCost = this.totalCost * -1;

		Orders.update(
		  { _id: id },
		  { $pull: { 'orderedItems': { name: name } }, $inc : {totalOrderCost: totalCost} }
		);
	}
});

var x = {
	timeOrdered:1212,
	submittedUser: 'Vuthy',
	for: Date.now(),
	orderedItems: 	[
		{
			name: "Bannaa",
			kh_name: "ចេក",
			cost: 1,
			unit: "bun",
			amount: 12,
			totalCost: 12
		}
	],
    orderedRecipes: [ 
        {
            "_id" : "FN52M4FPjGLoj8CXf",
            "recipeName" : "Fried Broccoli with Beef",
            "items" : [ 
                {
                    "id" : "cerKc5gK82KbKnppM",
                    "name" : "Beef",
                    "amount" : 0.16,
                    "unit" : "kg",
                    "cost" : 9.5,
                    "totalCost" : 1.52
                }
            ],
            "serve" : "2",
            "totalRecipeCost" : 2.22
        }
    ],

	totalOrderCost: 212
}

Template.itemsTable.helpers({
	// Return all of the items from database
	items: function(){
		// Session searchItem would change when the search input is keyup
		if(Session.get("searchItem") == "") {
			// Return everything from Items
			return Items.find({});
		} else {
			// Return all the matching first digit(s) from Items names or Khmer name
			return Items.find({$or: [{name: {$regex: eval("/" + Session.get("searchItem") + "/i")}},
								{kh: {$regex: eval("/" + Session.get("searchItem") + "/i")}} ] })
		}
		
	}
});


Template.itemsTable.events({
	"keyup #searchItemInput": function(e, tpl){
		// Everytime the search input keyup the the Session change to its value so it return the searched items
		var searchVal = $('#searchItemInput').val();
		Session.set("searchItem", searchVal);
	},
	"keyup #orderAmountInput" : function(e, tpl) {
		// For live view of totalCost of current selecting items
		var cost = this.cost;
		var amount = $(e.currentTarget).val();
		var cost = parseFloat(cost);
		var totalCost = "$" + Math.round((amount * cost) * 100) / 100
		
		//Update the total input to the span
		//input > p > span
		e.currentTarget.nextElementSibling.firstElementChild.innerHTML = totalCost
	},
	'click #addToCart' : function (e, tpl) {
		// Get all of the informations and organize with the variables
		var ingredientEnName = this.name;
		var ingredientKhName = this.kh;
		var cost = this.cost;
		var unit = this.unit;
		var category = this.category;
		//Set amount to input #orderAmountInput value 
		//Not using $('#orderAmountInput').val() becuase there are many of them in the template
		//so we use the sibling elements instead
		var amount = e.currentTarget.previousSibling.previousElementSibling.value;
		amount = parseFloat(amount);

		var orderId =  Session.get('orderID');
		// Find if there any the same ingredients that in Order
		var checking = Orders.find({"_id": orderId, orderedItems: { $elemMatch : {name:ingredientEnName}}}).fetch()[0];
		checking = typeof checking == "object";

		if (checking) {
			// If there is the same ingredients in the order than just increase the amount of the same ingredient to the ordering
			Meteor.call('amountUpdateMethod', orderId, ingredientEnName, amount)
		} else {
			// Just push a new items with orderObj information to orderedItems array
			var totalCost = Math.round((amount * cost) * 100) / 100
			var orderObj = {
				name: ingredientEnName,
				kh_name: ingredientKhName,
				cost: cost,
				unit: unit,
				amount: amount,
				category: category,
				totalCost: totalCost
			}

			try {
				Orders.update({_id: Session.get("orderID")}, { $push: { orderedItems: orderObj}, $inc: {totalOrderCost:totalCost}} )
			} catch (e) {
				console.log(e);
			}
		}
		
		// Clear out #orderAmountInput inputs using sibling 
		e.currentTarget.previousElementSibling.previousElementSibling.value = ""

	}
});

Template.recipesList.helpers({
	// Return all of the Recipes
	Recipes : function () {
		return Recipes.find({});
	}
})

Template.recipesList.events({
	"keyup #userServeInput" : function (e) {
		// Session userServe to the input values
		var userServe = e.currentTarget.value;
		Session.set("userServe", userServe);
	},
	"click #recipeOrderBtn" : function (e, tpl){
		// Get recipe by id and eleminate out editing field in ingredients array
		var recipe = Recipes.find({"_id": this._id}, {fields: {"ingredients.editing": 0}}).fetch()[0];
		
		var recipeServe = this.serve;
		var userServe = Session.get("userServe");
		
		var totalRecipeCost = 0;

		// removalIndex array is for storing the items that are not match with item requirement its name and unit
		var removalIndex = [];

		for (var i = 0; i < recipe.ingredients.length; i++){
			var amount = parseFloat(recipe.ingredients[i].amount);
			//Find if each ingredient match with items name and unit
			var itemsObj = Items.find({"name": recipe.ingredients[i].name, "unit": recipe.ingredients[i].unit},{fields: {cost: 1, name: 1, unit: 1}}).fetch();

			if(itemsObj.length == 0) {
				// We can't splice the array its array
				// So we put the index so we can remove after the for loop
				removalIndex.push(i)				
			} else {
				// Update recipe with new updated data 
				var itemCost = itemsObj[0].cost;	
				var totalAmount = Math.round((amount * (userServe/recipeServe)) * 100) / 100;

				recipe.ingredients[i].amount = totalAmount;
				recipe.ingredients[i].cost =  itemCost;
				recipe.ingredients[i].totalCost = Math.round(((totalAmount * itemCost)) * 100) / 100;			
				totalRecipeCost += Math.round(((totalAmount * itemCost)) * 100) / 100;
			}			
		}
		// Remove out the unwant or miss match items
		for(var i = 0; i < removalIndex.length; i++) {
			recipe.ingredients.splice(removalIndex[i], 1);
		}
		console.log("Hello")	
		totalRecipeCost = Math.round((totalRecipeCost) * 100) / 100
		// Now recipe.ingredients is fresh update (ingredients from recipe == items in Items)
		// Add data to the object and calcuate the costs
		var newRecipeOrderObj = {
			"_id" : Random.id(), // required for deleting
			"recipeName" : recipe.name,
			"items": recipe.ingredients,
			"serve": userServe,
			"totalRecipeCost": totalRecipeCost
		};
		
		// Change the session to its default value
		Session.set('userServe', 6);

		
		try {
				Orders.update({_id: Session.get("orderID")}, { $push: { "orderedRecipes": newRecipeOrderObj}, $inc: { "totalOrderCost": totalRecipeCost }})
			} catch (e) {
				console.log(e);
			}	
		}
});


Template.recipeContent.rendered = function () {
  $('.collapsible').collapsible();
};


Template.orderDay.rendered = function () {

    $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
  });
  $('.timepicker').pickatime({
    default: 'now',
    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
    donetext: 'OK',
  autoclose: false,
  vibrate: true // vibrate the device when dragging clock hand
});



};





Template.ingredientInfo.helpers({
	amountWithServe: function(amount, recipeServe) {	
		var userServe = Session.get("userServe");
		var finalAmount = Math.round((amount * (userServe/recipeServe)) * 100) / 100
		return finalAmount;
	},
	isItemsValid: function(item, unit) {
		var items = Items.find({name:  item, unit: unit}).fetch();

		return items.length == 1;

	}
});

Template.recipeContent.events({
	"click #delRecipeOrderBtn" : function () {
		var orderID = Session.get("orderID");
		var recipeID = this._id;
		console.log(this.totalRecipeCost)
		Orders.update(
		  { _id: orderID },
		  { $inc: {totalOrderCost: this.totalRecipeCost * -1}, $pull: { 'orderedRecipes': { _id: recipeID}}}
		);
	}
});


