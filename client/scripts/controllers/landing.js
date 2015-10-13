'use strict';

angular.module('BoilerPlate')
  .controller('Landing', Landing);

function Landing($scope, $timeout, RequestApi, $firebaseObject, $firebaseArray) {

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

  $scope.setName = function() {
    if ($scope.customer.name) {
      $scope.customer.id = generateUUID();
      var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');
      customers.push($scope.customer);
      $scope.showProducts = true;
    }
  };

  init();

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

  Landing.$inject['$scope', '$timeout', 'RequestApi', '$firebaseObject', '$firebaseArray'];
}
