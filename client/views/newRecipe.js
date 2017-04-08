// New Recipe Reactive Object template 
var newRecipe = new ReactiveObj({
	name: "",
	kh_name: "",
	serve: 0,
	duration: 0,
	level: "",
	ingredients: [{id: 121, name: "bannana", amount: 1, unit: "kg"}],
	directions: [],
	owner: ""
});

var editingIngredient = new ReactiveObj({
	id: 0, name: "", amount: 1, unit: ""
})
//return everything from newRecipe reactiveObj to html template
Template.newRecipe.helpers({
	newRecipe: function() {
		return newRecipe.get();
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
	'click #newIngredient, keyup .ingredientsInputs': function(e,tpl) {
		//if the event is click or Enter key keyup then the code is fire
		if(e.type == 'click' || e.keyCode == 13){
			var name = $('#ingredientName');
			var amount = $('#ingredientAmount');
			var unit = $('#ingredientUnit');

			//Random.id() generates random numbers id
			//id need to modify or delete items

			//create objects for push ingredientsObj 
			var ingredientsObj = {id: Random.id(), "name": name.val(), "amount": amount.val(), "unit": unit.val()};
			newRecipe.push('ingredients', ingredientsObj);
			//clear all the inputs text
			name.val("");
			amount.val("");
			unit.val("");
		}
		
	},
	'click #deleteItem': function(e, tpl) {
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
	'click #editItem': function(e, tpl) {
		var id = this.id;
		var name = this.name;
		var amount = this.amount;
		var unit = this.unit;

		var editedId = editingIngredient.get("id");
		var editedName = editingIngredient.get("name");
		var editedAmount = editingIngredient.get("amount");
		var editedUnit = editingIngredient.get("unit");
		if(id != editedId) {
			$('#edit'+editedId).children('#editedName').val(editedName);
			$('#edit'+editedId).children('#editedAmount').val(editedAmount);
			$('#edit'+editedId).children('#editedUnit').val(editedUnit);
		}
		editingIngredient.set("id", id);
		editingIngredient.set("name", name);
		editingIngredient.set("amount", amount);
		editingIngredient.set("unit", unit);
		$('.listDiv').show();
		$('.inputDiv').hide();
		$('#item'+id).hide();
		$('#edit'+id).show();
			
	},
	
	'click #doneEditBtn, keyup .editInput' : function (e, tpl) {
		if(e.type == "click" || e.keyCode == 13) {
			var id = this.id;
			var name = $('#edit'+id).children('#editedName');
			var amount = $('#edit'+id).children('#editedAmount');
			var unit = $('#edit'+id).children('#editedUnit');

			var ingredientsArray = newRecipe.get("ingredients");
			var ingredientsObj = {id: id, "name": name.val(), "amount": amount.val(), "unit": unit.val()};
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
		
			$('#edit'+id).hide();
			$('#item'+id).show();
		}
	},
	'click #cancelEditBtn' : function (e, tpl) {
		var id = this.id;
		$('#edit'+id).hide();
		$('#item'+id).show();
		$('#edit'+id).children('#editedName').val(this.name);
		$('#edit'+id).children('#editedAmount').val(this.amount);
		$('#edit'+id).children('#editedUnit').val(this.unit);
	},
	'click #newDirection, keyup #direction': function(e,tpl) {
		if(e.type == 'click' || e.keyCode == 13) {
			var direction = $('#direction');
			var directionObj = {text: direction.val()}
			newRecipe.push('directions', directionObj);
			console.log(newRecipe.get())
			direction.val("");
		}
		
	}
});