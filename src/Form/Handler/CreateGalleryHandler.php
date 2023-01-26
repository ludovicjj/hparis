<?php

namespace App\Form\Handler;

use App\Entity\Gallery;
use App\Entity\Thumbnail;
use App\Repository\CategoryRepository;
use App\Repository\PictureRepository;
use Symfony\Component\HttpFoundation\Request;

class CreateGalleryHandler
{
    public function __construct(
        private CategoryRepository $categoryRepository,
        private PictureRepository $pictureRepository
    )
    {
    }

    public function handle(Request $request): Gallery
    {
        $inputBag = $request->request->all();
        $fileBag = $request->files->all();
        $gallery = new Gallery();

        // inputBag
        $titleData = $inputBag['title'] ?? null;
        $categoryId = $inputBag['categories'] ?? [];
        $stateData = $inputBag['state'] ?? '0';
        $uploadedPictureId = $inputBag['uploads'] ?? [];

        // fileBag
        $thumbnailFile = $fileBag['thumbnail']['imageFile']['file'] ?? null;

        // title
        $gallery->setTitle($titleData);

        // category
        foreach ($categoryId as $id) {
            $category = $this->categoryRepository->find($id);
            if ($category) {
                $gallery->addCategory($category);
            }
        }
        // state
        $gallery->setState($stateData === '1');

        // upload
        foreach ($uploadedPictureId as $id) {
            $picture = $this->pictureRepository->find($id);
            if ($picture && $picture->getIsPending() === true) {
                $picture->setIsPending(false);
                $gallery->addPicture($picture);
            }
        }

        // thumbnail
        $thumbnail = new Thumbnail();
        if ($thumbnailFile) {
            $thumbnail->setImageFile($thumbnailFile);
        }
        $gallery->setThumbnail($thumbnail);

        return $gallery;
    }
}