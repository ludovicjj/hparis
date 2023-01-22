<?php

namespace App\Form\Type;

use App\Entity\Category;
use App\Entity\Gallery;
use App\Entity\Picture;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class GalleryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'form.gallery.title.label',
                'label_html' => true,
                'help' => 'form.gallery.title.help',
                'required' => true
            ])
            ->add('state', CheckboxType::class, [
                "label" => 'form.gallery.state.label',
                'required' => false,
                'help' => 'form.gallery.state.help',
            ])
            ->add('category', EntityType::class, [
                'class' => Category::class,
                'label' => 'form.gallery.category.label',
                'help' => 'form.gallery.category.help',
                'placeholder' => 'form.gallery.category.placeholder',
                'multiple' => false,
                'expanded' => false,
                'required' => false,
                'choice_label' => function (Category $category) {
                    return $category->getName();
                }
            ])
            ->add('thumbnail', ThumbnailType::class, [
                'label' => false
            ])
            ->add("uploads", CollectionType::class, [
                "mapped" => false,
                'label' => 'form.gallery.uploads.label',
                'entry_type' => UploadType::class,
                'entry_options' => [
                    'label' => false,
                    'row_attr' => [
                        'class' => 'upload-item'
                    ]
                ],
                'allow_add' => true,
                'allow_delete' => true,
                'prototype' => true,
                'delete_empty' => function (Picture $picture = null) {
                    return null === $picture || empty($picture->getImageFile());
                }
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'form.gallery.submit.label',
                'attr' => [
                    'class' => 'btn-main',
                ]
            ])
            ;
    }

    public function getBlockPrefix(): string
    {
        return '';
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Gallery::class,
            'translation_domain' => 'form'
        ]);
    }
}