import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { RunsModule } from './runs/runs.module';
import { GatewayModule } from './gateway/gateway.module';
import { typeOrmConfig } from '@/database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    JobsModule,
    ScenariosModule,
    RunsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

