<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Picture;
use App\Repository\PictureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[IsGranted("ROLE_ADMIN")]
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
            $uploadFile = $request->files->get('upload');

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

    #[Route('/api/pictures', name: "api_picture_search", methods: ["GET"])]
    public function search(
        Request $request,
        PictureRepository $pictureRepository,
        SerializerInterface $serializer
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $page = $request->query->get('page', 1);
            $limit = $request->query->get('limit', 8);
            $galleryId = $request->query->get('id', null);

            if ($page < 1) {
                return new JsonResponse("Page Not Found", Response::HTTP_NOT_FOUND);
            }

            $pictures = $pictureRepository->searchPictureByPageAndGallery($galleryId, $limit, $page);

            $data = $serializer->serialize(
                $pictures,
                'json',
                [AbstractNormalizer::IGNORED_ATTRIBUTES => ['galleries']]
            );

            return new JsonResponse($data, 200, [], true);
        }
        return new JsonResponse("Bad request", Response::HTTP_BAD_REQUEST);
    }
}