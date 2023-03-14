<?php

namespace App\Controller\Admin;

use App\Repository\CategoryRepository;
use App\Repository\GalleryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted("ROLE_ADMIN")]
class AdminController extends AbstractController
{
    #[Route('/admin', name: 'admin_dashboard')]
    public function dashboard(
        GalleryRepository $galleryRepository,
        CategoryRepository $categoryRepository
    ): Response
    {
        $galleryCount = $galleryRepository->count([]);
        $categoryCount = $categoryRepository->count([]);

        return $this->render('admin/admin_dashboard.html.twig', [
            "galleryCount" => $galleryCount,
            "categoryCount" => $categoryCount
        ]);
    }
}