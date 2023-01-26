<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Picture;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AdminPictureController extends AbstractController
{
    #[Route('/api/pictures', name: "api_picture_create", methods: ["POST"])]
    public function create(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $uploadFile = $request->files->get('upload', null);

            if ($uploadFile instanceof UploadedFile) {
                $picture = new Picture();
                $picture->setImageFile($uploadFile);
                $picture->setIsPending(true);

                $constraintList = $validator->validate($picture);
                ErrorsValidationBuilder::buildErrors($constraintList);

                $entityManager->persist($picture);
                $entityManager->flush();

                $json = ['id' => $picture->getId(), 'name' => $picture->getImageName()];
                return new JsonResponse($json, Response::HTTP_CREATED);
            }
        }
        return new JsonResponse("Bad request", Response::HTTP_BAD_REQUEST);
    }
}