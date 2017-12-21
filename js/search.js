'use strict';

var blockLoad = false;

$(document).ready(function() {
    // primary search select2
    $('div.search-group').on('change','select.s2-primary', function (e) {
        // the primary Select2 clears the rest of the search controls.
        var $sel    = $(e.currentTarget),
            ids     = $sel.val(),
            path    = $sel.attr('searchpath'),
            custom  = $sel.attr('custompath'),
            $others = $('select.s2-control').not(this);
            //$others = $('#searchShowBySetlist');

        // now try an API call
        if (blockLoad)
            // block a full call; cleared by other control.
            blockLoad = false;
        else if (Array.isArray(ids)) {
            if (ids.length == 0)
                search_callback(null, true);
            else {
                // call API and get by PK only
                var idlist = ids.join(',');
                search_callback('../../api' + (custom ? '-' + custom : '') + '.php/' + path + '/' + idlist, true);
            }
        }

        // if there's a value and there are other select2's, clear em.
        if ($others && ids && ids.length > 0) {
            blockLoad = true;
            $others.val(null).trigger('change');
            // secondary inputs get cleared too
            $('input.s2-secondary').val('');
        }
    });

    // secondary search select2
    $('div.search-group').on('change','select.s2-secondary', function (e) {
        var ids     = $(e.currentTarget).val(),
            $others = $('select.s2-primary');

        // if there's a value and there are other select2's, clear em.
        if ($others && ids && ids.length > 0) {
            blockLoad = true;
            $others.val(null).trigger('change');
        }
        
        blockLoad = false;
    });

    $('div.search-group').on('input','input.s2-secondary', function (e) {
        var $others = $('select.s2-primary');
        if ($others.length && $others.val().length) {
            blockLoad = true;
            $others.val(null).trigger('change');
        }
            
    });
});