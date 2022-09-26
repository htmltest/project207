$(document).ready(function() {

    $('body').on('click', '.agents-search-tabs-menu ul li a', function(e) {
        var curLi = $(this).parent();
        if (!curLi.hasClass('active')) {
            $('.agents-search-tabs-menu ul li.active').removeClass('active');
            curLi.addClass('active');
            var curIndex = $('.agents-search-tabs-menu ul li').index(curLi);
            $('.agents-search-tabs-content.active').removeClass('active');
            $('.agents-search-tabs-content').eq(curIndex).addClass('active');
        }
        e.preventDefault();
    });

    $('body').on('click', '.agents-results-item-types-title a', function(e) {
        $(this).parent().parent().toggleClass('open');
        e.preventDefault();
    });

    $('body').on('click', '.agents-results-item-types-hide a', function(e) {
        $(this).parent().parent().removeClass('open');
        e.preventDefault();
    });

    $('body').on('click', '.window-link', function(e) {
        var curLink = $(this);
        windowOpen(curLink.attr('href'));
        e.preventDefault();
    });

    $('body').on('keyup', function(e) {
        if (e.keyCode == 27) {
            windowClose();
        }
    });

    $(document).click(function(e) {
        if ($(e.target).hasClass('window')) {
            windowClose();
        }
    });

    $('body').on('click', '.window-close', function(e) {
        windowClose();
        e.preventDefault();
    });

});

function initForm(curForm) {
    curForm.validate({
        ignore: '',
        submitHandler: function(form) {
            var isEmptyForm = true;
            curForm.find('.agents-search-tabs-content.active .form-input input').each(function() {
                if ($(this).val() != '') {
                    isEmptyForm = false;
                }
            });
            if (isEmptyForm) {
                curForm.find('.form-error').remove();
                curForm.append('<div class="form-error"><div class="form-error-title">Произошла ошибка</div><div class="form-error-text">Необходимо заполнить хотя бы одно поле.</div></div>');
            } else {
                curForm.addClass('loading');
                $.ajax({
                    type: 'POST',
                    url: curForm.attr('action'),
                    dataType: 'html',
                    data: curForm.serialize(),
                    cache: false,
                    timeout: 30000
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    curForm.removeClass('loading');
                    curForm.find('.form-error').remove();
                    curForm.append('<div class="form-error"><div class="form-error-title">Произошла ошибка</div><div class="form-error-text">Сервис временно недоступен, попробуйте позже.</div></div>');
                }).done(function(html) {
                    curForm.removeClass('loading');
                    curForm.find('.form-error').remove();
                    $('.agents-search-results').html(html);
                    $('html, body').animate({'scrollTop': $('.agents-search-results').offset().top});
                });
            }
        }
    });

    var optionsINN =  {
        translation: {
            'W': {
                pattern: /[0-9]/, optional: true
            }
        }
    }
    curForm.find('input.INN').mask('WWWWWWWWWWWW', optionsINN);
}

function windowOpen(linkWindow, dataWindow) {
    if ($('.window').length == 0) {
        var curScroll = $(window).scrollTop();
        $('html').addClass('window-open');
        $('body').append('<div class="window"><div class="window-loading"></div></div>')
        $('#page-wrapper').css({'top': -curScroll});
        $('#page-wrapper').data('curScroll', curScroll);
    } else {
        $('.window').append('<div class="window-loading"></div>')
        $('.window-container').addClass('window-container-preload');
    }

    $.ajax({
        type: 'POST',
        url: linkWindow,
        processData: false,
        contentType: false,
        dataType: 'html',
        data: dataWindow,
        cache: false
    }).done(function(html) {
        if ($('.window-container').length == 0) {
            $('.window').html('<div class="window-container window-container-preload">' + html + '<a href="#" class="window-close"></a></div>');
        } else {
            $('.window-container').html(html + '<a href="#" class="window-close"></a>');
            $('.window .window-loading').remove();
        }

        window.setTimeout(function() {
            $('.window-container-preload').removeClass('window-container-preload');
        }, 100);

        $('.window form').each(function() {
            initForm($(this));
        });
    });
}

function windowClose() {
    if ($('.window').length > 0) {

        var isEmptyForm = true;
        $('.window .form-input input').each(function() {
            if ($(this).val() != '') {
                isEmptyForm = false;
            }
        });
        if (isEmptyForm) {
            $('.window').remove();
            $('html').removeClass('window-open');
            $('#page-wrapper').css({'top': 0});
            $(window).scrollTop($('#page-wrapper').data('curScroll'));
        } else {
            if (confirm('Закрыть форму?')) {
                $('.window .form-input input').val('');
                windowClose();
            }
        }
    }
}