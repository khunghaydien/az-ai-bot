import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesEntity } from './pages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PagesEntity])],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [TypeOrmModule],
})
export class PagesModule {}
