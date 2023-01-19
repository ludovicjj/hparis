<?php

namespace App\DataFixtures;

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
        $manager->flush();
    }
}
