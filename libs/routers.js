Router.configure({
    layoutTemplate: 'mainLayout'
});

// Router.route('/home',{
//     name: 'home',
//     template: 'home'
// });


Router.route('/new/recipe',{
    name: 'newRecipe',
    template: 'newRecipe'
});

Router.route('/', {
	name: 'Home',
	template: 'order'
})