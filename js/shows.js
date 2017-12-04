'use strict';


$(document).ready(function() {
    loadShowInfo(false);
    newButtonType('Show');
});

function loadShowInfo (clearBody) {
    $.ajax({
        url: '../../api.php/mmj_shows',
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
                swal('Error', 'There was an error: ' + errstring, 'danger');
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            swal('Error', 'There was an error: ' + errorThrown, 'danger');
        }

    });
}