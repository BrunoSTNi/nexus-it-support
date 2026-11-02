import { Request, Response } from 'express';
import { CategoryService } from './category.service';

const categoryService = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.create(name, description);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.findAll();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, active } = req.body;
      const category = await categoryService.update(id, name, description, active);
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}