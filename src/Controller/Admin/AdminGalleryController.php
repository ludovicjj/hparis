<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Gallery;
use App\Form\Handler\GalleryHandler;
use App\Form\Type\GalleryType;
use App\Repository\CategoryRepository;
use App\Repository\GalleryRepository;
use App\Repository\PictureRepository;
use App\Service\PictureCleaner;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[IsGranted("ROLE_ADMIN")]
class AdminGalleryController extends AbstractController
{
    #[Route('/admin/gallery', name: 'admin_gallery')]
    public function index(
        GalleryRepository $galleryRepository,
        CategoryRepository $categoryRepository,
    ): Response
    {
        $categories = $categoryRepository->findAll();
        $paginatedGallery = $galleryRepository->findPaginatedGallery(1);
        $galleryCount = $paginatedGallery->count();
        $galleries = iterator_to_array($paginatedGallery);

        return $this->render('admin/gallery_index.html.twig', [
            'galleries'     => $galleries,
            'categories'    => $categories,
            'total'         => $galleryCount,
            'per_page'      => GalleryRepository::ADMIN_ITEMS_PER_PAGE
        ]);
    }

    #[Route('/admin/gallery/create', name: 'admin_gallery_create')]
    public function create(
        Request                $request,
        GalleryHandler         $galleryHandler,
        ValidatorInterface     $validator,
        EntityManagerInterface $entityManager,
        PictureCleaner         $pictureCleaner
    ): Response
    {
        $form = $this->createForm(GalleryType::class, new Gallery(), [
            'action' => $this->generateUrl('admin_gallery_create')
        ]);

        if ($request->isXmlHttpRequest() && $request->isMethod('POST')) {
            $gallery = $galleryHandler->handle($request, $form);
            $constraintList = $validator->validate($gallery);
            ErrorsValidationBuilder::buildErrors($constraintList);

            $entityManager->persist($gallery);
            $entityManager->flush();

            $pictureCleaner->removeOnPendingPicture();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        return $this->render('/admin/gallery_create.html.twig', [
            'form' => $form
        ]);
    }

    #[Route('/admin/gallery/update/{id}', name: 'admin_gallery_update')]
    public function update(
        Request            $request,
        int                $id,
        GalleryRepository  $galleryRepository,
        PictureRepository  $pictureRepository,
        GalleryHandler     $galleryHandler,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
    ): Response
    {
        $gallery = $galleryRepository->findGalleryUpdate($id);

        if (!$gallery) {
            throw new NotFoundHttpException('gallery not found');
        }

        $gallery->getThumbnail()->setImageFile(
            new File($this->getParameter('thumbnail_directory') .'/'.$gallery->getThumbnail()->getImageName())
        );

        $form = $this->createForm(GalleryType::class, $gallery, [
            'action' => $this->generateUrl('admin_gallery_update', ['id' => $id])
        ]);

        if ($request->isXmlHttpRequest() && $request->isMethod('POST')) {
            $gallery = $galleryHandler->handle($request, $form);
            $constraintList = $validator->validate($gallery);
            ErrorsValidationBuilder::buildErrors($constraintList);

            $entityManager->flush();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        $paginatedPicture = $pictureRepository->paginatedPictureByGallery($id, 1);
        $pictures = iterator_to_array($paginatedPicture);

        return $this->render('/admin/gallery_update.html.twig', [
            'form'          => $form,
            'pictures'      => $pictures,
            'totalPictures' => $paginatedPicture->count(),
            'per_page'      => PictureRepository::ITEMS_PER_PAGE,
            'galleryId'     => $id
        ]);
    }

    #[Route('/admin/gallery/{id}', name: 'admin_gallery_read')]
    public function read(
        int $id,
        GalleryRepository $galleryRepository
    ): Response
    {
        $gallery = $galleryRepository->findGalleryRead($id);

        if (!$gallery) {
            throw new NotFoundHttpException('Gallery not found');
        }

        return $this->render('admin/gallery_read.html.twig', [
            'gallery' => $gallery
        ]);
    }

    #[Route('/api/galleries/search', name: 'api_gallery_search', methods: ['GET'])]
    public function search(
        Request $request,
        GalleryRepository $galleryRepository,
        SerializerInterface $serializer
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $page = $request->query->getInt('page', 1);
            $category = $request->query->get('c');

            if ($page < 1) {
                return new JsonResponse([
                    "message" => "Page Not Found",
                    "code" => Response::HTTP_NOT_FOUND
                ], Response::HTTP_NOT_FOUND);
            }

            $paginatedGallery = $galleryRepository->search($page, $category);
            $galleries = iterator_to_array($paginatedGallery);
            $total = $paginatedGallery->count();

            $json = $serializer->serialize(
                ['galleries' => $galleries, 'total' => $total],
                'json',
                [AbstractNormalizer::IGNORED_ATTRIBUTES => ['pictures', 'categories']]
            );

            return new JsonResponse($json, Response::HTTP_OK, [], true);

        }

        return $this->sendInvalidHeader();
    }

    #[Route('/api/galleries/{id}', name: 'api_gallery_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        GalleryRepository $galleryRepository,
        Request $request,
        SerializerInterface $serializer
    ): Response
    {
        if ($request->isXmlHttpRequest()) {
            $galleryToDelete = $galleryRepository->find($id);

            if (!$galleryToDelete) {
                throw new NotFoundHttpException('Gallery not found');
            }

            $page = $request->request->getInt('page', 1);
            $count = $request->request->getInt('count');
            $category = $request->request->get('category');

            $paginator = $galleryRepository->findGalleryOnNextPage($page, $category);
            $nextGallery = iterator_to_array($paginator);
            $galleryRepository->remove($galleryToDelete, true);

            $total = $paginator->count();

            if ($count !== GalleryRepository::ADMIN_ITEMS_PER_PAGE || empty($nextGallery)) {
                $data = $serializer->serialize(["gallery" => [], "total" => $total], 'json');
            } else {
                $data = $serializer->serialize(
                    ["gallery" => $nextGallery, "total" => $total],
                    'json',
                    [AbstractNormalizer::IGNORED_ATTRIBUTES => ['pictures', 'categories']]
                );
            }

            return new JsonResponse($data, Response::HTTP_OK, [], true);
        }

        return $this->sendInvalidHeader();
    }

    private function sendInvalidHeader(): Response
    {
        $data = ['message' => "Bad request: Invalid Headers", 'code' => Response::HTTP_BAD_REQUEST];
        return new JsonResponse($data, Response::HTTP_BAD_REQUEST);
    }
}