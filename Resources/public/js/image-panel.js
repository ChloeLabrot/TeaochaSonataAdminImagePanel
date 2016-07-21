if (!window.ImagePanel) {
    window.ImagePanel = (function (ImagePanel) {

        $(document).ready(function () {

            //Images Panel
            //----------------------------------------------------

            var urlElementToUpdate;

            function modalImagesPanel() {

                output =
                    '<div id="modal_images_panel">' +
                    '</div>';
                return output
            }

            function imagesPanelImageTemplate(src) {

                output =
                    '<div class="images-panel-image loading">' +
                    '<img src="' + src + '" data-croppable=true/>' +
                    '<i class="fa fa-search images-panel-preview" aria-hidden="true" title="preview"></i>' +
                    '<i class="fa fa-crop images-panel-crop" aria-hidden="true" title="crop"></i>' +
                    '<i class="fa fa-times images-panel-delete" aria-hidden="true" title="delete"></i>' +
                    '<span></span>' +
                    '</div>';
                return output
            }

            function doneCropping(dataURL) {
                var newImageHtml = imagesPanelImageTemplate(dataURL);
                $('#images_panel_images_list').append(newImageHtml);

                var newImage = $('.images-panel-image').last();

                uploadImage(dataURL, function (err, data) {
                    if (err) {
                        console.log(err);
                        $(newImage).remove();
                        return
                    }

                    $(newImage).attr('data-id', data.id);
                    $($(newImage).children('img')[0]).attr('src', data.url);
                    $(newImage).removeClass('loading')
                })
            }

            function doneGettingImageUrl(url) {
                var newImageHtml = imagesPanelImageTemplate(url);
                $('#images_panel_images_list').append(newImageHtml);

                var newImage = $('.images-panel-image').last();
                uploadImageFromUrl(url, function (err, data) {
                    if (err) {
                        $(newImage).remove();
                        return
                    }
                    $(newImage).attr('data-id', data.id);
                    $($(newImage).children('img')[0]).attr('src', data.url);
                    $(newImage).removeClass('loading')
                })
            }

            function uploadImage(dataURL, cb) {

                var uploadUrl = Routing.generate('teaocha_image_panel_upload_image', null, true);
                var params = {};

                if (dataURL.indexOf('data:image/png') !== -1) {
                    params.image = dataURL.substring("data:image/png;base64,".length, dataURL.length);
                    params.contentType = 'image/png'
                } else {
                    params.image = dataURL.substring("data:image/jepg;base64,".length, dataURL.length);
                    params.contentType = 'image/jpeg'
                }

                $.ajax({
                    method: 'POST',
                    data: params,
                    url: uploadUrl,
                    success: function (response) {
                        cb(null, response);
                        $('body').append(response);
                    },
                    error: function (response) {
                        cb(response)
                    }
                })
            }

            function uploadImageFromUrl(url, cb) {

                var uploadUrl = Routing.generate('teaocha_image_panel_image_from_url', null, true);
                var params = {
                    imageUrl: url
                };

                $.ajax({
                    method: 'POST',
                    data: params,
                    url: uploadUrl,
                    success: function (response) {
                        cb(null, response)
                    },
                    error: function (response) {
                        cb(response)
                    }
                })
            }

            function closeModalImagesPanel() {
                $('#modal_images_panel').remove()
            }

            function useImage(image, imageId) {
                $(urlElementToUpdate).parent().find('img').remove();
                $(urlElementToUpdate).after(image);
                if (urlElementToUpdate) {
                    $(urlElementToUpdate).val(imageId)
                }
                closeModalImagesPanel()
            }

            function addImage(image, imageId, checkboxList) {
                var item = checkboxList.find('input[value='+imageId+']');
                if (item.length == 0) {
                    var li = $("<li>");
                    item = $("<input name='"+checkboxList.attr('data-form-id')+"[images][]' value='"+imageId+"' type='checkbox'>");
                    li.append(item);
                    checkboxList.append(li);
                }
                if (!item.prop('checked')) {
                    item.prop('checked', true);
                    checkboxList.before(image);
                }
                closeModalImagesPanel()
            }

            $(document).on('click', '.images-panel-preview', function (e) {
                e.preventDefault();
                var url = $($(this).siblings('img')[0]).attr('src');
                ModalImage.show(url)
            });

            $(document).on('click', '.images-panel-crop', function (e) {
                e.preventDefault();
                var url = $($(this).siblings('img')[0]).attr('src');
                ModalImage.crop(url, doneCropping)
            });

            $(document).on('click', '.images-panel-delete', function (e) {
                e.preventDefault();

                if (confirm("Do you really want to delete this picture?")) {
                    var imgElement = $(this).parent();
                    var imgId = $(imgElement).attr('data-id');
                    var deleteUrl = Routing.generate('teaocha_image_panel_delete_image', {id: imgId}, true);

                    $(imgElement).addClass('loading');

                    $.ajax({
                        method: 'GET',
                        url: deleteUrl,
                        success: function () {
                            $(imgElement).remove()
                        },
                        error: function () {
                            $(imgElement).removeClass('loading')
                        }
                    })
                }
            });

            $(document).on('click', '#images_panel_upload_button', function (e) {
                e.preventDefault();
                $('#images_panel_file').click()
            });

            $(document).on('change', '#images_panel_file', function (e) {
                e.preventDefault();
                var file = $('#images_panel_file')[0].files[0];
                if (file.type.match('image.*')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        ModalImage.crop(e.target.result, doneCropping)
                    };
                    reader.readAsDataURL(file)
                }
            });

            $(document).on('click', '#images_panel_from_url_button', function (e) {
                e.preventDefault();
                $('#images_panel_url_form').removeClass('hidden')
            });

            $(document).on('click', '#images_panel_url_form_cancel', function (e) {
                e.preventDefault();
                $('#images_panel_url_form').addClass('hidden')
            });

            $(document).on('click', '#images_panel_url_form_ok', function (e) {
                e.preventDefault();
                var imageUrl = $('#images_panel_url_form_input').val();
                $('#images_panel_url_form_input').val('');
                $('#images_panel_url_form').addClass('hidden');
                doneGettingImageUrl(imageUrl)
            });

            $(document).on('click', '.teaocha-image-panel-url-btn', function (e) {
                e.preventDefault();
                $('body').append(modalImagesPanel());
                urlElementToUpdate = $(this).closest('.sonata-ba-field').find('select')[0];
                var route = Routing.generate('teaocha_image_panel_modal', null, true);
                $('#modal_images_panel').load(route);
            });

            $(document).on('click', '#images_panel_close_button', function (e) {
                e.preventDefault();
                closeModalImagesPanel()
            });

            $(document).on('click', '.images-panel-image img', function (e) {
                e.preventDefault();
                var isModal = $('#images_panel').attr('data-modal');
                var isLoading = $(this).parent().hasClass('loading');
                var checkboxList = $('ul[data-form-id]');

                if (isModal == 'true' && !isLoading && !checkboxList.length) {
                    useImage(this, $(this).closest('[data-id]').attr('data-id'));
                } else if (isModal == 'true' && !isLoading && checkboxList.length != 0) {
                    addImage(this, $(this).closest('[data-id]').attr('data-id'), checkboxList);
                }
            });


            //----------------------------------------------------
        })

    })({})
}