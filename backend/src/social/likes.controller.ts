import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('post/:postId/toggle')
  toggleLike(
    @Request() req,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.toggleLike(req.user.id, postId);
  }

  @Get('post/:postId')
  getLikesByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.getLikesByPost(postId);
  }

  @Get('post/:postId/check')
  checkUserLike(
    @Request() req,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.checkUserLike(req.user.id, postId);
  }
}