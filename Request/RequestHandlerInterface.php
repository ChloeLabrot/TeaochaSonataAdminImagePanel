<?php

namespace Teaocha\SonataAdminImagePanelBundle\Request;

interface RequestHandlerInterface
{

	/**
     * Handles the image data from an image upload request
	 * Return a RequestResult object that contains a url to a preview of the image and an id that refers to it
     *
	 * @param  string $file The file path of the uploaded image
	 *
     * @return RequestResult
     */
	public function imageUpload($file);
	
	/**
     * Handles a request to delete an image (nothing to return, throw an exception to indicate failure)
     *
	 * @param int $id The id of the image to be removed
     */
	public function deleteImage($id);
	
	/**
     * Gets the list of images you want to display in the images panel
	 * Return an array of RequestResults with all the preview images and their ids
	 *
     * @return RequestResult[]
     */
	public function listImages();

}
