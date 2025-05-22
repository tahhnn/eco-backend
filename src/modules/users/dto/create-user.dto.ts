import {
    IsBoolean,
    IsEmail,
    IsNumber,
    IsString,
    Length,
    IsOptional,
    Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty()
    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @Length(5, 20, { message: 'Mật khẩu phải từ 5 đến 20 ký tự' })
    password: string;

    @ApiProperty()
    @IsString({ message: 'Tên phải là chuỗi' })
    @Length(5, 50, { message: 'Tên phải có ít nhất 5 ký tự' })
    name: string;

    @ApiProperty()
    @IsString({ message: 'Avatar phải là đường dẫn hình ảnh' })
    @IsOptional()
    avatar: string;    

    @ApiProperty()
    @IsString({ message: 'Địa chỉ không hợp lệ' })
    address: string;

    @ApiProperty()
    @Matches(/^[0-9]{9,12}$/, { message: 'Số điện thoại phải từ 9 đến 12 chữ số' })
    phone: string;

    @ApiProperty()
    @IsString({ message: 'Tiểu sử không hợp lệ' })
    @IsOptional()
    bio?: string;
}
