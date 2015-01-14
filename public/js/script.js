$(document).ready(function () {
    'use strict';
    var $urls = $('#urls'),
        $result = $('#result'),
        validUrl = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    $('.search-engine').click(function (e) {
        var keywords = $('#keyword').val().split(','),
            searchType = $('[name="search_type"]:checked').val(),
            engine = $(this).data('engine');
        if (keywords) {
            $.getJSON('/links/'+engine, {keywords: keywords, searchType: searchType}, function (res) {
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
    $('#result').on('click', '.btn-rm', function(){
        $(this).parent().parent().fadeOut(600, function(){
            $(this).remove();
        });
    });    
    $('#result').on('click', '.btn-add', function(){
        var text = $(this).parent().parent().find('a').text();
        $(this).parent().parent().fadeOut(600, function(){
            $(this).remove();
        });
        $('#panier').append(text + '. ');
    });    
    $('#miaouform').submit(function(e) {
        e.preventDefault();
        $result.empty();
        var targetUrls = [],
            $p,
            $btnGroup,
            $nbRes = $('#nb-results'),
            nbRep = 0,
            results = 0,
            data = $(this).serializeArray();
        
        $urls.val().split(',').forEach(function(url) {
            var url = url.trim();
            //if (validUrl.test(url))
                targetUrls.push(url);
        });
        
        $.unique(targetUrls);
        if (!targetUrls.length)
            return alert('Aucune url valide');
        
        $nbRes.text(results);
        $('#info-area, #waiter').fadeIn();
        
        targetUrls.forEach(function(url) {            
            $.getJSON('/keyword?url= '+ url, data, function (res) {
                nbRep++;
                if (nbRep === targetUrls.length)
                    $('#waiter').fadeOut();
                
                if (res.error)
                    return;
                
                if (res.p.length) {                    
                    $nbRes.text(results += res.p.length);
                    res.p.forEach(function(text) {
                        $p = $('<p />', {title: url}).tooltip().fadeIn();
                        $btnGroup = $('<div />', {'class': 'btn-group'})
                        .append($('<button />', {html: '<i class="fa fa-shopping-cart"></i>'}).addClass('btn btn-default btn-xs btn-add'))
                        .append($('<button />', {html: '<i class="fa fa-trash"></i>'}).addClass('btn btn-default btn-xs btn-rm'));
                        $p.append($btnGroup).append($('<a/>', {text: text, href: url, target: '_blank'}));
                        $result.append($p);
                    });
                }
            });        
        });
    });
});