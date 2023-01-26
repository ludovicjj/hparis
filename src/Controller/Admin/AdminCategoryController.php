<?php

namespace App\Controller\Admin;

use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

class AdminCategoryController extends AbstractController
{
    #[Route('/api/categories', name: 'api_category_search', methods: ['POST'])]
    public function search(
        Request $request,
        CategoryRepository $categoryRepository,
        SerializerInterface $serializer
    ): Response
    {
        $categories = $categoryRepository->search($request->query->get('s', ''));
        $json = $serializer->serialize(
            $categories,
            'json',
            [AbstractNormalizer::IGNORED_ATTRIBUTES => ['galleries']]
        );

        return new JsonResponse($json, 200, [], true);
    }
}