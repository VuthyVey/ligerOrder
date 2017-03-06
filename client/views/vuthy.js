Template.home.helpers({
	items: function(){
		return Items.find({})
		//{"line": Session.get('line')}
	}
	
});