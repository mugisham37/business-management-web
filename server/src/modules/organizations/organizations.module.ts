import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { DatabaseModule } from '../../database';

@Module({
  imports: [DatabaseModule],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
