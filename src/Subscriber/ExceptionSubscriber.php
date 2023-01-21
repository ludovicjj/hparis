<?php

namespace App\Subscriber;

use App\Exception\ValidatorException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => ['onKernelException', 2]
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if ($event->getThrowable() instanceof ValidatorException) {
            $this->sendJsonResponseException($event);
        }
    }

    private function sendJsonResponseException(ExceptionEvent $event): void
    {
        /** @var ValidatorException $exception */
        $exception = $event->getThrowable();
        $statusCode = $exception->getCode() ?: 400;
        $data = [
            'message'   => $exception->getMessage(),
            'code'      => $statusCode,
            'errors'    => $exception->getErrors()
        ];

        $event->setResponse(new JsonResponse($data, $statusCode));
    }
}