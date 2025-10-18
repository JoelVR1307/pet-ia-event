import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('predictions/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  getPredictionStats() {
    return this.analyticsService.getPredictionStats();
  }

  @Get('predictions/history')
  getUserPredictionHistory(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getUserPredictionHistory(req.user.sub, pageNum, limitNum);
  }

  @Get('predictions/trends')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  getPredictionTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getPredictionTrends(daysNum);
  }

  @Get('species/accuracy')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  getSpeciesAccuracy(@Query('species') species?: string) {
    return this.analyticsService.getSpeciesAccuracy(species);
  }

  @Get('system/metrics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getSystemMetrics() {
    return this.analyticsService.getSystemMetrics();
  }
}