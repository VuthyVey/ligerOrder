Template.navbar.events({
	'click #loginWithGoogle': function (e, tpl) {
		Meteor.loginWithGoogle({
		hd: 'ligercambodia.org', //hd = host domain 
    	scope: ['email', 'profile']
		}, (err) => {
		  if (err) {
		    // handle error

		  } else {
		  	
		    checkUserApartment()

		  }
		});
	},
	'click #logout' : function(e, tpl) {
		Meteor.logout(function(err) {
			Router.redirect('/')
		});
	}
})

Template.navbar.helpers({
	'userName' : function () {
		console.log(Meteor.user())
		return Meteor.user()
	}
})

// Template.navbar.onCreated(function bodyOnCreated(){
// 	 $('.modal').modal();
// 	if (Meteor.user()) {
// 		checkUserApartment() 
// 	}

// });


function checkUserApartment() {
	if (Meteor.user().apartment) {
		alert("Hello! " + Meteor.user().apartment)
		Router.redirect('/')
	} else {
		alert('You need a apartment')
		$('#modal1').modal();
		$('#modal1').modal('open');
	}
}