import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create_domain.dto';
import { DnsRecordWithoutIds } from './types/dnsRecordWithoutIds.type';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  getAll(): Promise<DnsRecordWithoutIds[]> {
    return this.domainService.getAll();
  }

  @Post()
  create(@Body() createDomainDto: CreateDomainDto): Promise<DnsRecordWithoutIds> {
    return this.domainService.create(createDomainDto);
  }

  @Delete(':id/')
  delete(@Param('id', ParseIntPipe) id: number): Promise<never> {
    return this.domainService.delete(id);
  }
}
