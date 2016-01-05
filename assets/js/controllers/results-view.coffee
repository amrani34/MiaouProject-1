ResultsViewController = (Result, $scope, $routeParams) ->
    $scope.result = Result.get id: $routeParams.id
    $scope.deleteResult = (result) ->
        return false if !confirm('Supprimer ce résultat ?')
        result.$remove id: result.id, (obj) -> $scope.results.splice $scope.results.indexOf(obj), 1

angular.module('miaou').controller 'ResultsViewController', ['Result', '$scope', '$routeParams', ResultsViewController]
