define([
  'jquery',
  'underscore',
  'backbone',
  'text!../templates/item.html',
  'text!../templates/item_detail.html',
  'text!../templates/cart_info.html',
  'localstorage'
], function ($, _, Backbone, itemTemplate, itemDetailTemplate, cartInfoTemplate) {

  var app;

  // Models

  var Item = Backbone.Model.extend({
    defaults: {
      id: undefined,
      title: undefined,
      artist: undefined,
      image: undefined,
      large_image: undefined,
      price: undefined,
      url: undefined
    }
  });

  var Items = Backbone.Collection.extend({
    model: Item,
    url: '/data/items.json'
  });

  var CartItem = Backbone.Model.extend({
    defaults: {
      id: undefined,
      quantity: 0
    }
  });

  var Cart = Backbone.Collection.extend({
    model: CartItem,
    localStorage: new Backbone.LocalStorage("cart"),
    addToCart: function (item) {
      var cartItem = this.get(item.id);
      if (!cartItem) {
        cartItem = new CartItem({ id: item.id });
      }
      cartItem.set('quantity', cartItem.get('quantity') + item.quantity);
      this.create(cartItem);
    },
    getCount: function () {
      var count = 0;
      _.each(this.models, function (item) {
        count += item.get('quantity');
      }, this);
      return count;
    }
  });

  // Views

  Backbone.View.prototype.close = function () {
    this.remove();
    this.unbind();
  };

  var CartInfoView = Backbone.View.extend({
    el: '.cart-info',
    template: _.template(cartInfoTemplate),
    render: function () {
      this.$el.html(this.template({ cartCount: this.collection.getCount() }));
      $('.cart-info')
        .animate({ paddingTop: '30px' })
        .animate({ paddingTop: '10px' });
    }
  });

  var HomeView = Backbone.View.extend({
    tagName: 'div',
    render: function () {
      var self = this;
      _.each(this.collection.models, function (item) {
        self.renderItem(item);
      }, this);
    },
    renderItem: function (item) {
      var itemView = new ItemView({ model: item });
      this.$el.append(itemView.render().el);
    }
  });

  var ItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'item',
    template: _.template(itemTemplate),
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var ItemDetailView = Backbone.View.extend({
    tagName: 'div',
    template: _.template(itemDetailTemplate),
    events: {
      'click #addToCart': 'addToCart'
    },
    addToCart: function (e) {
      e.preventDefault();
      var item_id = this.$('input[name=item_id]').val();
      var quantity = parseInt(this.$('input[name=quantity]').val(), 10);
      app.trigger('addToCart', {
        id: item_id,
        quantity: quantity
      });
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    }
  });

  // Router

  var TheJsonStore = Backbone.Router.extend({
    _currentView: null,
    routes: {
      '': 'home',
      'item/:id': 'item'
    },
    initialize: function () {
      this.cart = new Cart();
      this.cart.on('sync', function () {
        var cartView = new CartInfoView({ collection: this.cart });
        cartView.render();
      }, this);
      this.cart.fetch();
      this.on('addToCart', this.addToCart);
    },
    addToCart: function (item) {
      this.cart.addToCart(item);
    },
    home: function () {
      var items = new Items();
      items.on('sync', function () {
        var homeView = new HomeView({ collection: items });
        this._changeView(homeView);
      }, this);
      items.fetch();
    },
    item: function (id) {
      var items = new Items();
      items.on('sync', function () {
        var item = items.get(id);
        var itemDetailView = new ItemDetailView({ model: item });
        this._changeView(itemDetailView);
      }, this);
      items.fetch();
    },
    _changeView: function (view) {
      if (this._currentView) {
        this._currentView.close();
      }
      this._currentView = view;
      this._currentView.render();
      $('#main').html(this._currentView.el);
    }
  });

  var init = function () {
    app = new TheJsonStore();
    Backbone.history.start();
  };

  return {
    init: init
  };
});
