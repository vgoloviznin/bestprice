$(function() {
    $('.remove-item').on('click', function(e) {
        e.preventDefault();
        
        var res = confirm('Вы действительно хотите удалить этот элемент?');
        
        if (res) {
           var $this = $(this);
            var id = $this.data('id');
            var url = $this.attr('href');

            $.ajax({
                type: 'DELETE',
                url: url,
                data: {id: id},
                success: function(result) {
                    if (result && result.success) {
                        window.location.href = result.data;
                    }
                }
            }); 
        }
    });

    $('.name-autocomplete').autocomplete({
		minLength: 2,
		source: function(req, res){			
			$.get('/product/name', {search: req.term}, function(result) {
				if (result && result.success) {
				    var data = [];
				    $.each(result.data, function(i, el) {
				        data.push(el.name);
				    });
					res(data);
				}
			});
		}
	});

    $('.combo-box').scombobox({
        highlight: true
    });
});