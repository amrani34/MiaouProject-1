searchEngines = ['google', 'bing']
validUrl = /^(https?:\/\/)/
strToArray = (str, sep) -> (text.trim() for text in str.split sep)

# Controller
MultiSearchController = ($scope, $http, Site, Result, BootStrapAlert, MailService) ->
  $scope.searchParams =
    keywords: ''
    searchType: 'exact'
    strict: 1
    maxResults: 2
    minLength: 0
    site: null
  $scope.waiting = false
  $scope.progress = 0
  $scope.nbRequests = 0
  $scope.nbResponses = 0
  $scope.keywordsList = []
  $scope.sitesList = Site.query()

  # Functions
  $scope.save = (obj) ->
    result = new Result(obj)
    saveAlert = BootStrapAlert.add 'info', 'Please wait'
    result.$save ->
      saveAlert.type = 'success'
      saveAlert.message = 'Recherche sauvegardée'
    , (err)->
      saveAlert.type = 'danger'
      saveAlert.message = err.statusText

  $scope.sendAll = ->
    mailAlert = BootStrapAlert.add 'info', 'Please wait'
    current = 0
    errors = 0
    total = $scope.keywordsList.length
    $scope.keywordsList.forEach (item) ->
      postData = item.emailData
      postData.site = item.site
      MailService.send postData, (response) ->
        current++
        mailAlert.message = "Envoi en cours (#{current} / #{total})"
        mailAlert.type = 'success' if current is total
      , (err)->
        current++
        BootStrapAlert.add 'danger', "Echec de l'envoi de #{postData.title}"

  $scope.sendMail = (obj) ->
      return BootStrapAlert.add('danger', 'Invalid request') unless obj.hasOwnProperty 'emailData'
      return BootStrapAlert.add('danger', 'Please select a website') unless obj.hasOwnProperty 'site'

      postData = obj.emailData
      postData.site = obj.site
      mailAlert = BootStrapAlert.add 'info', 'Please wait'

      MailService.send postData, (response) ->
        mailAlert.type = 'success'
        mailAlert.message = 'Mail envoyé'
      , (err)->
        $log.error(err)
        mailAlert.type = 'danger'
        mailAlert.message = 'Échec de l\'envoi'

  $scope.fetchKeywords = ->
    $scope.waiting = true

    strToArray($scope.searchParams.keywords, /\n/).forEach (keywords, index) ->
      item =
        keywords : strToArray(keywords, ' ')
        linkList: []
        resultsIn: []
        resultsOut: []
        emailData:
          title: keywords
          content: ''
        site: $scope.searchParams.site

      # Recherche sur chaque moteur
      for searchEngine in searchEngines
        $http.post '/links/find',
          searchType: $scope.searchParams.searchType
          keywords: item.keywords
          engine: searchEngine
        .success (response) ->
          for url in response.urls
            continue if !validUrl.test(url) or item.linkList.indexOf(url) isnt -1
            $scope.nbRequests++
            item.linkList.push url
            $http.post '/keywords/find',
              url: url
              strict: $scope.searchParams.strict
              keywords: item.keywords
              maxResults: $scope.searchParams.maxResults
            .success (response) ->
              return false unless response.success
              for text in response.in
                continue if searchText text, item.resultsIn
                item.resultsIn.push
                  text: text
                  origin: url
                item.emailData.content += text.trim() + '.\n'
              for text in response.out
                continue if searchText text, item.resultsOut
                item.resultsOut.push
                  text: text
                  origin: url
            .finally ->
              $scope.nbResponses++
              $scope.progress = parseInt $scope.nbResponses / $scope.nbRequests * 100, 10
              $scope.waiting = false if $scope.nbResponses is $scope.nbRequests
        .error -> $scope.waiting = false
      $scope.keywordsList.push item
      console.log "Recherche lancée sur le mot clé #{keywords}"
#         .forEach(function (text) {
#           if ()
#             return false;
#           ({});
#                            ;
#         });
#
#                         response.out.forEach(function (text) {
#           if (searchText(text, item.resultsOut))
#             return false;
#           item.resultsOut.push({text: text, origin: url});
#         });
#       })(function () {
#         $scope.nbResponses++;
#                         $scope.progress = parseInt($scope.nbResponses / $scope.nbRequests * 100, 10);
#         if ($scope.nbResponses === $scope.nbRequests)
#           $scope.waiting = false;
#       });
#     });
#   }).error(function () {
#     $scope.waiting = false;
#   });
# });
#         $scope.keywordsList.push(item);
#     });
# };
angular.module('miaou').controller 'MultiSearchController', ['$scope', '$http', 'Site', 'Result', 'BootStrapAlert', 'MailService', MultiSearchController]
