// ReactiveObj is reactive objects that can contain nested objects and it based on Tracker
// For this app the package uses in new recipe page to obtain the ingredients and direction
// The idea of this is not to use mongodb that slower because we don't need to share to other 
// user; faster; and short term memory

// New Recipe Reactive Object template with basic information
// Spacebars helpers can literate over ingredients and directions array on each object element to show in the screen
// editing fields are use for ingredients and directions editing feature, when the user click edit, the field change to true
// and the #if helpers changes to other HTML for editing meanwhile other editing field in other object change to false so it 
// would collaps back to its original

// {{#if editing}}
// 	{{> ingredientInputsTpl}}
// {{else}}
// 	{{> ingredientListsTpl}}
// {{/if}}

var newRecipe = new ReactiveObj({
	enName: "",
	khName: "",
	serve: 0,				
	readyTime: 0,
	ingredients: [{id: 121, name: "bannana", amount: 1, unit: "kg", editing: false}],
	directions: [{id: 121, text: "1. Heat the pan", editing: false}],
	owner: ""
});

// Use to search for items and change object editing field from true to false in newRecipe
Session.setDefault('editingIngredientId', '');
Session.setDefault('editingDirectionId', '');


function toCapitalize(str)
{
	//Capitalize every first digit of a word
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//HELPERS//
//Return everything from newRecipe reactiveObj to html template
Template.newRecipe.helpers({
	newRecipe: function() {
		//newRecipe.get() return every field
		//newRecipe.get('a') return field 'a'
		return newRecipe.get();
	},
	//autoComplete package
	//autoComplete setting for ingredients searching 
	settings: function() {
	    return {
	      position: "top",
	      limit: 6,
	      rules: [
	        {
	          token: '', //trigger, ex. token: '@' the search will trigger when the user type it
	          collection: Items, //collection to search from
	          field: "name", //search base on
	          template: Template.autoComplete //Template to display each result
	        },
	        
	      ]
	    };
  }
});
//all the events that listen from the html template
Template.newRecipe.events({
	// ******************* INGREDIENT EVENTS *******************
	//when newIngredient button clicked or keyup, all of the values from inputs will add to newRecipe Obj
	'click #newIngredientBtn, keyup .ingredientsInputs': function(e,tpl) {
		//if the event is click or Enter key keyup then the code is fire
		if(e.type == 'click' || e.keyCode == 13){
			var name = $('#ingredientName');
			var amount = $('#ingredientAmount');
			var unit = $('#ingredientUnit');

			//Random.id() generates random numbers id
			//id need to modify or delete items

			//create objects for push ingredientsObj 
			var ingredientsObj = {id: Random.id(), "name": toCapitalize(name.val()), "amount": amount.val(), "unit": unit.val(), "editing": false};
			newRecipe.push('ingredients', ingredientsObj);
			//clear all the inputs text
			name.val("");
			amount.val("");
			unit.val("");
		}
		
	},

	"autocompleteselect input": function(event, template, doc) {
		// When user select the suggestion items, the items unit automatically add to unit field
    	$("#ingredientUnit").val(doc.unit)
  	},

	'click #deleteIngredientBtn': function(e, tpl) {
		// Delete ingredients by its id
		var id = this.id;
		var ingredients = newRecipe.get("ingredients");
		
		for(var i = 0; i < ingredients.length; i++) {
			if (ingredients[i].id == id) {
				newRecipe.splice("ingredients", i,1);
				break;
			}
		}	
	},
	'click #editIngredientBtn, click #itemP': function(e, tpl) {
		// Edit added ingredient by its id
		var id = this.id;

		var ingredientsArray = newRecipe.get("ingredients");
		for(var i = 0; i < ingredientsArray.length; i++) {
			// Search for previous editing items and disable it
			if (ingredientsArray[i].id == Session.get("editingIngredientId")) {
				ingredientsArray[i].editing = false;
				break;
			}
		}

		for(var i = 0; i < ingredientsArray.length; i++) {
			// Search for new editing items and enable it
			if (ingredientsArray[i].id == id) {
				ingredientsArray[i].editing = true;
				Session.set('editingIngredientId', id);
				break;
			}
		}

		function updater () {
			return ingredientsArray;
		}

		newRecipe.forceInvalidate();
		newRecipe.update("ingredients", updater);		
	},
	// {{> ingredientInputsTpl}} Events UPDATE and CANCEL
	'click #updateIngreBtn, keyup .editInput' : function (e, tpl) {
		if(e.type == "click" || e.keyCode == 13) {
			// If the ADD TO INGREIDENT button clicked or Enter key pressed in .editInput the code will fire
			// The informations from the all the information from all Inputs update to newRecipe
			var id = this.id;

			var name = $('#editingIngreName').val();
			var amount = $('#editingIngreAmount').val();
			var unit = $('#editingIngreUnit').val();

			var ingredientsArray = newRecipe.get("ingredients");
			// new ingredient object with updated information 
			var ingredientsObj = {id: id, "name": name, "amount": amount, "unit": unit, "editing": false}; //editing change to fasle as well
			for(var i = 0; i < ingredientsArray.length; i++) {
				// Search and replace the object
				if (ingredientsArray[i].id == id) {
					ingredientsArray[i] = ingredientsObj;
					break;
				}
			}

			function updater() {
				return ingredientsArray
			}
			newRecipe.forceInvalidate("ingredients");
			newRecipe.update("ingredients", updater);

		}
	},
	'click #cancelIngreBtn' : function (e, tpl) {
		// Previous information still in newRecipe
		// We just change editing field to false
		var id = this.id;
		var ingredientsArray = newRecipe.get("ingredients");
		for(var i = 0; i < ingredientsArray.length; i++) {
				if (ingredientsArray[i].id == id) {
					ingredientsArray[i].editing = false;
					break;
				}
		}
		function updater() {
			return ingredientsArray;
		}

		newRecipe.forceInvalidate();
		newRecipe.update("ingredients", updater)
	},

	// // ******************* DIRECTION EVENTS *******************
	'click #newDirectionBtn, keyup #direction': function(e,tpl) {
		if(e.type == 'click' || e.keyCode == 13) {
			// If the ADD TO DIRECTION button clicked or Enter key pressed in #direction the code will fire
			// Push directions information to directions array in newRecipe

			//Random.id() generates random numbers id
			//id need to modify or delete direction

			var direction = $('#newDirectionInput');
			var directionObj = {id: Random.id(), text: direction.val(), editing: false}
			newRecipe.push('directions', directionObj);
			direction.val("");
		}
		
	},
	'click #deleteDirectionBtn' : function (e, tpl) {
		// Search direction with id and delelete it from newRecipe directions[]
		var id = this.id;
		var directionsArray = newRecipe.get("directions");

		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == id){ 
				newRecipe.splice("directions", i ,1)
			}
		}
	},
	'click #editDirectionBtn' : function (e, tpl) {
		// Change editing field from object of previous editingDirectionId to false
		var id = this.id;
		var directionsArray = newRecipe.get("directions");
		
		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == Session.get("editingDirectionId")){ 
				directionsArray[i].editing = false;
				break;
			}
		}
		// Change editing field of current id object to true and set the session with the current id
		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == id){ 
				directionsArray[i].editing = true;
				Session.set("editingDirectionId", id);
				break;
			}
		}
		function updater() {
			return directionsArray;
		}
		newRecipe.forceInvalidate("directions");
		newRecipe.update("directions", updater);
	},

	'click #dirUpdateBtn' : function (e, tpl) {
		// If the ADD TO INGREIDENT button clicked the code will fire
		// The informations from the all the information from all Inputs update to newRecipe direction[]
		var id = this.id;
		var text = $('#editedDirection');
		var directionsArray = newRecipe.get("directions");
		var directionObj = {id: id, text: text.val(), editing: false}; //editing field equal false as default
		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == id){ 
				directionsArray[i] = directionObj;
				break;
			}
		}

		function updater () {
			return directionsArray 
		}
		newRecipe.forceInvalidate();
		newRecipe.update("directions", updater);
	},
	'click #dirCancelBtn' : function (e, tpl) {
		// Previous information still in newRecipe
		// We just change editing field to false

		var id = this.id;
		var directionsArray = newRecipe.get("directions");
		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == id){ 
				directionsArray[i].editing = false;
				break;
			}
		}
		function updater() {
			return directionsArray;
		}
		newRecipe.forceInvalidate();
		newRecipe.update("directions", updater);
	},


  	'click #saveRecipeBtn' : function (e, tpl) {
  		// Add additional information to newRecipes and insert to mongodb
  		var enRecipeName = $('#enRecipeName');
  		var khRecipeName = $('#khRecipeName');
  		var serve = $("#numOfServe");
  		var readyTime = $('#readyTime');
  		var owner = "Vuthy";

  		var recipeObj = newRecipe.get();

  		recipeObj.timeCreated = Date.now();
  		recipeObj.name = enRecipeName.val();
  		recipeObj.kh_name = khRecipeName.val();
  		recipeObj.serve = serve.val();
  		recipeObj.readyTime = readyTime.val();
  		recipeObj.owner = owner;

  		Recipes.insert(recipeObj);
  		Router.go("/")
  		
  	}
});