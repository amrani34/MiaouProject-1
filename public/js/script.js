$(document).ready(function () {
    'use strict';
    var $urls = $('#urls'),
        $result = $('#result'),
        validUrl = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    $('.search-engine').click(function (e) {
        var keywords = $('#keyword').val().split(','),
            engine = $(this).data('engine');
        if (keywords) {
            $.getJSON('/links/'+engine, {keywords: keywords}, function (res) {
                if (!res.error)
                    $urls.val( $urls.val() + res.urls.join(','));
                else
                    alert(res.message);
            });
        }
        else
            alert('Choisi un mot-clé, connard.');
    });
    
    $('#emptyLinks').click(function() {
        $urls.val('');
    });
    
    $('#miaouform').submit(function(e) {
        e.preventDefault();
        $result.empty();
        var targetUrls = [],
            data = $(this).serializeArray();
        
        $urls.val().split(',').forEach(function(url) {
            var url = url.trim();
            if (validUrl.test(url))
                targetUrls.push(url);
        });
        $.unique(targetUrls);
        if (!targetUrls.length)
            return alert('Aucune url valide');
        
        targetUrls.forEach(function(url) {            
            $.getJSON('/keyword?url= '+ url, data, function (res) {
                if (res.error)
                    return;
                res.p.forEach(function(text) {
                    $result.append($('<span />', {text: text, title: url}).data('origin', url).tooltip());
                });
            });
        });
    });
});