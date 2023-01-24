<?php

namespace App\Form\Handler;

use App\Entity\Gallery;
use App\Entity\Picture;
use App\Entity\Thumbnail;
use App\Repository\CategoryRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class CreateGalleryHandler
{
    public function __construct(private CategoryRepository $categoryRepository)
    {
    }

    public function handle(Request $request): Gallery
    {
        $inputBag = $request->request->all();
        $fileBag = $request->files->all();
        $gallery = new Gallery();

        // inputBag
        $titleData = $inputBag['title'] ?? null;
        $categoryData = $inputBag['category'] ?? null;
        $stateData = $inputBag['state'] ?? '0';

        // fileBag
        $thumbnailFile = $fileBag['thumbnail']['imageFile']['file'] ?? null;
        $uploadFiles = $fileBag['uploads'] ?? [];

        // title
        $gallery->setTitle($titleData);

        // category
        if ($categoryData) {
            $category = $this->categoryRepository->find($categoryData);
            $gallery->setCategory($category);
        }
        // state
        $gallery->setState($stateData === '1');

        // thumbnail
        $thumbnail = new Thumbnail();
        if ($thumbnailFile) {
            $thumbnail->setImageFile($thumbnailFile);
        }
        $gallery->setThumbnail($thumbnail);

        // pictures (uploads)
        foreach ($uploadFiles as $uploadFile) {
            if ($uploadFile instanceof UploadedFile) {
                $picture = new Picture();
                $picture->setImageFile($uploadFile);
                $gallery->addPicture($picture);
            }
        }

        return $gallery;
    }
}