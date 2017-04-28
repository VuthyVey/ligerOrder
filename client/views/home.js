Session.setDefault("searchItem", "");
Session.setDefault("orderID", "");
Session.setDefault("userServe", 6);

Template.orderList.helpers({
	//return all of the items frm database
	orders: function(){
		return Orders.find({});	
	}
});

Template.orderList.onCreated(function bodyOnCreated(){
	Meteor.autorun(function() {
		if(Session.get("data_loaded")) {
			Session.set("orderID", Orders.find({}).fetch()[0]._id);
		}
	})
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
})

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
	"keyup #userServeInput" : function () {
		var userServe = $("#userServeInput").val();
		Session.set("userServe", userServe)
	},
	"click #recipeOrderBtn" : function (e, tpl){
		console.log(this._id);
		var x = Recipes.find({"_id": this._id}).fetch()[0];

		var newRecipeOrderObj = {
			"recipeName" : x.name,
			"items": x.ingredients
		}
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
		var userServe = Session.get("userServe")
		var finalAmount = Math.round((amount * (userServe/recipeServe)) * 100) / 100
		return finalAmount;
	}
})