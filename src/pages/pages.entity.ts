import { BotsEntity } from 'src/bots/bots.entity';
import { ProductsEntity } from 'src/products/products.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';

@Entity('pages')
export class PagesEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false, unique: true })
    page_name: string

    @Column({ nullable: false, unique: true })
    page_id: string

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(() => ProductsEntity, (product) => product.pages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: ProductsEntity;

    @ManyToMany(() => BotsEntity, (bot) => bot.pages, { cascade: true })
    @JoinTable({
        name: 'pages_bots', // Tên bảng trung gian
        joinColumn: { name: 'page_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'bot_id', referencedColumnName: 'id' },
    })
    bots: BotsEntity[];
}