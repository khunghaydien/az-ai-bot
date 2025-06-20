import { Controller, Post, OnModuleInit } from '@nestjs/common';
import { MessageService } from './message.service';
import { BotsService } from 'src/bots/bots.service';
import { ConfigService } from '@nestjs/config';

@Controller('message')
export class MessageController implements OnModuleInit {

    constructor(
        private readonly messageService: MessageService,
        private readonly botsService: BotsService,
        private readonly configService: ConfigService
    ) { }

    async onModuleInit(_?: any) {
        const userEmail = this.configService.get<string>('SUPPORTED_USERS')
        if (!userEmail) {
            console.log('No supported users!');
            return
        }
        const bots = await this.botsService.getBotsByUserEmail(userEmail)
        const accessTokens = bots.map(({ access_token }) => access_token)
        const botIds = bots.map(({ id }) => id)
        console.log(botIds)
        if (!accessTokens.length) {
            console.log('No supported access token!');
            return
        }
        await this.startWebSocket(accessTokens);
    }

    @Post()
    async startWebSocket(accessTokens): Promise<void> {
        await this.messageService.connectWebSocket(accessTokens);
    }

    @Post('restart')
    async restart() {
        console.log('Application is restarting...');
        process.exit(1);
    }
}