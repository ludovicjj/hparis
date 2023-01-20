<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher)
    {

    }
    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $hashedPassord = $this->passwordHasher->hashPassword($user, 'plainpassword');
        $user
            ->setUsername('john')
            ->setRoles(['ROLE_ADMIN'])
            ->setPassword($hashedPassord)
        ;
        $manager->persist($user);

        $categories = ['Mariage', 'Life Style', 'Mode', 'Old School', 'Art'];
        foreach ($categories as $categoryName) {
            $category = new Category();
            $category->setName($categoryName);
            $manager->persist($category);
        }

        $manager->flush();
    }
}
