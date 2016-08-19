if(!window.ModalImage){window.ModalImage = (function(ModalImage) {

	var imageUrl = "";
	var doneCallback;
	var dataURL = "";
	
	ModalImage.getDataURL = function() {
		return dataURL
	};

	function modalCropper(url) { 
		output = 
		'<div id="modal_cropper">' +
			'<div id="modal_cropper_holder">' +
				'<img id="modal_cropper_image" src="' + url + '" />' +
			'<div id="modal_cropper_buttons">' +
				'<button id="modal_cropper_button_done" class="btn btn-primary ar-btn">Done</button>' +
				'<button id="modal_cropper_button_close" class="btn btn-danger ar-btn">Cancel</button>' +
				'<button id="modal_cropper_button_free_ar" class="btn btn-primary ar-btn">Free AR</button>' +
				'<button id="modal_cropper_button_ar_set" class="btn btn-secondary ar-btn">Set</button>' +
				'<input id="modal_cropper_ar_input" placeholder="Aspect ratio (e.g. 16/9)">' +				
			'</div>' +
		'</div>';
		return output
	}
	
	function modalShow(url) { 
		output = 
		'<div id="modal_cropper">' +
			'<div id="modal_cropper_holder">' +
				'<img id="modal_cropper_image" src="' + url + '" />' +
		'</div>';
		return output
	}

	function openModalCropper() {
	
		$('body').append(modalCropper(imageUrl));

		$('#modal_cropper_button_close').click(ModalImage.removeModalCropper);

		$('#modal_cropper_buttons').click(function(e){
			e.preventDefault();
			return false;
		});
		$('#modal_cropper_holder').click(function(e){
			e.preventDefault();
			return false;
		});

		$('#modal_cropper_image').cropper({background: false, autoCropArea: 1});

		$('#modal_cropper_button_ar_set').click(function(){
			var arval = $('#modal_cropper_ar_input').val();
			var match = arval.match(/^([0-9]+)\/([0-9]+)$/);
			if(match){
				resetModalCropper(arval.split('/')[0]/arval.split('/')[1]);
				return
			}
			match = arval.match(/^([0-9]+):([0-9]+)$/g);
			if(match){
				resetModalCropper(arval.split(':')[0]/arval.split(':')[1]);
			}
		});

		$('#modal_cropper_button_free_ar').click(function(){
			resetModalCropper()
		});

		$('#modal_cropper_button_done').click(function(){
			doneCropping()
		})
	}

	function openModalShow() {

		$('body').append(modalShow(imageUrl));

		$('#modal_cropper').click(ModalImage.removeModalCropper);

		$('#modal_cropper_holder').click(function(e){
			e.preventDefault();
			return false;
		})
	}
	
	function resetModalCropper(aspectRatio) {
		$('#modal_cropper_image').cropper('destroy');

		if(aspectRatio !== null) {
			$('#modal_cropper_image').cropper({background: false, aspectRatio: aspectRatio, autoCropArea: 0.9})
		}
		else {	
			$('#modal_cropper_image').cropper({background: false, autoCropArea: 0.9})
		}
	}
	
	function doneCropping() {
		$('#modal_cropper_button_done').addClass('loading').html('');

		modalCropperImage = $('#modal_cropper_image');
		var type = 'image/jpeg';
		if (modalCropperImage.attr('src').indexOf('data:image/png') !== -1) {
			type = 'image/png';
		}
		dataURL = modalCropperImage.cropper('getCroppedCanvas').toDataURL(type, 1.0);
		while(dataURL.length > 1000000) {
			dataURL = modalCropperImage.cropper('getCroppedCanvas').toDataURL(type, Math.sqrt(1000000.0/dataURL.length));
		}

		modalCropperImage.cropper('destroy');
		ModalImage.removeModalCropper();
		
		doneCallback(dataURL)
	}
	
	ModalImage.crop = function(srcUrl, cb) {
		doneCallback = cb;
		imageUrl = srcUrl;
		openModalCropper()
	};
	
	ModalImage.show = function(srcUrl) {
		imageUrl = srcUrl;
		openModalShow()
	};

	ModalImage.removeModalCropper = function() {	
		$('#modal_cropper').remove()		
	};
	
	return ModalImage
})({})}
