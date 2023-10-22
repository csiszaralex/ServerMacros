import { Controller, Get } from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  getHello() {
    return this.domainService.changes_domains_if_needed();
  }

  // @Post()
  // create(@Body() createDomainDto: CreateDomainDto) {
  //   return this.domainService.create(createDomainDto);
  // }

  // @Get()
  // findAll() {
  //   return this.domainService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.domainService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
  //   return this.domainService.update(+id, updateDomainDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.domainService.remove(+id);
  // }
}
