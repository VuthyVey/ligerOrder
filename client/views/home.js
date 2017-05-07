Session.setDefault("searchItem", "");
Session.setDefault("orderID", "");
Session.setDefault("userServe", 6);

Template.orderList.helpers({
	//return all of the items frm database
	orders: function(){
		return Orders.find({});	
	}
});

Template.registerHelper('unitFilter', function(amount, unit) {
		
		if(amount < 1 && unit == "kg") {
			return (parseFloat(amount * 1000)) + "g";
		} else {
			return amount + unit
		}
	}
)

Template.orderList.onCreated(function bodyOnCreated(){
	Meteor.autorun(function() {
		if(Session.get("data_loaded")) {
			Session.set("orderID", Orders.find({}).fetch()[0]._id);
			
			Meteor.call('totalOrderCostCalc', Session.get("orderID"))
			

			
			console.log("Hi")
			//console.log("The order List modified", Orders.find({_id: Session.get("orderID")}).fetch());
		

		}
	});
});

Template.orderList.events({
	'click #clearIngredientBtn' : function (e, tpl) {
		var id =  Session.get('orderID');
		console.log(id)
		var name = this.name;
		Orders.update(
		  { _id: id },
		  { $pull: { 'orderedItems': { name: name } } }
		);
	}
});

var x = {
	timeOrdered:1212,
	submittedUser: 'Vuthy',
	for: Date.now(),
	orderedItems: 	[
						{name: "Bannaa",
						kh_name: "ចេក",
						cost: 1,
						unit: "bun",
						amount: 12,
						totalCost: 12
}					],
	totalOrderCost: 212
}

Template.itemsTable.helpers({
	//return all of the items frm database
	items: function(){
		if(Session.get("searchItem") == "") {
			return Items.find({});
		} else {
			return Items.find({$or: [{name: {$regex: eval("/" + Session.get("searchItem") + "/i")}},
								{kh: {$regex: eval("/" + Session.get("searchItem") + "/i")}} ] })
		}
		
	}
});


Template.itemsTable.events({
	//return all of the items from database
	"keyup #searchItemInput": function(e, tpl){
		var searchVal = $('#searchItemInput').val();
		Session.set("searchItem", searchVal);
	},
	"keyup #orderAmountInput" : function(e, tpl) {
		var cost = this.cost;
		var amount = $(e.currentTarget).val();
		var cost = parseFloat(cost);
		
		//input > p > span
		e.currentTarget.nextElementSibling.firstElementChild.innerHTML = "$" + Math.round((amount * cost) * 100) / 100
	},
	'click #addToCart' : function (e, tpl) {
		var ingredientEnName = this.name;
		var ingredientKhName = this.kh;
		var cost = this.cost;
		var unit = this.unit;
		var category = this.category;
		var amount = e.currentTarget.previousSibling.previousElementSibling.value;
		amount = parseFloat(amount);

		var id =  Session.get('orderID');
		var checking = Orders.find({"_id": id, orderedItems: { $elemMatch : {name:ingredientEnName}}}).fetch()[0];
		console.log(checking)
		checking = typeof checking == "object";

		if (checking) {
			Meteor.call('amountUpdateMethod', id, ingredientEnName, amount)
		} else {
			var orderObj = {name: ingredientEnName,
								kh_name: ingredientKhName,
								cost: cost,
								unit: unit,
								amount: amount,
								category: category,
								totalCost: Math.round((amount * cost) * 100) / 100
						}
		try {
			Orders.update({_id: Session.get("orderID")}, { $push: { orderedItems: orderObj }} )
		} catch (e) {
			console.log(e);
		}
		}
		
		e.currentTarget.previousElementSibling.previousElementSibling.value = ""

		//
	}
});

Template.recipesList.helpers({
	Recipes : function () {
		return Recipes.find({});
	}
})

Template.recipesList.events({
	"keyup #userServeInput" : function (e) {
		var userServe = e.currentTarget.value;
		Session.set("userServe", userServe);
		console.log(Session.get("userServe"))
	},
	"click #recipeOrderBtn" : function (e, tpl){
		var x = Recipes.find({"_id": this._id}, {fields: {"ingredients.editing": 0}}).fetch()[0];
		
		var recipeServe = this.serve;
		var userServe = Session.get("userServe");

		var totalRecipeCost = 0;
		var removalIndex = [];
		console.log(x)		

		for (var i = 0; i < x.ingredients.length; i++){
			var amount = parseFloat(x.ingredients[i].amount);
			var itemsObj = Items.find({"name": x.ingredients[i].name, "unit": x.ingredients[i].unit},{fields: {cost: 1, name: 1, unit: 1}}).fetch();
			
			console.log(itemsObj)	

			if(itemsObj.length == 0) {
				removalIndex.push(i)				
			} else {
				console.log("passed")
				var itemCost = itemsObj[0].cost;	

				var totalAmount = Math.round((amount * (userServe/recipeServe)) * 100) / 100;

				x.ingredients[i].amount = totalAmount;
				x.ingredients[i].cost =  itemCost;
				x.ingredients[i].totalCost = Math.round(((totalAmount * itemCost)) * 100) / 100;			
				totalRecipeCost += Math.round(((totalAmount * itemCost)) * 100) / 100;
			}			
		}
		for(var i = 0; i < removalIndex.length; i++) {
				console.log(removalIndex[i])
				x.ingredients.splice(removalIndex[i], 1);
			}
			

		var newRecipeOrderObj = {
			"_id" : Random.id(),
			"recipeName" : x.name,
			"items": x.ingredients,
			"serve": userServe,
			"totalRecipeCost": Math.round((totalRecipeCost) * 100) / 100
		};

	
		
		Session.set('userServe', 6);

		try {
				Orders.update({_id: Session.get("orderID")}, { $push: { "orderedRecipes": newRecipeOrderObj}} )
			} catch (e) {
				console.log(e);
			}	
		}
});


Template.recipeContent.rendered = function () {
  $('.collapsible').collapsible();
};



Template.ingredientInfo.helpers({
	amountWithServe: function(amount, recipeServe) {	
		var userServe = Session.get("userServe");
		var finalAmount = Math.round((amount * (userServe/recipeServe)) * 100) / 100
		return finalAmount;
	}
});

Template.recipeContent.events({
	"click #delRecipeOrderBtn" : function () {
		var orderID = Session.get("orderID");
		var recipeID = this._id;
		Orders.update(
		  { _id: orderID },
		  { $pull: { 'orderedRecipes': { _id: recipeID} } }
		);
	}
});


