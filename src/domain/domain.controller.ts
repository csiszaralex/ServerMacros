import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { dns_domain } from '@prisma/client';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create_domain.dto';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  getAll(): Promise<{ ip: string; name: string; proxy: boolean; type: string }[]> {
    return this.domainService.getAll();
  }

  @Put('/update')
  manualUpdate(): Promise<{ last_ip: string; ip: string }> {
    return this.domainService.change_domains_if_needed(true);
  }

  @Post()
  create(@Body() createDomainDto: CreateDomainDto): Promise<dns_domain> {
    return this.domainService.create(createDomainDto);
  }

  @Delete(':id/')
  delete(@Param('id', ParseIntPipe) id: number): void {
    this.domainService.delete(id);
  }
}
