import { Controller, Get } from '@nestjs/common';
import { StaticsService } from './statics.service';
import { succesResponse } from 'src/common/utils/response';
import { IResponse } from 'src/common/interfaces/response.interfae';

@Controller('statistics')
export class StaticsController {
  constructor(private readonly staticsService: StaticsService) {}

  @Get()
  async getStatistics(): Promise<IResponse<any>> {
    const statistics = await this.staticsService.getStatistics();
    return succesResponse({
      status: 200,
      data: { statistics },
      message: 'Statistics retrieved successfully',
    });
  }
}

