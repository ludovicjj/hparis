<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Gallery;
use App\Form\Handler\CreateGalleryHandler;
use App\Form\Type\GalleryType;
use App\Service\PictureCleaner;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin', name: 'admin_')]
#[IsGranted("ROLE_ADMIN")]
class AdminGalleryController extends AbstractController
{
    #[Route('/gallery', name: 'gallery')]
    public function index(): Response
    {
        return $this->render('admin/gallery_index.html.twig');
    }

    #[Route('/gallery/create', name: 'gallery_create')]
    public function create(
        Request $request,
        CreateGalleryHandler $galleryHandler,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        PictureCleaner $pictureCleaner
    ): Response
    {
        $form = $this->createForm(GalleryType::class, new Gallery(), [
            'action' => $this->generateUrl('admin_gallery_create')
        ]);

        if ($request->isXmlHttpRequest() && $request->isMethod('POST')) {
            $gallery = $galleryHandler->handle($request);
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
}