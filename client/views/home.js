Session.setDefault("searchItem", "");
Session.setDefault("orderID", "");

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
		var amount = e.currentTarget.previousSibling.previousElementSibling.value;
		amount = parseFloat(amount)
		var orderObj = {name: ingredientEnName,
								kh_name: ingredientKhName,
								cost: cost,
								unit: unit,
								amount: amount,
								totalCost: Math.round((amount * cost) * 100) / 100
							}
		try {
			Orders.update({_id: Session.get("orderID")}, { $push: { orderedItems: orderObj }} )
		} catch (e) {
			console.log(e);
		}
		e.currentTarget.previousElementSibling.previousElementSibling.value = ""

		//
	}
});
