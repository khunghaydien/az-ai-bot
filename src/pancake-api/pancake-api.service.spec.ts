import { Test, TestingModule } from '@nestjs/testing';
import { PancakeApiService } from './pancake-api.service';

describe('PancakeApiService', () => {
  let service: PancakeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PancakeApiService],
    }).compile();

    service = module.get<PancakeApiService>(PancakeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
