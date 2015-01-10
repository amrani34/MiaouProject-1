var ANONYOUB = (function () {
    'use strict';
    
    var minLength = 40,
        maxLentgh = 800,
        resultLimit = 5;
    return {
        scanPage: function (url, keywords, filter, strict) {
            $.ajax({
                url: '/url',
                type: 'GET',
                data: {url: url},
                success: function (html) {
                    
                    var $page = $(html),
                        strictMode = strict || false,
                        results = [],
                        tests = keywords.split(',').map(function (test) {
                            return new RegExp(test, 'i');
                        });
                    console.log(tests);
                    
                    
                    filter.forEach(function (selector) {
                        $page.find(selector).each(function () {
                            var text = $(this).text();
                            
                            
                            if (text.length < minLength || text.length > maxLentgh)
                                return;
                            if (strictMode) {
                                var valid = true;
                                
                                tests.forEach(function(testKey) {
                                    if (!testKey.test(text))
                                        valid = false;                                    
                                });
                                
                                if (valid)
                                    results.push(text);
                            } else {
                                tests.forEach(function(testKey) {                                    
                                    if (!testKey.test(text))
                                        return;
                                    console.log('Lui c\'est bon');
                                    results.push(text);
                                });
                            }
                        });
                    });
                    console.log(results);
                    $('#result').text(results.join(' '));
                    
                },
                dataType: 'html'
            });
        }
    }
}());

$(document).ready(function () {
    'use strict';
    //var url = 'http://pret-travaux.comprendrechoisir.com/comprendre/simulation-credit-travaux',
      //  res = ANONYOUB.scanPage(url, 'Simulation, crédit travaux', ['p','h1', 'h2', 'h3'], true);
    $.get('/keyword', {keyword: 'test'}, function(res){
        var links = []
        $(res).find('h3.r > a').each(function() {
            links.push($(this).attr('href'));
        });
        console.log(links);
    });
});