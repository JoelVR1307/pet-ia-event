import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN)
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto, @Request() req) {
    return this.medicalRecordsService.create(createMedicalRecordDto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN)
  findAll(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findAll(pageNum, limitNum);
  }

  @Get('pet/:petId')
  findByPet(
    @Param('petId', ParseIntPipe) petId: number,
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findByPet(petId, req.user.sub, req.user.role, pageNum, limitNum);
  }

  @Get('veterinarian/:veterinarianId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  findByVeterinarian(
    @Param('veterinarianId', ParseIntPipe) veterinarianId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findByVeterinarian(veterinarianId, pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.medicalRecordsService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Request() req,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto, req.user.sub, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.medicalRecordsService.remove(id, req.user.sub, req.user.role);
  }
}