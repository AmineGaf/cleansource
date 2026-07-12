import { Controller, Get } from '@nestjs/common';

import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /** Public — the app shows the catalog and price list before sign-in. */
  @Get()
  getCatalog() {
    return this.catalogService.getCatalog();
  }
}
