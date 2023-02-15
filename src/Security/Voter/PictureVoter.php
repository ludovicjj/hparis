<?php

namespace App\Security\Voter;

use App\Entity\Picture;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PictureVoter extends Voter
{
    const DELETE = 'delete';

    public function __construct(private RequestStack $requestStack)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Picture) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var Picture $picture */
        $picture = $subject;

        return match($attribute) {
            self::DELETE => $this->canDelete($picture),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canDelete(Picture $picture): bool
    {
        $request = $this->requestStack->getMainRequest();
        $galleryId = $request->request->getInt('galleryId');
        $gallery = $picture->getGallery();

        if (!$gallery) {
            return false;
        }

        if ($gallery->getId() !== $galleryId) {
            return false;
        }

        return true;
    }
}