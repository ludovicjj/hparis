<?php

namespace App\Repository;

use App\Entity\Picture;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Picture>
 *
 * @method Picture|null find($id, $lockMode = null, $lockVersion = null)
 * @method Picture|null findOneBy(array $criteria, array $orderBy = null)
 * @method Picture[]    findAll()
 * @method Picture[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PictureRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Picture::class);
    }

    public function save(Picture $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Picture $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findPendingPicture(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.isPending = :pending')
            ->setParameter('pending', true)
            ->getQuery()
            ->getResult();
    }

    public function paginatedPictureByGallery(int $galleryId, int $limit, int $page): Paginator
    {
        $query = $this->searchPicturesByGalleryAndLimit($galleryId, $limit, $page);
        return new Paginator($query);
    }

    public function searchPictureByPageAndGallery(int $galleryId, int $limit, int $page)
    {
        $query = $this->searchPicturesByGalleryAndLimit($galleryId, $limit, $page);
        return $query->getResult();
    }

    private function searchPicturesByGalleryAndLimit(int $galleryId, int $limit, int $page): Query
    {
        $offset = ($page - 1 ) * $limit;

        return $this->createQueryBuilder('p')
            ->innerJoin('p.galleries', 'g')
            ->andWhere('g.id = :id')
            ->setParameter('id', $galleryId)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery();
    }

    public function findLastImageByPage(int $galleryId)
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.galleries', 'g')
            ->andWhere('g.id = :id')
            ->setParameter('id', $galleryId)
            ->setFirstResult(8)
            ->setMaxResults(1)
            ->getQuery()
            ->getResult();
    }

//    /**
//     * @return Picture[] Returns an array of Picture objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Picture
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
