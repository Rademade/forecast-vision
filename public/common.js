jQuery(function(){

    $('.item-delete').click(function(){
        let $e = $(this);
        if (confirm('Do you confirm to delete this item?')) {
            $.ajax({
                type: 'DELETE',
                url: $e.attr('data-url')
            }).done(function () {
                console.log($e.closest('tr'));
                $e.closest('tr').remove();
            });
        }
    });

    $('.toggle-ico').click(function() {
        let $el = $(this);
        if ($el.hasClass('toggle-ico-plus')) {
            $el.removeClass('toggle-ico-plus').addClass('toggle-ico-minus');
            $el.closest('tr').next().removeClass('hide');
        } else {
            $el.removeClass('toggle-ico-minus').addClass('toggle-ico-plus');
            $el.closest('tr').next().addClass('hide');
        }
    });


});