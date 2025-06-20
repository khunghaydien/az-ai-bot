import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
    ) { }

    async createUser(email: string): Promise<UsersEntity> {
        try {
            const user = this.usersRepository.create({ email });
            return await this.usersRepository.save(user);
        } catch (error) {
            console.error('Error creating user:', error.message);
            throw new Error('Failed to create user');
        }
    }

    async getAllUsers(): Promise<UsersEntity[]> {
        try {
            return await this.usersRepository.find({ relations: ['bots'] });
        } catch (error) {
            console.error('Error fetching all users:', error.message);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id: string): Promise<UsersEntity> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                relations: ['bots'],
            });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        } catch (error) {
            console.error('Error fetching user by ID:', error.message);
            throw new Error('Failed to fetch user by ID');
        }
    }

    async getUserByEmail(email: string): Promise<UsersEntity> {
        try {
            const user = await this.usersRepository.findOne({
                where: { email },
                relations: ['bots'],
            });
            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }
            return user;
        } catch (error) {
            console.error('Error fetching user by email:', error.message);
            throw new Error('Failed to fetch user by email');
        }
    }

    async updateUser(id: string, email: string): Promise<UsersEntity> {
        try {
            const user = await this.getUserById(id);
            user.email = email;
            return await this.usersRepository.save(user);
        } catch (error) {
            console.error('Error updating user:', error.message);
            throw new Error('Failed to update user');
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const result = await this.usersRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
        } catch (error) {
            console.error('Error deleting user:', error.message);
            throw new Error('Failed to delete user');
        }
    }

    async getUsersWithBots(): Promise<UsersEntity[]> {
        try {
            const users = await this.usersRepository.find({
                relations: ['bots'],
            });
            if (users.length === 0) {
                throw new NotFoundException('No users with bots found');
            }
            return users;
        } catch (error) {
            console.error('Error fetching users with bots:', error.message);
            throw new Error('Failed to fetch users with bots');
        }
    }

    async getUserWithBotsByEmail(email: string): Promise<UsersEntity> {
        try {
            const user = await this.usersRepository.findOne({
                where: { email },
                relations: ['bots'],
            });
            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }
            return user;
        } catch (error) {
            console.error('Error fetching user with bots by email:', error.message);
            throw new Error('Failed to fetch user with bots by email');
        }
    }
}