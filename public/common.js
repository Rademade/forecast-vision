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

});