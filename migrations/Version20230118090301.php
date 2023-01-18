<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230118090301 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'update gallery table: add foreign key thumbnail_id reference to thumbnail';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gallery ADD thumbnail_id INT NOT NULL');
        $this->addSql('ALTER TABLE gallery ADD CONSTRAINT FK_472B783AFDFF2E92 FOREIGN KEY (thumbnail_id) REFERENCES thumbnail (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_472B783AFDFF2E92 ON gallery (thumbnail_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gallery DROP FOREIGN KEY FK_472B783AFDFF2E92');
        $this->addSql('DROP INDEX UNIQ_472B783AFDFF2E92 ON gallery');
        $this->addSql('ALTER TABLE gallery DROP thumbnail_id');
    }
}
