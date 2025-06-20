
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
export const AppDataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsTableName: 'migrations_history',
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    logging: false,
};
export const AppDataSource = new DataSource(AppDataSourceOptions);