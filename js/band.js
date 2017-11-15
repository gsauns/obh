'use strict';

$(document).ready(function() {
    loadBandInfo();
});

function bandTile(id, name, instruments, twitter, photo_url) {
    // var expr    = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    //     regex   = new RegExp(expr);

    return '<div class="col-xs-12 col-sm-6">' +
                '<div class="thumbnail">' +
                    '<img class="band-img" src="' + photo_url +
                    '" alt="' + name + '">' +
                    '<div class="caption">' +
                        '<h3>' + name + '</h3>' +
                        '<p>' + (instruments || '') + '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
}

function loadBandInfo () {
    $.ajax({
        url: '../../api.php/mmj_bandmembers',
        type: 'post',
        success: function (data, status) {
            var errstring = '';
            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);

                    if (Array.isArray(result) && result.length > 0) {
                        var row,
                            dt,
                            $tbody  = $('#bandmembers');

                        for (var i = 0; i < result.length; i++) {
                            row = bandTile(
                                result[i].id,
                                result[i].name,
                                result[i].instruments,
                                result[i].twitter,
                                result[i].photo_url
                            );

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