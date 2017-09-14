Session.setDefault("searchItem", "");
Session.set('selectedOrderListID', null);
Session.set('')
Template.itemList.helpers({
    // Return all of the items from database
    items: function() {
        // Session searchItem would change when the search input is keyup
        if (Session.get("searchItem") == "") {
            // Return everything from Items
            return Items.find({}, {
                sort: {
                    name: 1
                }
            });
        } else {
            // Return all the matching first digit(s) from Items names or Khmer name
            return Items.find({
                $or: [{
                    name: {
                        $regex: eval("/" + Session.get("searchItem") + "/i")
                    }
                }, {
                    kh: {
                        $regex: eval("/" + Session.get("searchItem") + "/i")
                    }
                }]
            })
        }

    }
});


Template.itemList.rendered = function() {

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 10, // Creates a dropdown of 15 years to control year
        firstDay: 1,
        disable: [7, 1, 3, 4, 6],
        format: 'mmmm d, yyyy',
        onSet: function(context) {
            var orderDate = $('#orderDate').val();

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

   
}

Template.itemList.onCreated(function bodyOnCreated() {
 
        if (Session.get("data_loaded")) {
            // Set the session of orderID to the the first 
            var order = Orders.find({
                apartment: Meteor.user().apartment
            }).fetch()[0];

            $('#orderDateSelect').val(order.for);
            console.log(order.for)
            $('#orderDateSelect').select(order.for);
        }

});


Template.itemList.events({
    'click #addToCart': function(e, tpl) {
        var btn = $(e.currentTarget);
        var amountInput = btn.parent('div').parent().find('#orderAmountInput');
        if ((isNaN(amountInput.val()) || amountInput.val() == 0) && btn.hasClass('active')) {
                amountInput.focus();
                return;
            }
        $('a.btn.active').parent('div').parent().find('#orderAmountInput').css('display', 'none');
        // $('a.btn.active').parent('div').parent().find('#orderAmountInput').val('');
        $('.btn.active').find('i').text('shopping_cart');
        $('.totalSpan').text('');

        console.log(amountInput);

        if (btn.hasClass('active')) {
            // Get all of the informations and organize with the variables
            var ingredientEnName = this.name;
            var ingredientKhName = this.kh;
            var cost = this.cost;
            var unit = this.unit;
            var category = this.category;
            var id = this._id;
            console.log(ingredientEnName)
                //Set amount to input #orderAmountInput value 
                //Not using $('#orderAmountInput').val() becuase there are many of them in the template
                //so we use the sibling elements instead
            var amount = amountInput.val();
            amount = parseFloat(amount);


            var orderId = Session.get('orderID');

            if (orderId != null) {
                var checking = Orders.find({
                    "_id": orderId,
                    orderedItems: {
                        $elemMatch: {
                            name: ingredientEnName
                        }
                    }
                }).fetch()[0];

                checking = typeof checking == "object";
                if (checking) {
                    // If there is the same ingredients in the order than just increase the amount of the same ingredient to the ordering
                    Meteor.call('amountUpdateMethod', orderId, ingredientEnName, amount);
                    Meteor.call('totalOrderCostCalc', Session.get('orderID'))
                } else {
                    // Just push a new items with orderObj information to orderedItems array
                    var totalCost = Math.round((amount * cost) * 100) / 100
                    var orderObj = {
                        _id: id,
                        addedBy: Meteor.user(),
                        name: ingredientEnName,
                        kh_name: ingredientKhName,
                        cost: cost,
                        unit: unit,
                        amount: amount,
                        category: category,
                        totalCost: totalCost
                    }
                    console.log(orderObj)

                    try {
                        Orders.update({
                            _id: Session.get("orderID")
                        }, {
                            $push: {
                                orderedItems: orderObj
                            }
                        })
                         Meteor.call('totalOrderCostCalc', Session.get('orderID'))

                    } catch (e) {
                        console.log(e);
                    }
                }


                btn.find('i').text('shopping_cart')
                btn.removeClass('active')
                amountInput.val('')
                amountInput.css('display', 'none')
            }
            // Find if there any the same ingredients that in Order

        } else if (btn.hasClass('active') == false) {
            $('a.btn.active').removeClass('active');
            btn.find('i').text('add')
            btn.addClass('active')
            amountInput.css('display', 'initial')
            amountInput.focus();
        }



        // // Clear out #orderAmountInput inputs using sibling 
        // e.currentTarget.previousElementSibling.previousElementSibling.value = ""

    },
    "keydown #searchItemInput": function(e, tpl) {
        // Everytime the search input keyup the the Session change to its value so it return the searched items
        var searchVal = $('#searchItemInput').val();
        Session.set("searchItem", searchVal);
    },
    "keyup #orderAmountInput": function(e, tpl) {
        // For live view of totalCost of current selecting items
        var cost = this.cost;
        var amount = $(e.currentTarget).val();
        var cost = parseFloat(cost);
        var totalCost = "P" + Math.round((amount * cost) * 100) / 100

        //Update the total input to the span
        //input > p > span
        $(e.currentTarget).parent().parent().find('#totalCost').text('= ' + totalCost)
    },
    "onSelect #orderDate": function(e, tpl) {

    }

});

