import { Body, Controller, Get, Patch, Post, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserPreferenceService } from './user-preference.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateUserPreferenceDto } from './dto/CreateUserPreferenceDto';
import { UpdateUserPreferenceDto } from './dto/UpdateUserPreferenceDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';

@ApiTags('User Preference')
@ApiAuthSwaggerUI()
@Controller(['user-preference', 'users/preferences'])
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'UserPreference'))
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateUserPreferenceDto,
  ) {
    return this.userPreferenceService.create(userId, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'UserPreference'))
  findOne(@CurrentUser('sub') userId: string) {
    return this.userPreferenceService.findOne(userId);
  }

  @Patch()
  @CheckPolicies((ability) => ability.can(Action.Update, 'UserPreference'))
  update(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferenceService.update(userId, dto);
  }

  @Delete('reset')
  @CheckPolicies((ability) => ability.can(Action.Update, 'UserPreference'))
  reset(@CurrentUser('sub') userId: string) {
    return this.userPreferenceService.reset(userId);
  }
}
