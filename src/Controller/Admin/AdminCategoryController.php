<?php

namespace App\Controller\Admin;

use App\Builder\ErrorsValidationBuilder;
use App\Entity\Category;
use App\Form\Type\CreateCategoryType;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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
    public function create(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): Response
    {
        $input = explode(' ', trim($request->request->get('name')));
        $categoryName = implode(' ', array_filter($input, fn($item) => $item !== ''));


        $category = (new Category())->setName(ucwords($categoryName));
        $constraintsViolationList = $validator->validate($category);
        ErrorsValidationBuilder::buildErrors($constraintsViolationList);

        $entityManager->persist($category);
        $entityManager->flush();

        return new JsonResponse([
            "id" => $category->getId(),
            "name" => $category->getName()
        ]);
    }

    #[Route('/api/categories/{id}', name: 'api_category_delete', methods: ['DELETE'])]
    public function delete(int $id, CategoryRepository $categoryRepository): Response
    {
        $category = $categoryRepository->find($id);

        if (!$category) {
            throw new NotFoundHttpException('Category not found');
        }
        $categoryRepository->remove($category, true);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/categories/{id}', name: 'api_category_update', methods: ['POST'])]
    public function update(
        int $id,
        CategoryRepository $categoryRepository,
        Request $request,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): Response
    {
        $updateName = $request->request->get('name');
        $category = $categoryRepository->find($id);

        if (!$category) {
            throw new NotFoundHttpException('Category not found');
        }

        $category->setName($updateName);

        $constraintsViolationList = $validator->validate($category);
        ErrorsValidationBuilder::buildErrors($constraintsViolationList);

        $json = $serializer->serialize(
            $category,
            'json',
            [AbstractNormalizer::IGNORED_ATTRIBUTES => ['galleries']]
        );

        $entityManager->flush();

        return new JsonResponse($json, Response::HTTP_OK, [], true);
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