import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PagesEntity } from './pages.entity';
import { BotsEntity } from 'src/bots/bots.entity';
import { ProductsEntity } from 'src/products/products.entity';

@Injectable()
export class PagesService {
    constructor(
        @InjectRepository(PagesEntity)
        private readonly pagesRepository: Repository<PagesEntity>,
    ) { }

    async createPage(page_name: string, page_id: string, bot_ids: string[], product_id: string): Promise<PagesEntity> {
        try {
            // Tìm danh sách bots theo bot_ids
            const bots = await this.pagesRepository.manager.findBy(BotsEntity, {
                id: In(bot_ids),
            });

            if (bots.length === 0) {
                throw new NotFoundException(`No bots found for the provided IDs`);
            }

            // Tạo page mới
            const page = this.pagesRepository.create({
                page_name,
                page_id,
                bots, // Gán danh sách bots vào page
                product: { id: product_id },
            });

            // Lưu page vào cơ sở dữ liệu
            return await this.pagesRepository.save(page);
        } catch (error) {
            console.error('Error creating page:', error.message);
            throw new Error('Failed to create page');
        }
    }

    async getAllPages(): Promise<PagesEntity[]> {
        try {
            return await this.pagesRepository.find({ relations: ['bots', 'product'] });
        } catch (error) {
            console.error('Error fetching all pages:', error.message);
            throw new Error('Failed to fetch pages');
        }
    }

    async getPageById(id: string): Promise<PagesEntity> {
        try {
            const page = await this.pagesRepository.findOne({
                where: { id },
                relations: ['bots', 'product'],
            });
            if (!page) {
                throw new NotFoundException(`Page with ID ${id} not found`);
            }
            return page;
        } catch (error) {
            console.error('Error fetching page by ID:', error.message);
            throw new Error('Failed to fetch page by ID');
        }
    }

    async getPageByPancakePageId(page_id: string): Promise<PagesEntity> {
        try {
            const page = await this.pagesRepository.findOne({
                where: { page_id },
                relations: ['bots', 'product'],
            });
            if (!page) {
                throw new NotFoundException(`Page with Pancake Page ID ${page_id} not found`);
            }
            return page;
        } catch (error) {
            console.error('Error fetching page by Pancake Page ID:', error.message);
            throw new Error('Failed to fetch page by Pancake Page ID');
        }
    }

    async updatePageBots(id: string, bot_ids?: string[], product_id?: string): Promise<PagesEntity> {
        try {
            const page = await this.getPageById(id);
            if (bot_ids?.length) {
                const bots = await this.pagesRepository.manager.findBy(BotsEntity, { id: In(bot_ids) });
                if (!bots.length) throw new NotFoundException(`No bots found for the provided IDs`);
                page.bots = bots;
            }
            if (product_id) {
                const product = await this.pagesRepository.manager.findOne(ProductsEntity, { where: { id: product_id } });
                if (!product) throw new NotFoundException(`Product with ID ${product_id} not found`);
                page.product = product;
            }
            return await this.pagesRepository.save(page);
        } catch (error) {
            console.error('Error updating page bots:', error.message);
            throw new Error('Failed to update page bots');
        }
    }

    async deletePage(id: string): Promise<void> {
        try {
            const result = await this.pagesRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Page with ID ${id} not found`);
            }
        } catch (error) {
            console.error('Error deleting page:', error.message);
            throw new Error('Failed to delete page');
        }
    }

    async getPagesByAccessToken(accessToken: string): Promise<PagesEntity[]> {
        try {
            const pages = await this.pagesRepository.find({
                where: {
                    bots: { access_token: accessToken },
                },
                relations: ['bots', 'product'],
            });
            if (pages.length === 0) {
                throw new NotFoundException(`No pages found for access token: ${accessToken}`);
            }
            return pages;
        } catch (error) {
            console.error('Error fetching pages by access token:', error.message);
            throw new Error('Failed to fetch pages by access token');
        }
    }
}