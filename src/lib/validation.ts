import { z } from 'zod';

export const captionSchema = z
  .string()
  .trim()
  .min(1, 'Caption is required')
  .max(500, 'Caption must be less than 500 characters');

export const commentSchema = z
  .string()
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(500, 'Comment must be less than 500 characters');

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

export const bioSchema = z
  .string()
  .max(500, 'Bio must be less than 500 characters');

export const categorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(50, 'Invalid category');
