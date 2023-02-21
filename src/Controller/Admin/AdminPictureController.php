<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Picture;
use App\Repository\PictureRepository;
use App\Security\Voter\PictureVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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

        return $this->sendInvalidHeader();
    }

    #[Route('/api/pictures', name: "api_picture_search", methods: ["GET"])]
    public function search(
        Request $request,
        PictureRepository $pictureRepository,
        SerializerInterface $serializer
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $page = $request->query->getInt('page', 1);
            $galleryId = $request->query->getInt('id');
            $count = $request->query->getInt('count', PictureRepository::ITEMS_PER_PAGE);

            if ($page < 1) {
                return new JsonResponse([
                    "message" => "Page Not Found",
                    "code" => Response::HTTP_NOT_FOUND
                ], Response::HTTP_NOT_FOUND);
            }

            $pictures = $pictureRepository->searchPictureByPageAndGallery($galleryId, $page, $count);

            $data = $serializer->serialize(
                $pictures,
                'json',
                [AbstractNormalizer::IGNORED_ATTRIBUTES => ['gallery']]
            );

            return new JsonResponse($data, 200, [], true);
        }

        return $this->sendInvalidHeader();
    }

    #[Route('/api/pictures/{id}', name: "api_picture_delete", methods: ["DELETE"])]
    public function delete(
        Request $request,
        PictureRepository $pictureRepository,
        SerializerInterface $serializer,
        int $id,
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $page = $request->request->getInt('page', 1);
            $count = $request->request->getInt('count');
            $galleryId = $request->request->getInt('galleryId');

            $pictureToDelete = $pictureRepository->find($id);

            if (!$pictureToDelete) {
                throw new NotFoundHttpException('Picture Not Found');
            }

            $this->denyAccessUnlessGranted(PictureVoter::DELETE, $pictureToDelete);
            $nextPicture = $pictureRepository->findFistImageOnNextPage($galleryId, $page);
            $pictureRepository->remove($pictureToDelete, true);

            if ($count !== PictureRepository::ITEMS_PER_PAGE || !$nextPicture) {
                return new JsonResponse(null, Response::HTTP_NO_CONTENT);
            }

            $json = $serializer->serialize(
                $nextPicture,
                'json',
                [AbstractNormalizer::IGNORED_ATTRIBUTES => ['gallery']]
            );

            return new JsonResponse($json, Response::HTTP_OK, [], true);
        }

        return $this->sendInvalidHeader();
    }

    private function sendInvalidHeader(): Response
    {
        $data = ['message' => "Bad request: Invalid Headers", 'code' => Response::HTTP_BAD_REQUEST];
        return new JsonResponse($data, Response::HTTP_BAD_REQUEST);
    }
}