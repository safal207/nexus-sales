'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProductRecord } from '../../utils/api';

const productSchema = z.object({
  name: z.string().min(3, { message: 'Название должно содержать минимум 3 символа.' }),
  description: z.string().optional(),
  price: z.number().min(0, { message: 'Цена не может быть отрицательной.' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  product?: ProductRecord;
};

const formatPriceToCents = (price: number) => Math.round(price * 100);

const mapServerMessage = (message?: string) =>
  message ?? 'Не удалось сохранить продукт. Попробуйте ещё раз.';

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product ? product.price / 100 : 0,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    setError(null);

    const endpoint = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price: formatPriceToCents(values.price),
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || result.success === false) {
        throw new Error(mapServerMessage(result.message));
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить продукт. Попробуйте позже.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-md">
      <h2 className="text-center text-2xl font-bold text-gray-800">
        {product ? 'Изменить продукт' : 'Создать продукт'}
      </h2>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Название продукта
        </label>
        <input
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Например, «Курс по эмоциональным продажам»"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Кратко опишите ценность продукта и ожидаемый результат для клиента"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Стоимость (₽)
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          {...register('price')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
        {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {loading ? 'Сохраняем…' : 'Сохранить продукт'}
        </button>
      </div>
    </form>
  );
}
