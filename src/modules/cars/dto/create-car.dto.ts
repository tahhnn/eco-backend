import { IsArray, IsString, Length, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota Camry', description: 'Tên xe (từ 4 đến 50 ký tự)' })
  @IsString({ message: 'Vui lòng điền đúng định dạng' })
  @Length(4, 50, { message: 'Độ dài tối thiểu từ 4-50 ký tự' })
  name: string;

  @ApiProperty({ example: '2021', description: 'Model của xe' })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @Length(4, 4, { message: 'Năm sản xuất phải có 4 chữ số' })
  @Matches(/^\d{4}$/, { message: 'Năm sản xuất phải là số có 4 chữ số' })
  carModel: string;

  @ApiProperty({ example: '51A-123.45', description: 'Biển số xe' })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @Matches(/^[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}$/, { message: 'Biển số xe không đúng định dạng (VD: 51A-123.45)' })
  liscenscePlate: string;

  @ApiProperty({ example: 'available', description: 'Trạng thái xe', required: false })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '2023', description: 'Năm sản xuất' })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @Length(4, 4, { message: 'Năm sản xuất phải có 4 chữ số' })
  @Matches(/^\d{4}$/, { message: 'Năm sản xuất phải là số có 4 chữ số' })
  year: string;

  @ApiProperty({ example: '1500000000', description: 'Giá thuê xe (VNĐ)' })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @Matches(/^\d+$/, { message: 'Giá phải là số' })
  price: string;

  @ApiProperty({ example: 'Toyota', description: 'Hãng xe' })
  @IsString({ message: 'Vui lòng nhập đúng định dạng' })
  @Length(2, 50, { message: 'Tên hãng xe phải từ 2-50 ký tự' })
  brand: string;

  @ApiProperty({ example: ['https://example.com/image1.jpg'], description: 'Danh sách URL hình ảnh', required: false })
  @IsArray()
  @IsOptional()
  imageUrl?: string[];
}
