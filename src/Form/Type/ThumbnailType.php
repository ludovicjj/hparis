<?php

namespace App\Form\Type;

use App\Entity\Thumbnail;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Vich\UploaderBundle\Form\Type\VichImageType;

class ThumbnailType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('imageFile', VichImageType::class, [
            'label' => 'form.gallery.thumbnail.label',
            'label_attr' => ['class' => 'form-label'],
            'label_html' => true,
            'allow_delete' => false,
            'download_uri' => false,
            'help' => 'form.gallery.thumbnail.help',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Thumbnail::class
        ]);
    }
}