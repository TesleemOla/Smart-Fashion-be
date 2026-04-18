import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface UploadResult {
  url: string;
  path: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly BUCKET = 'product-images';

  constructor(private supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  /**
   * Upload a file buffer to Supabase Storage.
   * Uses the service-role key (bypasses RLS) so the backend
   * can always write, regardless of authenticated session.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<UploadResult> {
    // Build a unique path: products/<timestamp>-<sanitized-name>
    const ext = originalName.split('.').pop() || 'jpg';
    const sanitized = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    const path = `products/${Date.now()}-${sanitized}`;

    const { data, error } = await this.client.storage
      .from(this.BUCKET)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Storage upload failed: ${error.message}`);
      throw new InternalServerErrorException(
        `Image upload failed: ${error.message}`,
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicData } = this.client.storage
      .from(this.BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  }

  /**
   * Delete a file from Supabase Storage by its storage path.
   */
  async deleteFile(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.BUCKET)
      .remove([path]);

    if (error) {
      this.logger.warn(`Storage delete failed for ${path}: ${error.message}`);
    }
  }
}
