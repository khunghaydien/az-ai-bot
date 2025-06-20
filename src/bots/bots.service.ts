import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BotsEntity } from './bots.entity';
import { UsersService } from 'src/users/users.service';
import { PagesEntity } from 'src/pages/pages.entity';

@Injectable()
export class BotsService {
    constructor(
        @InjectRepository(BotsEntity)
        private readonly botsRepository: Repository<BotsEntity>,
        private readonly usersService: UsersService
    ) { }

    async createBot(access_token: string, user_id: string): Promise<BotsEntity> {
        try {
            const bot = this.botsRepository.create({ access_token, user: { id: user_id } });
            return await this.botsRepository.save(bot);
        } catch (error) {
            console.error('Error creating bot:', error.message);
            throw new Error('Failed to create bot');
        }
    }

    async getAllBots(): Promise<BotsEntity[]> {
        try {
            return await this.botsRepository.find({ relations: ['pages'] });
        } catch (error) {
            console.error('Error fetching all bots:', error.message);
            throw new Error('Failed to fetch bots');
        }
    }

    async getBotsByUserEmail(email: string): Promise<BotsEntity[]> {
        try {
            const user = await this.usersService.getUserByEmail(email);
            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }
            return await this.botsRepository.find({ relations: ['pages'], where: { user: { id: user.id } } });
        } catch (error) {
            console.error('Error fetching bots by user email:', error.message);
            throw new Error('Failed to fetch bots by user email');
        }
    }

    async getBotById(id: string): Promise<BotsEntity> {
        try {
            const bot = await this.botsRepository.findOne({
                where: { id },
                relations: ['pages'],
            });
            if (!bot) {
                throw new NotFoundException(`Bot with ID ${id} not found`);
            }
            return bot;
        } catch (error) {
            console.error('Error fetching bot by ID:', error.message);
            throw new Error('Failed to fetch bot by ID');
        }
    }

    async updateBot(id: string, access_token: string): Promise<BotsEntity> {
        try {
            const bot = await this.getBotById(id);
            bot.access_token = access_token;
            return await this.botsRepository.save(bot);
        } catch (error) {
            console.error('Error updating bot:', error.message);
            throw new Error('Failed to update bot');
        }
    }

    async deleteBot(id: string): Promise<void> {
        try {
            // Xóa các liên kết giữa bot và pages trong bảng trung gian
            await this.botsRepository.manager.query(
                'DELETE FROM pages_bots WHERE bot_id = $1',
                [id],
            );
    
            // Xóa bot
            const result = await this.botsRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Bot with ID ${id} not found`);
            }
    
            console.log(`Bot with ID ${id} deleted successfully`);
        } catch (error) {
            console.error('Error deleting bot:', error.message);
            throw new Error('Failed to delete bot');
        }
    }

    async addPagesToBot(botId: string, pageIds: string[]): Promise<BotsEntity> {
        try {
            const bot = await this.getBotById(botId);
            if (!bot) {
                throw new NotFoundException(`Bot with ID ${botId} not found`);
            }

            const pages = await this.botsRepository.manager.findBy(PagesEntity, {
                id: In(pageIds),
            });

            if (pages.length === 0) {
                throw new NotFoundException(`No pages found for the provided IDs`);
            }

            bot.pages = [...bot.pages, ...pages];
            return await this.botsRepository.save(bot);
        } catch (error) {
            console.error('Error adding pages to bot:', error.message);
            throw new Error('Failed to add pages to bot');
        }
    }
}