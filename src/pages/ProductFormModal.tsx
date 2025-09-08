import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import Modal from '../components/Modal';
import Input from '../components/Input';

const ProductFormModal: React.FC<{
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
    vendorId: string;
}> = ({ isOpen, product, onClose, onSave, vendorId }) => {
    const [formData, setFormData] = useState<Product>(
        product || {
            id: '', vendor_id: vendorId, name: '', description: '',
            category: ProductCategory.Food, price: 0, stock_quantity: 0,
            images: [], prescription_required: false, status: 'pending'
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product?.id ? 'Edit Product' : 'Add New Product'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} />
                 <Input as="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input as="select" label="Category" name="category" value={formData.category} onChange={handleChange}>
                       {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                    </Input>
                    <Input label="Brand" name="brand" value={formData.brand || ''} onChange={handleChange} required={false} />
                    <Input label="Price (INR)" name="price" type="number" value={formData.price} onChange={handleChange} />
                    <Input label="Stock Quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} />
                 </div>
                 <div className="flex items-center">
                    <input type="checkbox" id="prescription_required" name="prescription_required" checked={formData.prescription_required} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700" />
                    <label htmlFor="prescription_required" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prescription Required?</label>
                </div>
                 <div className="pt-4 flex justify-end space-x-2">
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                     <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Product</button>
                 </div>
            </form>
        </Modal>
    );
};

export default ProductFormModal;
