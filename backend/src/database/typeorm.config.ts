import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { ScenarioEntity } from './entities/scenario.entity';
import { TestRunEntity } from './entities/test-run.entity';
import { TestResultEntity } from './entities/test-result.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'auto_inspector',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'auto_inspector',
  entities: [ScenarioEntity, TestRunEntity, TestResultEntity],
  synchronize: true, // Auto-creates tables in dev. Use migrations in production.
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: 10,
  retryDelay: 3000,
};
