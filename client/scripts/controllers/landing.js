'use strict';

angular.module('BoilerPlate')
  .controller('Landing', Landing);

function Landing($scope, $state, $timeout, RequestApi, $firebaseObject, $firebaseArray) {

  $scope.customer = {};
  $scope.products = [];
  $scope.productSelected = {};

  function generateUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  var init = function() {
    var products = new Firebase('https://retail-store-app.firebaseio.com/products');
    $scope.products = $firebaseArray(products);
  };

  init();

  $scope.setName = function() {
    if ($scope.customer.name) {
      $scope.customer.id = generateUUID();
      var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');
      customers.push($scope.customer);
      $scope.showProducts = true;
    }
  };

  $scope.tryOn = function(product) {
    $scope.showTryOn = true;
    product.customerId = $scope.customer.id;
    product.customerName = $scope.customer.name;
    $scope.productSelected.title = product.title;
    $scope.productSelected.photo = product.photo;
    delete product.$id;
    delete product.$priority;
    var fittinRoom = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/products');
    fittinRoom.push(product);
  };

  $scope.likeItem = function(product) {
    $scope.productSelected.title = product.title
    var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
    $scope.productSelected.customerId = $scope.customer.id;
    $scope.productSelected.customerName = $scope.customer.name;
    delete $scope.productSelected.$id;
    delete $scope.productSelected.$priority;
    likedItems.push($scope.productSelected);
    $scope.showThankYou = true;
  };

  $scope.dislikeItem = function(product) {
    var dislikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');
    product.customerId = $scope.customer.id;
    product.customerName = $scope.customer.name;
    delete product.$id;
    delete product.$priority;
    dislikedItems.push(product);
    $scope.showThankYou = true;
  };

  $scope.getNewSize = function(product) {
    var newSizeItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/newsize-items');
    product.customerId = $scope.customer.id;
    product.customerName = $scope.customer.name;
    delete product.$id;
    delete product.$priority;
    newSizeItems.push(product);
    $scope.showSizeRequested = true;
  };

  $scope.goAgain = function() {
    var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
    var dislikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');
    var fittinRoom = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/products');
    var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');
    likedItems.remove();
    dislikedItems.remove();
    fittinRoom.remove();
    customers.remove();
    $state.go($state.current, {}, {
      reload: true
    });
  };

  Landing.$inject['$scope', '$state', '$timeout', 'RequestApi', '$firebaseObject', '$firebaseArray'];
}
