<?php

namespace App\Form\Type;

use App\Entity\Category;
use App\Entity\Gallery;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class GalleryType extends AbstractType
{
    public function __construct(private UrlGeneratorInterface $urlGenerator)
    {
    }

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
            ->add('categories', CategoryType::class, [
                'class' => Category::class,
                'label' => 'form.gallery.category.label',
                'help' => 'form.gallery.category.help',
                'search' => $this->urlGenerator->generate('api_category_search')
            ])
            ->add('thumbnail', ThumbnailType::class, [
                'label' => false
            ])
            ->add("uploads", FileType::class, [
                'mapped' => false,
                'label' => false,
                'multiple' => true,
                'attr' => [
                    'hidden' => 'hidden'
                ]
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