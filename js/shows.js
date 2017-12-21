'use strict';

var placeautocomplete;
search_callback = loadShowInfo;

$(document).ready(function() {
    loadShowInfo(null, false);
    newButtonType('Show');
    initGoogleMap('gmaps');

    var $search = $('#searchShows');
    if ($search.length)
        singleSearchSelect2($search, 'shows');

    var $showBySetlist = $('#searchShowBySetlist');
    if ($showBySetlist.length)
        singleSearchSelect2($showBySetlist, 'songs');

    $('#submitSearchShow').on('click', function () {
        var obj = {};

        var songids = $('#searchShowBySetlist').val(),
            start   = moment($('#startDate').val(), ['M/D/YYYY','M/D/YY']),
            end     = moment($('#endDate').val(), ['M/D/YYYY','M/D/YY']);

        if (Array.isArray(songids) && songids.length > 0) {
            obj['song_ids'] = songids;
            obj['songtype'] = $('input[name="songtype"]:checked').val();
        }

        if (start.isValid())
            obj['start'] = start.format('MM/DD/YYYY');

        if (end.isValid())
            obj['end'] = end.format('MM/DD/YYYY');
        
        if (!$.isEmptyObject(obj)) {
            $('div.container').append('<div class="spinner"></div>');
            $.ajax({
                url: '../../api-custom.php/searchshows',
                data: JSON.stringify(obj),
                type: 'post',
                contentType: "application/json",
                success: function (data, status) {
                    showSuccess(data, status, true);
                },
                error: function (data, status, errorThrown) {
                    console.log('Error', data, status, errorThrown);
                    swal('Error', 'There was an error: ' + errorThrown, 'error');
                },
                complete: function () {
                    $('div.spinner').remove();
                }
            });
        }
    });
});

function loadShowInfo (url, clearBody) {
    $('div.container').append('<div class="spinner"></div>');
    if (url == null)
        url = '../../api.php/mmj_shows';

    $.ajax({
        url: url,
        type: 'post',
        success: function (data, status) {
            showSuccess(data, status, clearBody);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            swal('Error', 'There was an error: ' + errorThrown, 'error');
        },
        complete: function () {
            $('div.spinner').remove();
        }

    });
}

function initGoogleMap(ctrl) {
    var input = document.getElementById(ctrl);
    if (input) {
        placeautocomplete = new google.maps.places.Autocomplete(input);
        placeautocomplete.addListener('place_changed', fillInAddress);
    }
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place       = placeautocomplete.getPlace(),
        $form       = $('#showsform'),
        location    = '',
        address     = '',
        city        = '',
        state       = '',
        zip         = '',
        country     = '',
        area        = '',
        item, placetype;

    console.log(place);

    for (var i = 0; i < place.address_components.length; i++) {
        item = place.address_components[i];
        placetype = item.types[0];

        switch (placetype) {
            case 'street_number':
                address = item.short_name + ' ' + address;
                break;
            // street
            case 'route':
                address = address + item.short_name;
                break;
            // city
            case 'sublocality_level_1':
            case 'locality':
                city = (city.length > 0 ? ', ' : '') + item.short_name;
                break;
            // state
            case 'administrative_area_level_1':
                state = item.short_name;
                break;
            case 'administrative_area_level_2':
                area = item.short_name;
                break;
            case 'country':
                country = item.long_name;
                break;
            case 'postal_code':
                zip = item.short_name;
                break;
        }
    }

    // in case empty city, use greater area
    if (state.length == 0)
        state = area;

    // set values
    var coords = place.geometry.location.lat() + ',' + place.geometry.location.lng();
    $form.find('#google_place_id').val(place.id);
    $form.find('#google_place_coords').val(coords);
    $form.find('#location').val(place.name);
    $form.find('#address').val(address);
    $form.find('#city').val(city);
    $form.find('#state').val(state);
    $form.find('#zip').val(zip);
    $form.find('#country').val(country);
}

function showSuccess (data, status, clearBody) {
    var errstring   = '',
        $tbody      = $('#tblShows > tbody');

    if (status == 'success') {
        var result;
        try {
            result = JSON.parse(data);

            if (clearBody)
                $tbody.empty();

            if (Array.isArray(result) && result.length > 0) {
                var row, dt, location;

                for (var i = 0; i < result.length; i++) {
                    dt = new Date(result[i].date);
                    if (result[i].google_place_id && result[i].google_place_coords && result[i].location) {
                        location = '<a href="https://www.google.com/maps/search/?api=1&query=' +
                                    result[i].google_place_coords +
                                    '&query_place_id=' +
                                    result[i].google_place_id + 
                                    '" target="_blank">' +
                                    result[i].location + 
                                    '</a>';
                    }
                    else
                        location = result[i].location; 

                    row = '<tr>' + 
                        editDeleteColumn(result[i].id, 'mmj_shows', true, result[i].headline) +
                        td(moment(result[i].date).format('MM/DD/YYYY')) +
                        td(result[i].headline) +
                        // td(result[i].location) +
                        // (result[i] && result[i].address.length > 0 ? 
                        //     td('<a href="https://maps.google.com/maps?q=' + 
                        //     result[i].address + 
                        //     '" target="_blank">' + 
                        //     result[i].address + 
                        //     '</a>') : td(result[i].address)) +
                        td(location) +
                        td(result[i].notes) +
                        '</tr>';

                    $tbody.append(row);
                }
            }
            else
                $tbody.append(emptyRow(5));
        }
        catch (ex) {
            errstring = ex.message;
        }
    }
    else 
        errstring = status;

    if (errstring.length > 0)
        swal('Error', 'There was an error: ' + errstring, 'error');
}