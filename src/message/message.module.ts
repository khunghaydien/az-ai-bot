import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PancakeApiService } from 'src/pancake-api/pancake-api.service';
import { BotsModule } from 'src/bots/bots.module';
import { PagesModule } from 'src/pages/pages.module';
import { PagesService } from 'src/pages/pages.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [BotsModule, PagesModule, UsersModule],
  providers: [MessageService, PancakeApiService, PagesService, UsersService],
  controllers: [MessageController]
})
export class MessageModule { }
