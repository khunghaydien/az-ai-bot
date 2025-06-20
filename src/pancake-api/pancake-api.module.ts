import { Module } from '@nestjs/common';
import { PancakeApiService } from './pancake-api.service';

@Module({
  providers: [PancakeApiService]
})
export class PancakeApiModule {}
