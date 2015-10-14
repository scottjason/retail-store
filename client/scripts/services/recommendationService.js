'use strict';

angular.module('BoilerPlate')
  .service('RecommendationService', RecommendationService);

function RecommendationService() {

  function save(product, isLikedItem) {

    var id, score;
    var ref = new Firebase('https://retail-store-app.firebaseio.com/recommendations');

    var target = {};
    target.firstShownName = product.firstShown.title;
    target.recommendedName = product.title;

    ref.once("value", function(snapshot) {
        var obj = snapshot.val();
        angular.forEach(obj, function(incoming, key) {
          var isMatch = (incoming.firstShownName === target.firstShownName && incoming.recommendedName === target.recommendedName);
          if (isMatch) {
            id = key;
            score = isLikedItem ? (incoming.score + 1) : (incoming.score - 1);
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
        var ref = new Firebase('https://retail-store-app.firebaseio.com/completed');
        var obj = {};
        obj.completedAt = new Date().toString();
        ref.push(obj);
      },
      function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
  }

  return {
    save: save
  }
  RecommendationService.$inject[''];
}
