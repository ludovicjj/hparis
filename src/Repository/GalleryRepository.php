<?php

namespace App\Repository;

use App\Entity\Gallery;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Gallery>
 *
 * @method Gallery|null find($id, $lockMode = null, $lockVersion = null)
 * @method Gallery|null findOneBy(array $criteria, array $orderBy = null)
 * @method Gallery[]    findAll()
 * @method Gallery[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GalleryRepository extends ServiceEntityRepository
{
    const ADMIN_ITEMS_PER_PAGE = 12;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Gallery::class);
    }

    public function save(Gallery $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Gallery $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findGalleryUpdate(int $id): ?Gallery
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.id = :id')
            ->setParameter('id', $id)
            ->innerJoin('g.thumbnail', 't')
            ->addSelect('t')
            ->leftJoin('g.categories', 'c')
            ->addSelect('c')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findGalleryRead(int $id): ?Gallery
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.id = :id')
            ->setParameter('id', $id)
            ->innerJoin('g.thumbnail', 't')
            ->addSelect('t')
            ->leftJoin('g.categories', 'c')
            ->addSelect('c')
            ->leftJoin('g.pictures', 'p')
            ->addSelect('p')
            ->setFirstResult(0)
            ->setMaxResults(12)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPaginatedGallery(int $page): Paginator
    {
        $qb = $this->getGalleryWithLimit($page);

        return new Paginator($qb->getQuery());
    }

    public function search(int $page, ?string $category = null): Paginator
    {
        $qb = $this->getGalleryWithLimit($page);
        if ($category) {
            $qb->innerJoin('g.categories', 'c')
                ->andWhere('c.name LIKE :category')
                ->setParameter('category', "%{$category}%");
        }

        return new Paginator($qb->getQuery());
    }

    private function getGalleryWithLimit($page): QueryBuilder
    {
        $offset = ($page - 1) * self::ADMIN_ITEMS_PER_PAGE;

        return $this->createQueryBuilder('g')
            ->innerJoin('g.thumbnail', 't')
            ->addSelect('t')
            ->setFirstResult($offset)
            ->setMaxResults(self::ADMIN_ITEMS_PER_PAGE);
    }

//    /**
//     * @return Gallery[] Returns an array of Gallery objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('g')
//            ->andWhere('g.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('g.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Gallery
//    {
//        return $this->createQueryBuilder('g')
//            ->andWhere('g.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
