import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'car-auction', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] } as any,
});

@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.carsService.findAll(query);
  }

  @Get('live')
  getLive() {
    return this.carsService.getLiveAuctions();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.carsService.findByCategory(category);
  }

  @Get('my-cars')
  @UseGuards(JwtAuthGuard)
  getMyCars(@Request() req: any) {
    return this.carsService.findBySeller(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Get(':id/related')
  getRelated(@Param('id') id: string, @Query('category') category: string) {
    return this.carsService.findRelated(id, category);
  }

  @Patch(':id/end')
  @UseGuards(JwtAuthGuard)
  endAuction(@Param('id') id: string, @Request() req: any) {
    return this.carsService.endAuctionBySeller(id, req.user._id);
  }

  @Patch(':id/expire')
  expireAuction(@Param('id') id: string) {
    return this.carsService.expireAuction(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 6, { storage }))
  create(
    @Body() dto: CreateCarDto,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const images = files ? files.map((f) => (f as any).path) : [];
    return this.carsService.create(dto, req.user._id, images);
  }
}
