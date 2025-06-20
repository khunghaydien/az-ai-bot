import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsEntity } from './products.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    async createProduct(
        @Body('name') name: string,
        @Body('prompt') prompt: string
    ): Promise<ProductsEntity> {
        return this.productsService.createProduct(name, prompt);
    }

    @Get()
    async getAllProducts(): Promise<ProductsEntity[]> {
        return this.productsService.getAllProducts();
    }

    @Get(':id')
    async getProductById(@Param('id') id: string): Promise<ProductsEntity> {
        return this.productsService.getProductById(id);
    }

    @Put(':id')
    async updateProduct(
        @Param('id') id: string,
        @Body('name') name: string
    ): Promise<ProductsEntity> {
        return this.productsService.updateProduct(id, name);
    }

    @Delete(':id')
    async deleteProduct(@Param('id') id: string): Promise<void> {
        return this.productsService.deleteProduct(id);
    }

    @Post('mock-update')
    async mockUpdatePrompt(
        @Body('id') id: string,
    ): Promise<ProductsEntity> {
        return this.productsService.mockUpdatePrompt(id);
    }
}