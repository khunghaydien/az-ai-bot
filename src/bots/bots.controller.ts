import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsEntity } from './bots.entity';

@Controller('bots')
export class BotsController {
    constructor(private readonly botsService: BotsService) { }

    @Post()
    async createBot(
        @Body('access_token') access_token: string,
        @Body('user_id') user_id: string
    ): Promise<BotsEntity> {
        return this.botsService.createBot(access_token, user_id);
    }

    @Get()
    async getAllBots(): Promise<BotsEntity[]> {
        return this.botsService.getAllBots();
    }

    @Get(':id')
    async getBotById(@Param('id') id: string): Promise<BotsEntity> {
        return this.botsService.getBotById(id);
    }

    @Put(':id')
    async updateBot(
        @Param('id') id: string,
        @Body('access_token') access_token: string,
    ): Promise<BotsEntity> {
        return this.botsService.updateBot(id, access_token);
    }

    @Delete(':id')
    async deleteBot(@Param('id') id: string): Promise<void> {
        return this.botsService.deleteBot(id);
    }

    @Post(':id/pages')
    async addPagesToBot(
        @Param('id') botId: string,
        @Body('pageIds') pageIds: string[],
    ): Promise<BotsEntity> {
        return await this.botsService.addPagesToBot(botId, pageIds);
    }
}