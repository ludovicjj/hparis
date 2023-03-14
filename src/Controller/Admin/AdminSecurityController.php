<?php

namespace App\Controller\Admin;

use App\Form\Type\TestEmailType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

class AdminSecurityController extends AbstractController
{
    #[Route('/admin/security', name: 'admin_security_index')]
    public function index(Request $request, MailerInterface $mailer): Response
    {
        $form = $this->createForm(TestEmailType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            $email = (new Email())
            ->from('hello@example.com')
            ->to('you@example.com')
            //->cc('cc@example.com')
            //->bcc('bcc@example.com')
            //->replyTo('fabien@example.com')
            //->priority(Email::PRIORITY_HIGH)
            ->subject('Time for Symfony Mailer!')
            ->text('Sending emails is fun again!')
            ->html('<p>See Twig integration for better HTML integration!</p>');


        try {
            $mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            dd($e);
        }
        }


        return $this->render('admin/security_index.html.twig', [
            "form" => $form
        ]);
    }
}