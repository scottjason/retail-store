'use strict';

angular.module('BoilerPlate')
  .controller('Landing', Landing);

function Landing($scope, $state, $timeout, RequestApi, $firebase, $firebaseObject, $firebaseArray) {

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
    var likedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/liked-items');
    var dislikedItems = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/disliked-items');
    var fittingRecommendations = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/recommendations');
    var fittinRoom = new Firebase('https://retail-store-app.firebaseio.com/fitting-room/products');
    var customers = new Firebase('https://retail-store-app.firebaseio.com/customers');
    likedItems.remove();
    dislikedItems.remove();
    fittinRoom.remove();
    customers.remove();
    fittingRecommendations.remove();
    var products = new Firebase('https://retail-store-app.firebaseio.com/products');
    $scope.products = $firebaseArray(products);

    fittingRecommendations.on("child_added", function(snapshot) {
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
      console.log('is a liked recommened item');
      var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations');

      var id;
      var score;

      var target = {};
      target.firstShownName = product.firstShown.title;
      target.recommendedName = product.title;

      var obj = $firebaseObject(ref);

      obj.$loaded().then(function() {

        angular.forEach(obj, function(incoming, key) {
          var isMatch = (incoming.firstShownName === target.firstShownName && incoming.recommendedName === target.recommendedName);
          if (isMatch) {
            id = key;
            score = incoming.score + 1;
          }
        });
        if (id) {
          var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations/' + id);
          ref.update({
            score: score
          });
        } else {
          var obj = {};
          obj.firstShownName = target.firstShownName;
          obj.recommendedName = target.recommendedName;
          obj.score = 1;
          ref.push(obj);
        }
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
    $state.go($state.current, {}, {
      reload: true
    });
  };

  Landing.$inject['$scope', '$state', '$timeout', 'RequestApi', '$firebase', '$firebaseObject', '$firebaseArray'];
}
