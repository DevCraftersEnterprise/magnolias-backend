import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      ssl: true,
      extra: {
        ssl: { rejectUnauthorized: false },
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: false,
      autoLoadEntities: true,
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: process.env.NODE_ENV === 'production',
      migrationsTableName: 'migrations',
    }),
  ],
})
export class DatabaseModule {}
