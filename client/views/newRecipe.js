
// New Recipe Reactive Object template 
var newRecipe = new ReactiveObj({
	name: "",
	kh_name: "",
	serve: 0,
	duration: 0,
	level: "",
	ingredients: [{id: 121, name: "bannana", amount: 1, unit: "kg", editing: false}],
	directions: [{id: 121, text: "1. Heat the pan"}],
	owner: ""
});

function toCapitalize(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

Session.set('editingIngredientId', '');
Session.set('editingDirectionId', '');

var editingDirection = new ReactiveObj({
	id: 0, text: ""
});
//return everything from newRecipe reactiveObj to html template
Template.newRecipe.helpers({
	newRecipe: function() {
		return newRecipe.get();
	},
	settings: function() {
    return {
      position: "top",
      limit: 6,
      rules: [
        {
          token: '',
          collection: Items,
          field: "name",
          template: Template.autoComplete
        },
        
      ]
    };
  }
});
//all the events that listen from the html template
Template.newRecipe.events({
	'blur #enRecipeName':function(e,tpl){
		var name = $('#enRecipeName').val();
		var updater = function() {return name};
		newRecipe.update('name', updater);
	},
	'blur #khRecipeName':function(e,tpl){
		var kh_name = $('#khRecipeName').val();
		var updater = function() {return kh_name};
		newRecipe.update('kh_name', updater);
	},
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
	'click #deleteIngredientBtn': function(e, tpl) {
		var id = this.id;
		var ingredients = newRecipe.get("ingredients");
		
		for(var i = 0; i < ingredients.length; i++) {
			if (ingredients[i].id == id) {
				newRecipe.splice("ingredients", i,1);
				break;
			}
		}
		//newRecipe.splice("ingredients", id-1, 1);			
	},
	'click #editIngredientBtn, click #itemP': function(e, tpl) {
		var id = this.id;

		var ingredientsArray = newRecipe.get("ingredients");
		for(var i = 0; i < ingredientsArray.length; i++) {
			if (ingredientsArray[i].id == Session.get("editingIngredientId")) {
				ingredientsArray[i].editing = false;
				break;
			}
		}

		for(var i = 0; i < ingredientsArray.length; i++) {
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
	
	'click #updateIngreBtn, keyup .editInput' : function (e, tpl) {
		if(e.type == "click" || e.keyCode == 13) {
			var id = this.id;

			var name = $('#editingIngreName').val();
			var amount = $('#editingIngreAmount').val();
			var unit = $('#editingIngreUnit').val();

			var ingredientsArray = newRecipe.get("ingredients");
			var ingredientsObj = {id: id, "name": name, "amount": amount, "unit": unit, "editing": false};
			for(var i = 0; i < ingredientsArray.length; i++) {
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
	'click #newDirectionBtn, keyup #direction': function(e,tpl) {
		if(e.type == 'click' || e.keyCode == 13) {
			var direction = $('#newDirectionInput');
			var directionObj = {id: Random.id(), text: direction.val(), editing: false}
			newRecipe.push('directions', directionObj);
			direction.val("");
		}
		
	},
	'click #deleteDirectionBtn' : function (e, tpl) {
		var id = this.id;
		var directionsArray = newRecipe.get("directions");

		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == id){ 
				newRecipe.splice("directions", i ,1)
			}
		}
	},
	'click #editDirectionBtn' : function (e, tpl) {
		var id = this.id;
		var directionsArray = newRecipe.get("directions");
		
		for(var i = 0; i < directionsArray.length; i++ ) {
			if (directionsArray[i].id == Session.get("editingDirectionId")){ 
				directionsArray[i].editing = false;
				break;
			}
		}

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
		var id = this.id;
		var text = $('#editedDirection');
		var directionsArray = newRecipe.get("directions");
		var directionObj = {id: id, text: text.val(), editing: false};
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
	"autocompleteselect input": function(event, template, doc) {
    	console.log("selected ", doc);
    	$("#ingredientUnit").val(doc.unit)
  	}
});