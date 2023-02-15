<?php

namespace App\Form\Handler;

use App\Entity\Gallery;
use App\Entity\Thumbnail;
use App\Repository\CategoryRepository;
use App\Repository\PictureRepository;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;

class GalleryHandler
{
    public function __construct(
        private CategoryRepository $categoryRepository,
        private PictureRepository $pictureRepository
    )
    {
    }

    public function handle(Request $request, FormInterface $form): Gallery
    {
        $inputBag = $request->request->all();
        $fileBag = $request->files->all();
        $gallery = $form->getData();

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
        $thumbnail = $form->get('thumbnail')->getData() ?? new Thumbnail();
        if ($thumbnailFile) {
            $thumbnail->setImageFile($thumbnailFile);
        }
        $gallery->setThumbnail($thumbnail);

        return $gallery;
    }
}