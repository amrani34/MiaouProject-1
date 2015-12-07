searchText = (text, array) ->
    if !Array.isArray(array)
        throw new TypeError('Second parameter must be an array')

    found = false
    for obj in array
        if obj.text is text
            found = true
    found

isLoadedObject = (obj) -> (typeof obj is 'object') && obj.hasOwnProperty('id')

addTestKeywords = ->
    text = ''
    for keywords in ['iPhone 6', 'Samsung Galaxy S5', 'Chromecast', 'Nexus 6', 'Galaxy Note 4', 'Outlook 365', 'Nexus 5', 'Samsung Alpha', 'iPhone 6 Plus']
        text += keywords + '\n'
    $('#keywords').val(text)

String::capitalize = -> @.charAt(0).toUpperCase() + @[1..].toLowerCase()
