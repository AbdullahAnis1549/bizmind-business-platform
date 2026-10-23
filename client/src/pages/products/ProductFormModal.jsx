import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import { productService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../../components/common/ImageUpload';

export const ProductFormModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      category: 'General',
      description: '',
      price: '',
      cost: '',
      stock: 10,
      lowStockThreshold: 5,
      image: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'General',
        description: product.description || '',
        price: product.price !== undefined ? product.price : '',
        cost: product.cost !== undefined ? product.cost : '',
        stock: product.stock !== undefined ? product.stock : 0,
        lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5,
        image: product.image || '',
      });
    } else {
      reset({
        name: '',
        sku: '',
        category: 'General',
        description: '',
        price: '',
        cost: '',
        stock: 10,
        lowStockThreshold: 5,
        image: '',
      });
    }
  }, [product, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        category: data.category,
        description: data.description,
        price: Number(data.price),
        cost: Number(data.cost || 0),
        stock: Number(data.stock),
        lowStockThreshold: Number(data.lowStockThreshold),
        image: data.image,
      };

      if (isEdit) {
        await productService.updateProduct(product._id, payload);
        toastSuccess('Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        toastSuccess('Product added to catalog.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toastError(err.message || 'Product operation failed.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      subtitle={isEdit ? 'Update inventory, pricing, and details' : 'List a new item in your inventory catalog'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Product name is required' })}
            placeholder="e.g. Aura Lumina Ambient Smart Lamp"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('sku', { required: 'SKU is required' })}
              placeholder="e.g. AL-SMP-001"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
            />
            {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              {...register('category')}
              placeholder="e.g. Smart Lighting"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Retail Price ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required', min: 0 })}
              placeholder="189.00"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {errors.price && <p className="text-xs text-rose-500 mt-1">Required</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('cost', { min: 0 })}
              placeholder="68.00"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Stock <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              {...register('stock', { required: 'Stock required', min: 0 })}
              placeholder="45"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {errors.stock && <p className="text-xs text-rose-500 mt-1">Required</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Low Threshold</label>
            <input
              type="number"
              {...register('lowStockThreshold', { min: 0 })}
              placeholder="5"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <ImageUpload
          label="Product Image"
          value={watch('image') || ''}
          onChange={(val) => setValue('image', val, { shouldDirty: true })}
          aspectRatio="wide"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description</label>
          <textarea
            rows="3"
            {...register('description')}
            placeholder="Detailed features, materials, and specifications..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-70 rounded-xl transition shadow-sm"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add to Catalog'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
