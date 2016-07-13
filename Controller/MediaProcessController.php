<?php

namespace Teaocha\SonataAdminImagePanelBundle\Controller;

use AppBundle\Services\ImagePanelRequestHandler;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class MediaProcessController extends Controller
{
    function base64_to_file($base64_string, $output_file)
    {
        $ifp = fopen($output_file, "wb");

        fwrite($ifp, base64_decode($base64_string));
        fclose($ifp);

        return $output_file;
    }

    public function imageFromUrlAction(Request $request)
    {

        if (!$request->request->has('imageUrl')) {
            $response = new Response();
            $response->setContent("Bad request");
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }

        $url  = $request->request->get('imageUrl');
        $file = $this->get('kernel')->getRootDir() . "/../web/uploads/" . mt_rand();
        if (strpos($url, '.jpeg') !== false || strpos($url, '.jpg') !== false) {
            $file .= '.jpeg';
            file_put_contents($file, file_get_contents($url));
        } elseif (strpos($url, '.png') !== false) {
            $file .= '.png';
            file_put_contents($file, file_get_contents($url));
        } else {
            $response = new Response();
            $response->setContent('File extension not supported, please upload image of type jpg/jpeg or png');
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }

        /** @var ImagePanelRequestHandler $imageHandler */
        $imageHandler = $this->get('teaocha.image_panel.request_handler_provider')->getHandler();

        try {
            $result = $imageHandler->imageUpload($file);

            return new JsonResponse(array('id' => $result->getId(), 'url' => $this->get('assets.packages')->getUrl($result->getPreviewUrl())));
        } catch (\Exception $e) {
            $response = new Response();
            $response->setContent($e->getMessage());
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }
    }

    public function uploadImageAction(Request $request)
    {
        if (!$request->request->has('image') || !$request->request->has('contentType')) {
            $response = new Response();
            $response->setContent("Bad request");
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }

        $imageData   = $request->request->get('image');
        $contentType = $request->request->get('contentType');
        if (strpos($contentType, 'jpeg') !== false) {
            $file = $this->base64_to_file($imageData, $this->get('kernel')->getRootDir() . "/../web/uploads/" . mt_rand() . ".jpeg");
        } elseif (strpos($contentType, 'png') !== false) {
            $file = $this->base64_to_file($imageData, $this->get('kernel')->getRootDir() . "/../web/uploads/" . mt_rand() . ".png");
        } else {
            $response = new Response();
            $response->setContent('File extension not supported, please upload image of type jpg/jpeg or png');
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }

        /** @var ImagePanelRequestHandler $imageHandler */
        $imageHandler = $this->get('teaocha.image_panel.request_handler_provider')->getHandler();

        try {
            $result = $imageHandler->imageUpload($file);

            return new JsonResponse(array('id' => $result->getId(), 'url' => $this->get('assets.packages')->getUrl($result->getPreviewUrl())));
        } catch (\Exception $e) {
            $response = new Response();
            $response->setContent($e->getMessage());
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }
    }

    public function deleteImageAction($id)
    {
        /** @var ImagePanelRequestHandler $imageHandler */
        $imageHandler = $this->get('teaocha.image_panel.request_handler_provider')->getHandler();

        try {
            $imageHandler->deleteImage($id);
            $response = new Response();
            $response->setStatusCode(Response::HTTP_OK);

            return $response;
        } catch (\Exception $e) {
            $response = new Response();
            $response->setContent($e->getMessage());
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);

            return $response;
        }
    }
}
