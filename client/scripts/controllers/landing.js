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
    console.log('like item called');
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

      var target = {};
      target.firstShownName = product.firstShown.title;
      target.recommendedName = product.title;


      // save new object
      // var obj = {};
      // obj.firstShownName = target.firstShownName;
      // obj.recommendedName = target.recommendedName;
      // obj.score = 1;
      // ref.push(obj);

      var foundMatch = null;
      var obj = $firebaseObject(ref);

      // to take an action after the data loads, use the $loaded() promise
      obj.$loaded().then(function() {

        var incoming = {};
        var id;
        var score;

        angular.forEach(obj, function(incoming, key) {
          var isMatch = (incoming.firstShownName === target.firstShownName && incoming.recommendedName === target.recommendedName);
          if (isMatch) {
            id = key;
            score = incoming.score + 1;
            console.log('found match')
          }
        });
        if (id) {
          var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations/' + id);
          console.log('updating ref score', score);
          ref.update({
            score: score
          });
        }
        // var key = 'https://retail-store-app.firebaseio.com/recommendations/' + match.key;
        // ref.set()

        // var arr = [];
        // // To iterate the key/value pairs of the object, use angular.forEach()
        // _.each(obj, function(value, key) {
        //   console.log('value', value);
        //   console.log('key', key);
        //   if (arr.length < 3) {
        //     arr.push(value);
        //   }
        //   if (arr.length === 3) {
        //     console.log('arr[0', arr[0]);
        //     console.log('arr[1', arr[1]);
        //     console.log('arr[2', arr[2]);
        //     var isMatch = (arr[0] === target.firstShownName && target.recommendedName === arr[1]);
        //     if (isMatch) {
        //       console.log('found match');
        //       console.log(value);
        //       value++
        //       arr = [];
        //     }
        //   }
        // });
        // // console.log('done iterating', obj);
        // // obj.$save().then(function(ref) {
        // //   console.log(ref);
        // //   console.log(ref.key() === obj.$id); // true
        // //   console.log('saved');
        // // }, function(error) {
        // //   console.log("Error:", error);
        // // });
        // ref.set(obj);
      });

      return;


      //   // ref.on("value", function(snapshot) {
      //   console.log('value called on recommendations ref');
      //   if ($scope.isIterating) return;
      //   var recommendations = snapshot.val();

      //   $scope.isIterating = true;

      //   _.each(recommendations, function(obj, key) {
      //     console.log('incoming obj', obj);
      //     console.log('incoming key', key);
      //     var incoming = {};
      //     incoming.firstShownName = obj.firstShownName;
      //     incoming.recommendedName = obj.recommendedName;
      //     var isMatch = ((incoming.firstShownName === target.firstShownName) && (target.recommendedName === target.recommendedName));
      //     if (isMatch) {
      //       console.debug('found match');
      //       foundMatch = true;
      //       obj.score++
      //     } else {
      //       console.log('no match found');
      //     }
      //   });
      //   ref.set(recommendations);
      //   // });
      //   $scope.isIterating = false;
      //   // //   // after the iteration is complete, check if a match was found
      //   if (!foundMatch) {
      //     // if not create and save the new association
      //     console.log('no match found');
      //     var recommendations = new Firebase('https://retail-store-app.firebaseio.com/recommendations');
      //     var obj = {};
      //     obj.firstShownName = target.firstShownName;
      //     obj.recommendedName = target.recommendedName;
      //     obj.score = 1;
      //     recommendations.set(obj);
      //   }
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
