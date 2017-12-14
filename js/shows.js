'use strict';

var placeautocomplete;

$(document).ready(function() {
    loadShowInfo(null, false);
    newButtonType('Show');
    initGoogleMap('gmaps');

    var $search = $('#searchShows');
    if ($search.length)
        singleSearchSelect2($search, 'shows');

    // show search select2
    $('div.search-group').on('change','#searchShows', function (e) {
        var ids = $(e.currentTarget).val();

        if (Array.isArray(ids)) {
            if (ids.length == 0)
                loadShowInfo(null, true);
            else {
                // call API and get selected songs only
                var showlist = ids.join(',');
                loadShowInfo('../../api.php/mmj_shows/' + showlist, true);
            }
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
            var errstring   = '',
                $tbody      = $('#tblShows > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);

                    if (clearBody)
                        $tbody.empty();

                    if (Array.isArray(result) && result.length > 0) {
                        var row, dt;

                        for (var i = 0; i < result.length; i++) {
                            dt = new Date(result[i].date);

                            row = '<tr>' + 
                                editDeleteColumn(result[i].id, 'mmj_shows', true, result[i].headline) +
                                td(moment(result[i].date).format('MM/DD/YYYY')) +
                                td(result[i].headline) +
                                td(result[i].location) +
                                (result[i] && result[i].address.length > 0 ? 
                                    td('<a href="https://maps.google.com/maps?q=' + 
                                    result[i].address + 
                                    '" target="_blank">' + 
                                    result[i].address + 
                                    '</a>') : td(result[i].address)) +
                                td(result[i].notes) +
                                '</tr>';

                            $tbody.append(row);
                        }
                    }
                }
                catch (ex) {
                    errstring = ex.message;
                }
            }
            else 
                errstring = status;

            if (errstring.length > 0)
                swal('Error', 'There was an error: ' + errstring, 'error');
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
    placeautocomplete = new google.maps.places.Autocomplete(input);

    placeautocomplete.addListener('place_changed', fillInAddress);
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
                address = item.short_name + ' ';
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
    $form.find('#google_place_id').val(place.id);
    $form.find('#location').val(place.name);
    $form.find('#address').val(address);
    $form.find('#city').val(city);
    $form.find('#state').val(state);
    $form.find('#zip').val(zip);
    $form.find('#country').val(country);
}