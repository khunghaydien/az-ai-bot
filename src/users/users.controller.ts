import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async createUser(
        @Body('email') email: string
    ): Promise<UsersEntity> {
        return this.usersService.createUser(email);
    }

    @Get()
    async getAllUsers(): Promise<UsersEntity[]> {
        return this.usersService.getAllUsers();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<UsersEntity> {
        return this.usersService.getUserById(id);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body('email') email: string
    ): Promise<UsersEntity> {
        return this.usersService.updateUser(id, email);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<void> {
        return this.usersService.deleteUser(id);
    }
}