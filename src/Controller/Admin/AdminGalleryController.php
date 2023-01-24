<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Gallery;
use App\Form\Handler\CreateGalleryHandler;
use App\Form\Type\GalleryType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/admin', name: 'admin_')]
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
        ValidatorInterface $validator
    ): Response
    {
        $form = $this->createForm(GalleryType::class, new Gallery(), [
            'action' => $this->generateUrl('admin_gallery_create')
        ]);

        if ($request->isXmlHttpRequest() && $request->isMethod('POST')) {
            $gallery = $galleryHandler->handle($request);
            dd($gallery);

            $constraintList = $validator->validate($gallery);
            ErrorsValidationBuilder::buildErrors($constraintList);

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        return $this->render('/admin/gallery_create.html.twig', [
            'form' => $form
        ]);
    }
}