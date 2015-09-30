ConfigController = ($scope, $http, Mail, Site, BootStrapAlert) ->
  $scope.models =
    mail:
      factory: Mail
      current: new Mail()
      list: Mail.query()
    site:
      factory: Site
      current: new Site()
      list: Site.query()

  $scope.edit = (modelName, model) -> $scope.models[modelName].current = model if $scope.models.hasOwnProperty modelName
  $scope.delete = (model) -> model.$delete(id: model.id) if confirm 'Delete ?'
  $scope.save = (model) ->
    options = id: model.id if isLoadedObject model
    saveAlert = BootStrapAlert.add 'info', 'Please wait'
    model.$save options, ->
      saveAlert.type = 'success'
      saveAlert.message = 'Configuration updated'
    , (err) ->
      saveAlert.type = 'danger'
      saveAlert.message = err.statusText

  getList = (model) ->
      return false unless $scope.models.hasOwnProperty model

      $http.get("/#{model}").success (response) -> $scope.models[model].list = response
      .error (err) ->
        BootStrapAlert.add 'danger', err.statusText
        console.error err

angular.module('miaou').controller 'ConfigController', ['$scope', '$http', 'Mail', 'Site', 'BootStrapAlert', ConfigController]
