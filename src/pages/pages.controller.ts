import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesEntity } from './pages.entity';

@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post()
    async createPage(
        @Body('page_name') page_name: string,
        @Body('page_id') page_id: string,
        @Body('bot_ids') bot_ids: string[],
        @Body('product_id') product_id: string,
    ): Promise<PagesEntity> {
        return this.pagesService.createPage(page_name, page_id, bot_ids, product_id);
    }

    @Get()
    async getAllPages(): Promise<PagesEntity[]> {
        return this.pagesService.getAllPages();
    }

    @Get(':id')
    async getPageById(@Param('id') id: string): Promise<PagesEntity> {
        return this.pagesService.getPageById(id);
    }

    @Put(':id')
    async updatePage(
        @Param('id') id: string,
        @Body('bot_ids') bot_ids?: string[],
        @Body('product_id') product_id?: string
    ): Promise<PagesEntity> {
        return this.pagesService.updatePageBots(id, bot_ids, product_id);
    }

    @Delete(':id')
    async deletePage(@Param('id') id: string): Promise<void> {
        return this.pagesService.deletePage(id);
    }
}