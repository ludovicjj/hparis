<?php

namespace App\Service;

use App\Repository\PictureRepository;

class PictureCleaner
{
    public function __construct(private PictureRepository $pictureRepository)
    {
    }

    public function removeOnPendingPicture(): void
    {
        $pendingPictures = $this->pictureRepository->findPendingPicture();
        foreach ($pendingPictures as $pendingPicture) {
            $this->pictureRepository->remove($pendingPicture, true);
        }
    }
}