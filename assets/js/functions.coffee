searchText = (text, array) ->
    if !Array.isArray(array)
        throw new TypeError('Second prameter must be an array')
        
    found = false
    for obj in array
        if obj.text is text
            found = true
    found