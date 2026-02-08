import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { DatabaseModule } from '../../database';

@Module({
  imports: [DatabaseModule],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
