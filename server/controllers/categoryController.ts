import { Request, Response } from 'express';
import { MongoDBStorage } from '../storage/MongoDBStorage';
import CategoryModel from '../models/Category';
import cloudinary from '../utils/cloudinary';

const storage = new MongoDBStorage();

// Get all categories
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
}

// Get featured categories
export async function getFeaturedCategories(req: Request, res: Response) {
  try {
    const categories = await storage.getFeaturedCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    res.status(500).json({ message: 'Error fetching featured categories' });
  }
}

// Get category by ID
export async function getCategoryById(req: Request, res: Response) {
  try {
    const category = await storage.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
}

// Create category
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description, slug, featured } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload desktop image to Cloudinary
    let desktopImageUrl;
    if (files.desktopImage && files.desktopImage.length > 0) {
      try {
        const desktopFile = files.desktopImage[0];
        const result = await cloudinary.uploader.upload(
          `data:${desktopFile.mimetype};base64,${desktopFile.buffer.toString('base64')}`,
          {
            folder: 'categories',
            use_filename: true,
            unique_filename: true,
            secure: true
          }
        );
        desktopImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Desktop image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload desktop image' });
      }
    }

    // Upload mobile image to Cloudinary
    let mobileImageUrl;
    if (files.mobileImage && files.mobileImage.length > 0) {
      try {
        const mobileFile = files.mobileImage[0];
        const result = await cloudinary.uploader.upload(
          `data:${mobileFile.mimetype};base64,${mobileFile.buffer.toString('base64')}`,
          {
            folder: 'categories',
            use_filename: true,
            unique_filename: true,
            secure: true
          }
        );
        mobileImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Mobile image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload mobile image' });
      }
    }

    // Create category with uploaded images
    const category = new CategoryModel({
      name,
      description,
      slug,
      featured: featured === 'true' || featured === true,
      desktopImageUrl,
      mobileImageUrl: mobileImageUrl || desktopImageUrl // Use desktop image as fallback
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
}

// Update category
export async function updateCategory(req: Request, res: Response) {
  try {
    const { name, description, slug, featured } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update text fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (slug) category.slug = slug;
    if (featured !== undefined) category.featured = featured === 'true' || featured === true;

    // Upload and update desktop image if provided
    if (files.desktopImage && files.desktopImage.length > 0) {
      try {
        const desktopFile = files.desktopImage[0];
        const result = await cloudinary.uploader.upload(
          `data:${desktopFile.mimetype};base64,${desktopFile.buffer.toString('base64')}`,
          {
            folder: 'categories',
            use_filename: true,
            unique_filename: true,
            secure: true
          }
        );
        category.desktopImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Desktop image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload desktop image' });
      }
    }

    // Upload and update mobile image if provided
    if (files.mobileImage && files.mobileImage.length > 0) {
      try {
        const mobileFile = files.mobileImage[0];
        const result = await cloudinary.uploader.upload(
          `data:${mobileFile.mimetype};base64,${mobileFile.buffer.toString('base64')}`,
          {
            folder: 'categories',
            use_filename: true,
            unique_filename: true,
            secure: true
          }
        );
        category.mobileImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Mobile image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload mobile image' });
      }
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
}

// Delete category
export async function deleteCategory(req: Request, res: Response) {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
}
