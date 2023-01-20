<?php

namespace App\Controller\Admin;

use App\Entity\Gallery;
use App\Form\Type\GalleryType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/admin', name: 'admin_')]
class AdminGalleryController extends AbstractController
{
    #[Route('/gallery/create', name: 'gallery_create')]
    public function create(Request $request): Response
    {
        $gallery = new Gallery();
        $form = $this->createForm(GalleryType::class, $gallery, [
            'action' => $this->generateUrl('admin_gallery_create')
        ])->handleRequest($request);

        if ($request->isXmlHttpRequest() && $request->isMethod('POST')) {
            $inputBag = $request->request->all();
            $fileBag = $request->files->all();

            $title = $inputBag['title'] ?? null;
            $category = $inputBag['category'] ?? null;
            $state = $inputBag['state'] ?? '0';

            $thumbnail = $fileBag['gallery']['thumbnail']['imageFile']['file'] ?? null;

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        return $this->render('/admin/gallery_create.html.twig', [
            'form' => $form
        ]);
    }
}