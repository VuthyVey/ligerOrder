Template.home.helpers({
	//return all of the items from database
	items: function(){
		return Items.find({})
	}
});