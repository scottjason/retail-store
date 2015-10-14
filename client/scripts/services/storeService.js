'use strict';

angular.module('BoilerPlate')
  .service('StoreService', StoreService);

function StoreService($firebaseArray) {

  function generateUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  function generateProducts(cb) {
    var products = new Firebase('https://retail-store-app.firebaseio.com/products');
    cb($firebaseArray(products));
  }

  function generateFittingRoom(product, customer, cb) {
    product.customerId = customer.id;
    product.customerName = customer.name;
    delete product.$id;
    delete product.$priority;
    var fittinRoom = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/products');
    cb(product, fittinRoom);
  }

  function generateSelectedItem(productSelected, isLikedItem, cb) {
    var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
    var disLikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');

    delete productSelected.$id;
    delete productSelected.$priority;
    if (isLikedItem) {
      var ref = new Firebase('https://retail-store-app.firebaseio.com/completed');
      var obj = {};
      obj.completedAt = new Date().toString();
      ref.push(obj);
      cb(productSelected, likedItems);
    } else {
      cb(productSelected, disLikedItems);
    }
  }

  return {
    generateUUID: generateUUID,
    generateProducts: generateProducts,
    generateFittingRoom: generateFittingRoom,
    generateSelectedItem: generateSelectedItem
  }
  StoreService.$inject['$firebaseArray'];
}
