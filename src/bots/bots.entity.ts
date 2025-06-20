import { PagesEntity } from 'src/pages/pages.entity';
import { UsersEntity } from 'src/users/users.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    ManyToMany,
} from 'typeorm';

@Entity('bots')
export class BotsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false, unique: true })
    access_token: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToMany(() => PagesEntity, (page) => page.bots)
    pages: PagesEntity[];

    @ManyToOne(() => UsersEntity, (user) => user.bots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UsersEntity;
}