import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { Invoice } from './schemas/invoice.schema';

describe('InvoicesService', () => {
  let service: InvoicesService;

  const mockInvoiceModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockPdfGeneratorService = {
    generateInvoicePDF: jest.fn(),
    generateInvoiceNumber: jest.fn(),
  };

  const mockSalesService = {
    findOne: jest.fn(),
  };

  const mockCustomersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: PdfGeneratorService,
          useValue: mockPdfGeneratorService,
        },
        {
          provide: 'SalesService',
          useValue: mockSalesService,
        },
        {
          provide: 'CustomersService',
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
