<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Category;
use App\Form\Type\CreateCategoryType;
use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[IsGranted("ROLE_ADMIN")]
class AdminCategoryController extends AbstractController
{
    #[Route('/admin/categories', name: 'admin_category_index')]
    public function index(CategoryRepository $categoryRepository): Response
    {
        $categories = $categoryRepository->findAllCategoriesWithCountGallery();
        $form = $this->createForm(CreateCategoryType::class);

        return $this->render('admin/category_index.html.twig', [
            "categories" => $categories,
            "form" => $form
        ]);
    }

    #[Route('/api/categories', name: 'api_category_create', methods: ['POST'])]
    public function create(Request $request, ValidatorInterface $validator): Response
    {
        $input = explode(' ', trim($request->request->get('name')));
        $categoryName = implode(' ', array_filter($input, fn($item) => $item !== ''));


        $category = (new Category())->setName($categoryName);
        $constraintsViolationList = $validator->validate($category);
        ErrorsValidationBuilder::buildErrors($constraintsViolationList);

        return new JsonResponse([
            "id" => $category->getId(),
            "name" => ucwords($category->getName())
        ]);
    }

    #[Route('/api/categories', name: 'api_category_search', methods: ['GET'])]
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