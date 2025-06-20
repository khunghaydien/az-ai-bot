import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsController } from './bots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsEntity } from './bots.entity';
import { UsersService } from 'src/users/users.service';
import { UsersEntity } from 'src/users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BotsEntity]),
    TypeOrmModule.forFeature([UsersEntity])
  ],
  providers: [BotsService, UsersService],
  controllers: [BotsController],
  exports: [BotsService],
})
export class BotsModule { }
