import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('pet/:petId')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('petId', ParseIntPipe) petId: number,
    @GetUser('id') userId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(petId, userId, createEventDto);
  }

  @Get('pet/:petId')
  findAllByPet(
    @Param('petId', ParseIntPipe) petId: number,
    @GetUser('id') userId: number,
  ) {
    return this.eventsService.findAllByPet(petId, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.eventsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, userId, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.eventsService.remove(id, userId);
  }
}
