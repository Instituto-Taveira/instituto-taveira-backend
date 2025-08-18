import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// DTO para payload simples
export class PagSeguroSimpleNotificationDto {
  @IsString()
  @IsNotEmpty()
  notificationCode: string;

  @IsString()
  @IsNotEmpty()
  notificationType: string;
}

// ---- DTOs auxiliares para payload completo ----
export class CustomerPhoneDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CustomerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  tax_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerPhoneDto)
  @IsOptional()
  phones?: CustomerPhoneDto[];
}

export class ItemDto {
  @IsString()
  name: string;

  quantity: number;

  unit_amount: number;
}

export class QrCodeDto {
  @IsString()
  id: string;

  @IsDateString()
  expiration_date: string;

  @IsObject()
  amount: any;

  @IsString()
  text: string;

  @IsArray()
  arrangements: any[];

  @IsArray()
  links: any[];
}

export class ChargeDto {
  @IsString()
  id: string;

  @IsString()
  reference_id: string;

  @IsString()
  status: Prisma.EnumStatusFieldUpdateOperationsInput;

  @IsDateString()
  created_at: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsObject()
  amount: any;

  @IsOptional()
  @IsObject()
  payment_response?: any;

  @IsOptional()
  @IsObject()
  payment_method?: any;

  @IsArray()
  links: any[];

  @IsObject()
  metadata: any;
}

export class LinkDto {
  @IsString()
  rel: string;

  @IsString()
  href: string;

  @IsString()
  media: string;

  @IsString()
  type: string;
}

// Payload completo do PagSeguro
export class PagSeguroFullNotificationDto {
  @IsString()
  id: string;

  @IsString()
  reference_id: string;

  @IsDateString()
  created_at: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QrCodeDto)
  qr_codes: QrCodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeDto)
  charges: ChargeDto[];

  @IsArray()
  notification_urls: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links: LinkDto[];

}
