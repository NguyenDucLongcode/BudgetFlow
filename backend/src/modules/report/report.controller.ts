import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MonthlyReportQueryDto } from './dto/MonthlyReportQueryDto';
import { ReportService } from './report.service';

@ApiTags('Reports')
@ApiAuthSwaggerUI()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('monthly')
  getMonthlyReport(
    @CurrentUser('sub') userId: string,
    @Query() query: MonthlyReportQueryDto,
  ) {
    return this.reportService.getMonthlyReport(userId, query);
  }
}
