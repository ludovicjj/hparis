<?php

namespace App\Controller\Ui;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function home()
    {
        return $this->render('ui/home.html.twig');
    }
}