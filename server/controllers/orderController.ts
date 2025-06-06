import { Request, Response } from 'express';
import OrderModel from '../models/Order';

export async function getOrders(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const dateFilter = (req.query.date as string) || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (dateFilter && dateFilter !== 'all') {
      const date = new Date(dateFilter);
      if (!isNaN(date.getTime())) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: start, $lte: end };
      }
    }

    const total = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ orders, total });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, packageLength, packageBreadth, packageHeight, packageWeight } = req.body;
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (packageLength !== undefined) updateData.packageLength = packageLength;
    if (packageBreadth !== undefined) updateData.packageBreadth = packageBreadth;
    if (packageHeight !== undefined) updateData.packageHeight = packageHeight;
    if (packageWeight !== undefined) updateData.packageWeight = packageWeight;

    const updatedOrder = await OrderModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
}
