if (Meteor.isServer){
	console.log("Hi")
	Items.insert({name: 'Vuthy', age: 15});
		
		console.log("Inserted")
}