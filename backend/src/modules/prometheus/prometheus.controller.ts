import { Controller, Get, Res, Header, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller({
  path: 'metrics',
  version: VERSION_NEUTRAL,
})
export class PrometheusController {
  constructor() {} // Không cần inject service

  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async getMetrics(@Res() res: Response) {
    try {
      // Lấy metrics từ register
      const metrics = await register.metrics();
      return res.send(metrics);
    } catch (error) {
      // Fix lỗi unknown type
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        statusCode: 500,
        message: 'Failed to fetch metrics',
        error: errorMessage,
      });
    }
  }

  @Get('json')
  @Public()
  async getMetricsJson(@Res() res: Response) {
    try {
      //  Lấy metrics dạng JSON
      const metrics = await register.getMetricsAsJSON();
      return res.json(metrics);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        statusCode: 500,
        message: 'Failed to fetch metrics',
        error: errorMessage,
      });
    }
  }
}
