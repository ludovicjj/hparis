<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230210131524 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'relation between Gallery and Picture is OneToMany';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gallery_picture DROP FOREIGN KEY FK_2EA10EA14E7AF8F');
        $this->addSql('ALTER TABLE gallery_picture DROP FOREIGN KEY FK_2EA10EA1EE45BDBF');
        $this->addSql('DROP TABLE gallery_picture');
        $this->addSql('ALTER TABLE picture ADD gallery_id INT NOT NULL');
        $this->addSql('ALTER TABLE picture ADD CONSTRAINT FK_16DB4F894E7AF8F FOREIGN KEY (gallery_id) REFERENCES gallery (id)');
        $this->addSql('CREATE INDEX IDX_16DB4F894E7AF8F ON picture (gallery_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE gallery_picture (gallery_id INT NOT NULL, picture_id INT NOT NULL, INDEX IDX_2EA10EA1EE45BDBF (picture_id), INDEX IDX_2EA10EA14E7AF8F (gallery_id), PRIMARY KEY(gallery_id, picture_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE gallery_picture ADD CONSTRAINT FK_2EA10EA14E7AF8F FOREIGN KEY (gallery_id) REFERENCES gallery (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE gallery_picture ADD CONSTRAINT FK_2EA10EA1EE45BDBF FOREIGN KEY (picture_id) REFERENCES picture (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE picture DROP FOREIGN KEY FK_16DB4F894E7AF8F');
        $this->addSql('DROP INDEX IDX_16DB4F894E7AF8F ON picture');
        $this->addSql('ALTER TABLE picture DROP gallery_id');
    }
}
