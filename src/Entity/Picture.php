<?php

namespace App\Entity;

use App\Repository\PictureRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PictureRepository::class)]
#[Vich\Uploadable]
class Picture
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Vich\UploadableField(mapping: 'picture_images', fileNameProperty: 'imageName', size: 'imageSize', originalName: 'originalName')]
    #[Assert\File(
        maxSize: '1024k',
        maxSizeMessage: 'Fichier trop volumineux. Maximum autorisée {{ limit }} {{ suffix }}.',
        extensions: [
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ],
        extensionsMessage: 'Seuls les fichiers JPG, PNG et GIF sont autorisés.'
    )]
    private ?File $imageFile = null;

    #[ORM\Column(type: 'string')]
    private ?string $imageName = null;

    #[ORM\Column(type: 'integer')]
    private ?int $imageSize = null;

    #[ORM\Column(type: 'string')]
    private ?string $originalName = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $isPending = null;

    #[ORM\ManyToOne(inversedBy: 'pictures')]
    private ?Gallery $gallery = null;


    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile|null $imageFile
     * @return void
     */
    public function setImageFile(?File $imageFile = null): void
    {
        $this->imageFile = $imageFile;

        if (null !== $imageFile) {
            // It is required that at least one field changes if you are using doctrine
            // otherwise the event listeners won't be called and the file is lost
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getImageFile(): ?File
    {
        return $this->imageFile;
    }

    public function setImageName(?string $imageName): void
    {
        $this->imageName = $imageName;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    public function setImageSize(?int $imageSize): void
    {
        $this->imageSize = $imageSize;
    }

    public function getImageSize(): ?int
    {
        return $this->imageSize;
    }

    public function setOriginalName(?string $originalName): void
    {
        $this->originalName = $originalName;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {

        return $this->updatedAt;
    }

    public function setIsPending(bool $isPending): void
    {
        $this->isPending = $isPending;
    }

    public function getIsPending(): ?bool
    {
        return $this->isPending;
    }

    public function getGallery(): ?Gallery
    {
        return $this->gallery;
    }

    public function setGallery(?Gallery $gallery): self
    {
        $this->gallery = $gallery;

        return $this;
    }
}
