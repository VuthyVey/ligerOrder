Session.setDefault("searchItem", "");

Template.order.helpers({
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

Template.order.events({
	'click #add-button': (e, tpl) => {
		var btn = $(e.currentTarget);
		var amountInput = btn.parent('div').parent().find('#orderAmountInput');
		$('a.btn').parent('div').parent().find('#orderAmountInput').css('display', 'none');
		$('a.btn').parent('div').parent().find('#orderAmountInput').val('')
		$('a.btn').removeClass('active');
		$('.totalSpan').text('');
		$('.btn').find('i').text('shopping_cart')

		if (btn.hasClass('active')) {
			btn.find('i').text('shopping_cart')
			btn.removeClass('active')
			amountInput.val('')
			amountInput.css('display', 'none')
		} else if (btn.hasClass('active') == false) {
			btn.find('i').text('add')
			btn.addClass('active')
			amountInput.css('display', 'initial')
			amountInput.focus();
		}

	},
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
		var totalCost = "P" + Math.round((amount * cost) * 100) / 100
		
		//Update the total input to the span
		//input > p > span
		$(e.currentTarget).parent().parent().find('#totalCost').text('= ' +totalCost)
	}
})