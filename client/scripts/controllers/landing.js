'use strict';

angular.module('BoilerPlate')
  .controller('Landing', Landing);

function Landing($scope, $state, $timeout, StoreService, RecommendationService) {

  // Initial Declarations
  var fittinRoom = {};
  var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
  var dislikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');
  fittinRoom.recommendations = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/recommendations');
  fittinRoom.products = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/products');
  var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');

  $scope.customer = {};
  $scope.products = [];
  $scope.productSelected = {};

  var init = function(cb) {
    // garbage out on load
    likedItems.remove();
    dislikedItems.remove();
    fittinRoom.products.remove();
    customers.remove();
    fittinRoom.recommendations.remove();

    // get prodcuts from firebase
    StoreService.generateProducts(function(products) {
      $scope.products = products;
    });
    cb();
  }


  var bindEvents = function() {
    fittinRoom.recommendations.on("child_added", function(snapshot) {
        $timeout(function() {
          var product = snapshot.val();
          $scope.productSelected.title = product.title;
          $scope.productSelected.photo = product.photo;
          $scope.productSelected.firstShown = {};
          $scope.productSelected.firstShown.title = product.firstShown.title;
          $scope.productSelected.isRecommendItem = true;
          $scope.showLoader = false;
          $scope.showRecommendation = true;
          $scope.showTryOn = true;
          console.log('incoming recommendation', snapshot.val());
        });
      },
      function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
  };

  init(bindEvents);

  $scope.setName = function() {
    if ($scope.customer.name) {
      $scope.customer.id = StoreService.generateUUID();
      var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');
      customers.push($scope.customer);
      $scope.showProducts = true;
    }
  };

  $scope.tryItem = function(product) {
    $scope.showTryOn = true;
    StoreService.generateFittingRoom(product, $scope.customer, function(product, fittinRoom) {
      $scope.productSelected.title = product.title;
      $scope.productSelected.photo = product.photo;
      fittinRoom.push(product);
    });
  };

  $scope.likeItem = function(product) {
    var isRecommendItem = product.isRecommendItem;
    if (!isRecommendItem) {
      StoreService.generateSelectedItem(product, true, function(productSelected, likedItems) {
        $timeout(function() {
          $scope.productSelected.title = productSelected.title;
          $scope.productSelected.customerId = $scope.customer.id;
          $scope.productSelected.customerName = $scope.customer.name;
          likedItems.push($scope.productSelected);
        });
      });
    } else {
      RecommendationService.save(product, true);
    }
  };

  $scope.disLikeItem = function(product) {
    var isRecommendItem = product.isRecommendItem;
    if (!isRecommendItem) {
      StoreService.generateSelectedItem(product, false, function(productSelected, disLikedItems) {
        $timeout(function() {
          disLikedItems.push($scope.productSelected);
          $scope.showLoader = true;
        });
      });
    } else {
      RecommendationService.save(product, false);
    }
  };

  $scope.reset = function() {
    $state.go($state.current, {}, {
      reload: true
    });
  };

  Landing.$inject['$scope', '$state', '$timeout', 'StoreService', 'RecommendationService'];
}
