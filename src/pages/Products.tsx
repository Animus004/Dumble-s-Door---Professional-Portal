import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import * as ApiService from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Badge from '../components/Badge';
import Skeleton from '../components/Skeleton';
import ProductFormModal from './ProductFormModal';

const ProductsSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="px-6 py-4 flex justify-end space-x-4"><Skeleton className="h-4 w-8" /><Skeleton className="h-4 w-12" /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const Products: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    const fetchProducts = () => {
        if(!user) return;
        setIsLoading(true);
        ApiService.getProductsByVendor(user.auth_user_id).then(data => {
            setProducts(data);
            setIsLoading(false);
        });
    };
    
    useEffect(fetchProducts, [user]);

    const handleSave = async (product: Product) => {
        await ApiService.saveProduct(product);
        addToast(`Product ${product.id ? 'updated' : 'added'} successfully!`, 'success');
        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
    };
    
    const handleDelete = async (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await ApiService.deleteProduct(productId);
            addToast('Product deleted successfully.', 'success');
            fetchProducts();
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }
    
    if(!user) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Products</h1>
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Add Product</button>
            </div>
            {isLoading ? <ProductsSkeleton /> : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">You haven't added any products yet.</td></tr>
                            ) : products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{p.category.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{p.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.stock_quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={p.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                 <ProductFormModal 
                    isOpen={isModalOpen}
                    product={selectedProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    vendorId={user.auth_user_id}
                />
            )}
        </div>
    );
};

export default Products;
