'use strict';


$(document).ready(function() {
    var show_id = getParameterByName('show');
    loadSetlistinfo(show_id);
});

function loadSetlistinfo (show_id) {
    $.ajax({
        url: '../../api-custom.php/setlists/' + show_id,
        type: 'post',
        success: function (data, status) {
            var errstring   = '',
                $tbody      = $('#tblShows > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);
                    console.log(result);

                    // if (clearBody)
                    //     $tbody.empty();

                    if (Array.isArray(result) && result.length > 0) {
                        var row, dt;

                        $('#setlistTitle').text(result[0].headline);

                        for (var i = 0; i < result.length; i++) {
                            var songlength = moment().startOf('day').seconds(result[i]['length']).format('m:ss');
                            row = '<tr>' + 
                                editColumn(result[i].id, 'mmj_setlists', 'xyz') +
                                td(result[i].order) +
                                td(result[i].name) +
                                td(songlength) +
                                td(result[i].encore == '1' ? 'Y' : null) +
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
                alert('There was an error: ' + errstring);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            alert('There was an error: ' + errorThrown);
        }

    });
}