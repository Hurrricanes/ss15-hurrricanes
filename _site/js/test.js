$('#help_icon,.panel_title').click(function () {
          
    if($('#help_icon').is(':visible')){
    $('#help_icon').fadeOut(function () {
        $('#help').toggle('slide', {
            direction: 'left'
        }, 1000);
    });
    }
    else{
        $('#help').toggle('slide', {
            direction: 'left'
        }, 1000, function(){ $('#help_icon').fadeIn();});
    }
});

