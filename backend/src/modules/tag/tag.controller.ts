import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateTagDto } from './dto/CreateTagDto';
import { UpdateTagDto } from './dto/UpdateTagDto';
import { TagQueryDto } from './dto/TagQueryDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';

@ApiTags('Tag')
@ApiAuthSwaggerUI()
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Tag'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateTagDto) {
    return this.tagService.create(userId, dto);
  }

  @Post('bulk')
  @CheckPolicies((ability) => ability.can(Action.Create, 'Tag'))
  createBulk(
    @CurrentUser('sub') userId: string,
    @Body('names') names: string[],
  ) {
    return this.tagService.createBulk(userId, names);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Tag'))
  findAll(@CurrentUser('sub') userId: string, @Query() query: TagQueryDto) {
    return this.tagService.findAll(userId, query);
  }

  @Get('autocomplete')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Tag'))
  autocomplete(@CurrentUser('sub') userId: string, @Query('q') query: string) {
    return this.tagService.autocomplete(userId, query);
  }

  @Get('popular')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Tag'))
  getPopularTags(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.tagService.getPopularTags(userId, limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Tag'))
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tagService.findOne(id, userId);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Tag'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagService.update(id, userId, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Tag'))
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tagService.remove(id, userId);
  }
}
