import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { VisitsModule } from './visits/visits.module';
import { HealthModule } from './health/health.module';
import { PrometheusService } from './metrics/prometheus.service';
import { PrometheusController } from './metrics/prometheus.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/tech_challenge',
        ),
      }),
      inject: [ConfigService],
    }),
    VisitsModule,
    HealthModule
  ],
  providers: [PrometheusService],
  controllers: [AppController, PrometheusController],
})
export class AppModule { }
