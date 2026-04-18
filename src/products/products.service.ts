import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async create(createProductDto: CreateProductDto) {
    const { data, error } = await this.client
      .from('products')
      .insert([createProductDto])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*), product_images(*)');

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Product with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { data, error } = await this.client
      .from('products')
      .update(updateProductDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.client.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true };
  }

  async uploadImages(productId: string, imageUrls: string[]) {
    const images = imageUrls.map((url, index) => ({
      product_id: productId,
      url,
      display_order: index,
      is_primary: index === 0,
    }));

    const { data, error } = await this.client
      .from('product_images')
      .insert(images)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }
}
