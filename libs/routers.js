Router.configure({
    layoutTemplate: 'mainLayout'
});

Router.route('/',{
    name: 'home',
    template: 'home'
});


Router.route('/new/recipe',{
    name: 'newRecipe',
    template: 'newRecipe'
});