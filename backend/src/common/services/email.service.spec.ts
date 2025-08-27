import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'email.host': 'smtp.gmail.com',
        'email.port': 587,
        'email.secure': false,
        'email.auth.user': 'test@example.com',
        'email.auth.pass': 'password123',
        'email.from': 'noreply@example.com',
        'email.replyTo': 'support@example.com',
        'email.company.name': 'Test Company',
        'email.company.website': 'www.test.com',
        'app.frontendUrl': 'http://localhost:4200',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should test connection', async () => {
    const result = await service.testConnection();
    expect(typeof result).toBe('boolean');
  });
});
