'use strict';

angular.module('BoilerPlate')
  .controller('Landing', Landing);

function Landing($scope, $state, $timeout, StoreService, $firebase, $firebaseObject) {

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

  function init(cb) {
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

    // bind event listeners
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
      $scope.productSelected.title = product.title
      var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
      $scope.productSelected.customerId = $scope.customer.id;
      $scope.productSelected.customerName = $scope.customer.name;
      delete $scope.productSelected.$id;
      delete $scope.productSelected.$priority;
      likedItems.push($scope.productSelected);
      $scope.showThankYou = true;
    } else {
      console.log('else called')
      var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations');
      var id;
      var score;

      var target = {};
      target.firstShownName = product.firstShown.title;
      target.recommendedName = product.title;

      ref.once("value", function(snapshot) {
          var obj = snapshot.val();
          angular.forEach(obj, function(incoming, key) {
            console.log('iterating', incoming, key)
            var isMatch = (incoming.firstShownName === target.firstShownName && incoming.recommendedName === target.recommendedName);
            if (isMatch) {
              console.log('found match')
              id = key;
              score = (incoming.score + 1);
            }
          });
          if (id) {
            console.log(score)
            var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations/' + id);
            ref.update({
              score: score
            });
          } else {
            var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations/');
            var obj = {};
            obj.firstShownName = target.firstShownName;
            obj.recommendedName = target.recommendedName;
            obj.score = 1;
            ref.push(obj);
          }
        },
        function(errorObject) {
          console.log("The read failed: " + errorObject.code);
        });

    }
  };

  $scope.dislikeItem = function(product) {
    var isRecommendItem = product.isRecommendItem;
    if (!isRecommendItem) {
      var dislikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');
      product.customerId = $scope.customer.id;
      product.customerName = $scope.customer.name;
      delete product.$id;
      delete product.$priority;
      dislikedItems.push(product);
      $scope.showLoader = true;
    } else {
      console.log('is a disliked recommened item');
    }
  };

  $scope.goAgain = function() {
    $state.go($state.current, {}, {
      reload: true
    });
  };

  Landing.$inject['$scope', '$state', '$timeout', 'StoreService', '$firebase', '$firebaseObject'];
}
