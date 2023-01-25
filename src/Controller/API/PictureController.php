<?php

namespace App\Controller\API;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Picture;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PictureController extends AbstractController
{
    #[Route('/api/pictures', name: "api_picture_create", methods: ["POST"])]
    public function create(Request $request, ValidatorInterface $validator): Response
    {
        if ($request->isXmlHttpRequest()) {
            $uploadFile = $request->files->get('upload', null);

            if ($uploadFile instanceof UploadedFile) {
                $picture = new Picture();
                $picture->setImageFile($uploadFile);

                $constraintList = $validator->validate($picture);
                ErrorsValidationBuilder::buildErrors($constraintList);

                $json = ['id' => 5, 'name' => $uploadFile->getClientOriginalName()];
                return new JsonResponse($json, Response::HTTP_CREATED);
            }
        }
        return new JsonResponse("Bad request", Response::HTTP_BAD_REQUEST);
    }
}