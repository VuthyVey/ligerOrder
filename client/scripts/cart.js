Template.cart.rendered = function() {
	

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 10, // Creates a dropdown of 15 years to control year
        firstDay: 1,
        disable: [7, 1, 3, 4, 6],
        format: 'mmmm d, yyyy',
        onSet: function(context) {
            var orderDate = $('#orderDateSelect').val();

            var orderList = Orders.findOne({
                for: orderDate,
                apartment: Meteor.user().apartment
            });

            if (orderList) {
                Session.set("orderID", orderList._id);
            } else {
                Session.set("orderID", null);
            }

            // alert(moment($('#orderDate').val()).format('LL'));
        }
    });
    $('select').material_select();
}

Template.cart.onRendered(function() {
    var template = this;

    template.subscribe('system', function () {
    Tracker.afterFlush(function() {
       template.$('select').material_select();
    });
  });
});

Template.cart.helpers({
    orders: function() {
        console.log(Session.get('orderID'))
        if (Session.get('orderID') != null) {
            var id = Session.get('orderID');
            return Orders.find({
                _id: id
            }).fetch()[0];
        } else {
            return false;
        }
    },
    orderDates: function() {
        $('select').material_select();
        return System.findOne().orderDates;
    }
})

Template.cart.events({
    'click #orderDelIngre': function(e, tpl) {
        var id = Session.get('orderID');
        var name = this.name;
        console.log(this.totalCost)
        var totalCost = this.totalCost * -1;

        Orders.update({
            _id: id
        }, {
            $pull: {
                'orderedItems': {
                    name: name
                }
            }
        });
        Meteor.call('totalOrderCostCalc', Session.get("orderID"))
    },
    'click #createAnOrderBtn' : function(e, tpl) {

    	var orderDate = $('#orderDateSelect').val();
        console.log(orderDate)
    	var orderObj = {
		    for : orderDate,
		   	createdBy: Meteor.user(),
		   	createdTime: Date.now(),
		    apartment : Meteor.user().apartment,
		    orderedItems : [],
		    orderedRecipes : [],
		    totalOrderCost : 0.00
		    
		}
		var isOrderExist = Orders.find({for : orderDate, apartment : Meteor.user().apartment}).fetch();
		
        if (isOrderExist.length == 0) {
			Orders.insert(orderObj);
            
             var orderList = Orders.findOne({
                for: orderDate,
                apartment: Meteor.user().apartment
            });

            if (orderList) {
                Session.set("orderID", orderList._id);
            } else {
                Session.set("orderID", null);
            }
		} else {
			alert('It already exist')
		}
    	
    },
    'change #orderDateSelect' : function() {
        var orderDate = $('#orderDateSelect').val();

            var orderList = Orders.findOne({
                for: orderDate,
                apartment: Meteor.user().apartment
            });

            if (orderList) {
                Session.set("orderID", orderList._id);
            } else {
                Session.set("orderID", null);
            }
    }
})