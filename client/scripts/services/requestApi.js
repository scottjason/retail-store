'use strict';

angular.module('BoilerPlate')
  .service('RequestApi', RequestApi);

function RequestApi($http) {

  function tryOn(params) {
    var request = $http({
      method: 'POST',
      url: 'http://localhost:3002/try-on',
      data: params
    });
    return (request.then(successHandler, errorHandler));
  }

  function successHandler(response) {
    return (response);
  }

  function errorHandler(response) {
    return (response);
  }

  return {
    tryOn: tryOn
  }
  RequestApi.$inject['$http'];
}
