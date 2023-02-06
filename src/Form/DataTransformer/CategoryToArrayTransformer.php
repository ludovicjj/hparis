<?php

namespace App\Form\DataTransformer;

use App\Entity\Category;
use Symfony\Component\Form\DataTransformerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Form\Exception\TransformationFailedException;

class CategoryToArrayTransformer implements DataTransformerInterface
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    /**
     * Transforms an object (Collection) to an array.
     * @param mixed $value
     * @return array
     */
    public function transform(mixed $value): array
    {
        if ($value->count() > 0) {
            return $value->map(fn($category) => (string)$category->getId())->toArray();
        }

        return [];
    }

    /**
     * @param mixed $value
     * @return ArrayCollection|void
     */
    public function reverseTransform(mixed $value): Collection
    {
        if (empty($value)) {
            return new ArrayCollection([]);
        }

        $categories = $this->entityManager->getRepository(Category::class)->findBy(['id' => $value]);
        return new ArrayCollection($categories);
    }
}