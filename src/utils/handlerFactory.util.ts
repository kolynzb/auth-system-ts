import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from './catchAsync.util';
import APIFeatures from './apiFeatures.util';
import AppError from './appError.util';

const createOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    return res.status(201).json({ status: 'success', data: { data: doc } });
  });

const getAll = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const filterObj = {};

    const features = new APIFeatures(Model.find(filterObj), req.query).filter().limitFields().sort().paginate();

    const docs = await features.dbQuery;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });

// TODO: make pop options optional
const getOne = (Model: any, popOptions?: mongoose.PopulateOptions): any =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError(`No Document with Id of ${req.params.id} found`, 404));

    return res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

const updateOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError(`No Document with Id of ${req.params.id} found`, 404));

    return res.status(200).json({
      status: 'success',
      message: 'Document successfully updated',
      data: { doc },
    });
  });

const deleteOne = (Model: any): any =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(`No Document with Id of ${req.params.id} found`, 404));

    return res.status(200).json({
      status: 'success',
      message: 'Document  deleted successfully',
      data: { doc },
    });
  });

export default {
  createOne,
  getOne,
  getAll,
  updateOne,
  deleteOne,
};
