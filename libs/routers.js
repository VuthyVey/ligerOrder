Router.configure({
    layoutTemplate: 'mainLayout'
});


Router.route('/new/recipe',{
    name: 'newRecipe',
    template: 'newRecipe'
});

Router.route('/', {
	name: 'Home',
	template: 'order'
})