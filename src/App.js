import React, { useState, useEffect, useCallback } from 'react';
// استيراد أيقونات Lucide React
import {
    Package, CalendarDays, Hourglass, CheckCircle, Truck, // أيقونات التنقل
    PlusCircle, Edit, Trash2, Download, Flag, LogIn, LogOut, X, Check, Save, Share2, Link, QrCode, ClipboardCopy // أيقونات الإجراءات والمودالات، إضافة أيقونات جديدة للروابط
} from 'lucide-react';

// استيراد الشعار
// يرجى نقل ملف 'logo.jpg' إلى مجلد 'public' في مشروع React الخاص بك.
// مثال: public/logo.jpg
import logo from './assets/logo.jpg';
//const logo ='https://w7.pngwing.com/pngs/479/409/png-transparent-red-and-white-storage-illustration-computer-icons-online-shopping-e-commerce-retail-store-icon.png'

// تأكد من أن عنوان URL الأساسي هذا يطابق عنوان URL الذي يعمل عليه خادم Flask الخاص بك.
// عادةً ما يكون هذا هو http://127.0.0.1:5000 إذا كنت تقوم بتشغيله محليًا.
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// ********************************************************************************************************
// مكتبة QR Code: (ستحتاج إلى تثبيت هذه المكتبة: npm install qrcode.react أو yarn add qrcode.react)
// تم تغيير الاستيراد من default إلى named export (QRCodeCanvas)
import { QRCodeCanvas } from 'qrcode.react';
// ********************************************************************************************************


// ========================================================================================================
// مكونات المودالات (تم نقلها خارج المكون الرئيسي App)
// ========================================================================================================

const MessageModal = ({ show, title, text, type, onClose }) => {
    if (!show) return null;
    const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className={`relative px-4 py-3 rounded-lg shadow-lg text-center max-w-sm w-full animate-fade-in-up border ${bgColor}`}>
                <p className="font-bold text-lg mb-2">{title}</p>
                <p className="text-sm mb-4">{text}</p>
                <button onClick={onClose} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <X className="inline-block h-5 w-5 ml-2" /> إغلاق
                </button>
            </div>
        </div>
    );
};

const ConfirmModal = ({ show, text, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center animate-fade-in-up">
                <p className="text-lg font-semibold text-gray-800 mb-4">{text}</p>
                <div className="flex justify-around mt-4">
                    <button onClick={onConfirm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out">
                        <Check className="inline-block h-5 w-5 ml-2" /> تأكيد
                    </button>
                    <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out">
                        <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductFormModal = ({ show, onClose, onSubmit,
    name, setName, quantity, setQuantity, description, setDescription, imageUrl, setImageUrl,
    product
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم المنتج:</label>
                        <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">الكمية:</label>
                        <input type="number" id="quantity" name="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">الوصف:</label>
                        <textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"></textarea>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">رابط الصورة (URL):</label>
                        <input type="url" id="imageUrl" name="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="مثال: https://placehold.co/60x60" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                        {imageUrl && (
                            <div className="mt-2 flex justify-center">
                                <img src={imageUrl} alt="معاينة المنتج" className="w-20 h-20 object-contain rounded-md border border-gray-200" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/ffffff?text=لا+صورة'; }} />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                            <Save className="inline-block h-5 w-5 ml-2" /> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EventFormModal = ({ show, onClose, onSubmit,
    name, setName, date, setDate, description, setDescription, isCompleted, setIsCompleted,
    event
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{event ? 'تعديل الحدث' : 'إضافة حدث جديد'}</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم الحدث:</label>
                        <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">تاريخ الحدث:</label>
                        <input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-white text-gray-700 mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">الوصف:</label>
                        <textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"></textarea>
                    </div>
                    {/* Hiding isCompleted checkbox for new events, only show for existing ones */}
                    {event && (
                        <div>
                            <label htmlFor="isCompleted" className="flex items-center text-sm font-medium text-gray-700">
                                <input type="checkbox" id="isCompleted" name="isCompleted" checked={isCompleted} onChange={e => setIsCompleted(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                                <span>الحدث مكتمل؟</span>
                            </label>
                        </div>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                            <Save className="inline-block h-5 w-5 ml-2" /> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const IssueProductFormModal = ({ show, onClose, onSubmit, products, events,
    issueEventSelect, setIssueEventSelect,
    issueProductSearch, setIssueProductSearch,
    issueProductSelect, setIssueProductSelect,
    issueQuantity, setIssueQuantity,
    issueAvailableQuantity, setIssueAvailableQuantity
}) => {

    useEffect(() => {
        const product = products.find(p => p.id === issueProductSelect);
        const currentAvailable = product?.quantity || 0;
        setIssueAvailableQuantity(currentAvailable);
        if (issueQuantity > currentAvailable) {
            setIssueQuantity(currentAvailable);
        }
    }, [issueProductSelect, products, issueQuantity, setIssueAvailableQuantity]);

    if (!show) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(issueProductSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(issueProductSearch.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">إصدار منتجات لحدث</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="eventSelect" className="block text-sm font-medium text-gray-700">اختيار الحدث:</label>
                        <select id="eventSelect" name="eventSelect" value={issueEventSelect} onChange={e => setIssueEventSelect(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out">
                            <option value="">-- اختر حدثاً --</option>
                            {events.filter(e => !e.isCompleted).map(event => ( // Filter for active events only
                                <option key={event.id} value={event.id}>{event.name} ({event.date})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700">البحث عن المنتج:</label>
                        <input type="text" id="productSearch" placeholder="ابحث بالاسم أو الوصف" value={issueProductSearch} onChange={e => setIssueProductSearch(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-right" />
                    </div>
                    <div>
                        <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700">اختيار المنتج:</label>
                        <select id="productSelect" name="productSelect" value={issueProductSelect} onChange={e => setIssueProductSelect(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out">
                            <option value="">-- اختر منتجاً --</option>
                            {filteredProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.name} (متوفر: {product.quantity})</option>
                            ))}
                        </select>
                        <div id="issue-product-image-list" className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border border-gray-200">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="flex flex-col items-center text-xs text-center p-1 border rounded-md bg-white shadow-sm cursor-pointer hover:bg-blue-50" onClick={() => setIssueProductSelect(product.id)}>
                                        <img src={product.imageUrl || "https://placehold.co/40x40/cccccc/ffffff?text=لا+صورة"} alt={product.name} className="w-10 h-10 object-contain rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/ffffff?text=لا+صورة'; }} />
                                        <span className="mt-1 truncate w-full">{product.name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500">لا توجد منتجات مطابقة.</div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">الكمية المراد إصدارها:</label>
                        <input type="number" id="quantity" name="quantity" value={issueQuantity} onChange={e => setIssueQuantity(e.target.value)} required min="1" max={issueAvailableQuantity} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                        <p className="text-xs text-gray-500 mt-1">الكمية المتوفرة: {issueAvailableQuantity}</p>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                            <Download className="inline-block h-5 w-5 ml-2" /> إصدار
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditOutgoingProductModal = ({ show, onClose, onSubmit, item, products, // products prop is needed to calculate available stock
    editOutgoingQuantity, setEditOutgoingQuantity, editOutgoingCurrentStock // These are managed in App
}) => {

    if (!show || !item) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">تعديل المنتج الصادر</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">المنتج:</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900" id="edit-outgoing-product-name">{item.productName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الحدث:</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900" id="edit-outgoing-event-name">{item.eventName}</p>
                    </div>
                    <div>
                        <label htmlFor="edit-outgoing-quantity" className="block text-sm font-medium text-gray-700">الكمية الصادرة:</label>
                        <input type="number" id="edit-outgoing-quantity" value={editOutgoingQuantity} onChange={e => setEditOutgoingQuantity(e.target.value)} required min="1" max={editOutgoingCurrentStock} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                        <p id="edit-outgoing-current-stock" className="text-xs text-gray-500 mt-1">الكمية المتوفرة في المخزن (معدلة): {editOutgoingCurrentStock}</p>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                            <Save className="inline-block h-5 w-5 ml-2" /> حفظ التعديلات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OutgoingProductDetailsModal = ({ show, onClose, item, products }) => {
    if (!show || !item) return null;

    const associatedProduct = products.find(p => p.id === item.productId);
    const remainingStock = associatedProduct ? associatedProduct.quantity : 'غير متوفر';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">تفاصيل المنتج الصادر</h2>
                <div className="mb-4">
                    <img src={item.productImageUrl || "https://placehold.co/150x150/cccccc/ffffff?text=لا+صورة"} alt="صورة المنتج" className="w-48 h-48 object-contain rounded-lg mx-auto border border-gray-200 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/ffffff?text=لا+صورة'; }} />
                </div>
                <div className="text-right space-y-3">
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">المنتج:</strong> {item.productName}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الوصف:</strong> {item.productDescription || 'لا يوجد وصف'}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الكمية الصادرة:</strong> {item.quantityIssued}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">المتبقي في المخزن:</strong> {remainingStock}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الحدث:</strong> {item.eventName}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">تاريخ الحدث:</strong> {item.eventDate || 'N/A'}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">تاريخ الإصدار:</strong> {new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <button onClick={onClose} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <X className="inline-block h-5 w-5 ml-2" /> إغلاق
                </button>
            </div>
        </div>
    );
};

const EventDetailsModal = ({ show, onClose, event, outgoingItems, products, isAdmin, onGeneratePublicLink, displayMessage }) => {
    if (!show || !event) return null;

    // Filter outgoing items specifically for this event
    const eventOutgoingItems = outgoingItems.filter(item => item.eventId === event.id);

    const handleCopyLink = (linkText) => {
        // Try modern navigator.clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(linkText)
                .then(() => displayMessage('تم النسخ', 'تم نسخ الرابط إلى الحافظة!', 'success'))
                .catch(err => {
                    console.error('Failed to copy using navigator.clipboard:', err);
                    // Fallback to execCommand if clipboard API fails
                    copyToClipboardFallback(linkText);
                });
        } else {
            // Fallback for environments where navigator.clipboard is not defined (like Canvas)
            copyToClipboardFallback(linkText);
        }
    };

    const copyToClipboardFallback = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Avoid scrolling to bottom
        textarea.style.opacity = '0'; // Hide it
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            displayMessage('تم النسخ', 'تم نسخ الرابط إلى الحافظة!', 'success');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            displayMessage('خطأ', 'فشل نسخ الرابط.', 'error');
        }
        document.body.removeChild(textarea);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full animate-fade-in-up text-center max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{event.name}</h2>
                <div className="text-right space-y-3 mb-6">
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">التاريخ:</strong> {event.date}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الوصف:</strong> {event.description || 'لا يوجد وصف'}</p>
                    {event.isCompleted && (
                        <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full mt-2">
                            حدث منتهي
                        </span>
                    )}
                </div>

                {isAdmin && !event.publicLinkToken && ( // Show generate link button only if admin and no public link exists
                    <button onClick={() => onGeneratePublicLink(event)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out mb-6">
                        <Share2 className="inline-block h-4 w-4 ml-2" /> إنشاء رابط عام للحدث
                    </button>
                )}
                {isAdmin && event.publicLinkToken && (
                    <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 mb-6">
                        <p className="text-purple-800 font-semibold mb-2">هذا الحدث لديه رابط عام نشط:</p>
                        <a href={`${window.location.origin}/?public_token=${event.publicLinkToken}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm mb-2 text-center">
                            {window.location.origin}/?public_token={event.publicLinkToken}
                        </a>
                        <button onClick={() => handleCopyLink(`${window.location.origin}/?public_token=${event.publicLinkToken}`)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded-full text-xs shadow-md transition duration-200 ease-in-out flex items-center mb-2">
                            <ClipboardCopy className="inline-block h-4 w-4 ml-1" /> نسخ الرابط
                        </button>
                        {/* استخدام QRCodeCanvas بدلاً من QRCode */}
                        <QRCodeCanvas value={`${window.location.origin}/?public_token=${event.publicLinkToken}`} size={128} level="H" includeMargin={true} />
                    </div>
                )}


                <h3 className="text-xl font-bold text-gray-800 mb-4 border-t pt-4">المنتجات الصادرة للحدث:</h3>
                {eventOutgoingItems.length === 0 ? (
                    <p className="text-gray-500">لم يتم إصدار أي منتجات لهذا الحدث.</p>
                ) : (
                    <div className="space-y-4">
                        {eventOutgoingItems.map(item => (
                            <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100 text-right">
                                <img src={item.productImageUrl || "https://placehold.co/60x60/cccccc/ffffff?text=لا+صورة"} alt={item.name} className="w-16 h-16 object-contain rounded-md border border-gray-200 ml-4" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/ffffff?text=لا+صورة'; }} />
                                <div className="flex-grow">
                                    <p className="text-lg font-semibold text-gray-900">{item.productName}</p>
                                    <p className="text-md text-gray-700">الكمية الصادرة: <span className="font-bold">{item.quantityIssued}</span></p>
                                    <p className="text-sm text-gray-500">بتاريخ: {new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={onClose} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <X className="inline-block h-5 w-5 ml-2" /> إغلاق
                </button>
            </div>
        </div>
    );
};


const LoginModal = ({ show, onClose, onLoginSuccess, displayMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (!show) return null;

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const userData = await response.json();
            // Store username and access_token
            localStorage.setItem('username', userData.username);
            localStorage.setItem('access_token', userData.access_token);
            
            displayMessage('تسجيل الدخول ناجح!', `أهلاً بك, ${userData.name || userData.username}!`, 'success');
            onLoginSuccess(userData);
            onClose();
        } catch (error) {
            console.error('Login failed:', error);
            displayMessage('فشل تسجيل الدخول', `${error.message}`, 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">تسجيل الدخول</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">اسم المستخدم:</label>
                        <input type="text" id="login-username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">كلمة المرور:</label>
                        <input type="password" id="login-password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                            <LogIn className="inline-block h-5 w-5 ml-2" /> تسجيل الدخول
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// New: Create Public Link Modal
const CreatePublicLinkModal = ({ show, onClose, onSubmit, eventName, generatedLinkData, setGeneratedLinkData, displayMessage }) => {
    const [permanent, setPermanent] = useState(true);
    const [expirationDate, setExpirationDate] = useState('');

    useEffect(() => {
        if (!show) {
            setPermanent(true);
            setExpirationDate('');
            setGeneratedLinkData(null); // Reset generated link when modal closes
        }
    }, [show, setGeneratedLinkData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(permanent, expirationDate);
    };

    const handleCopyLink = (linkText) => {
        // Try modern navigator.clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(linkText)
                .then(() => displayMessage('تم النسخ', 'تم نسخ الرابط إلى الحافظة!', 'success'))
                .catch(err => {
                    console.error('Failed to copy using navigator.clipboard:', err);
                    // Fallback to execCommand if clipboard API fails
                    copyToClipboardFallback(linkText);
                });
        } else {
            // Fallback for environments where navigator.clipboard is not defined (like Canvas)
            copyToClipboardFallback(linkText);
        }
    };

    const copyToClipboardFallback = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Avoid scrolling to bottom
        textarea.style.opacity = '0'; // Hide it
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            displayMessage('تم النسخ', 'تم نسخ الرابط إلى الحافظة!', 'success');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            displayMessage('خطأ', 'فشل نسخ الرابط.', 'error');
        }
        document.body.removeChild(textarea);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">إنشاء رابط عام لـ: {eventName}</h2>
                {!generatedLinkData ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="permanentLink" className="flex items-center text-sm font-medium text-gray-700">
                                <input type="checkbox" id="permanentLink" checked={permanent} onChange={e => setPermanent(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2" />
                                <span>رابط دائم (لا تنتهي صلاحيته)</span>
                            </label>
                        </div>
                        {!permanent && (
                            <div>
                                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">تاريخ انتهاء الصلاحية:</label>
                                <input type="date" id="expirationDate" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} required={!permanent} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out" />
                            </div>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                                <X className="inline-block h-5 w-5 ml-2" /> إلغاء
                            </button>
                            <button type="submit" className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                                <Share2 className="inline-block h-5 w-5 ml-2" /> إنشاء الرابط
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 mb-4">تم إنشاء الرابط بنجاح!</p>
                        <div className="bg-gray-100 p-4 rounded-lg break-all mb-4 shadow-inner">
                            <p className="text-sm text-gray-600 mb-2">رابط المشاركة:</p>
                            <a href={generatedLinkData.publicLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                {generatedLinkData.publicLink}
                            </a>
                        </div>
                        <button onClick={() => handleCopyLink(generatedLinkData.publicLink)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out flex items-center justify-center mx-auto mb-4">
                            <ClipboardCopy className="inline-block h-4 w-4 ml-2" /> نسخ الرابط
                        </button>
                        <div className="flex justify-center mb-6">
                            {/* استخدام QRCodeCanvas component هنا */}
                            <QRCodeCanvas value={generatedLinkData.publicLink} size={160} level="H" includeMargin={true} />
                        </div>
                        <button onClick={onClose} className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                            <X className="inline-block h-5 w-5 ml-2" /> إغلاق
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// New: Public Product Details Modal for Public Event Viewer
const PublicProductDetailsModal = ({ show, onClose, item }) => {
    if (!show || !item) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in-up text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">تفاصيل المنتج</h2>
                <div className="mb-4">
                    <img src={item.productImageUrl || "https://placehold.co/200x200/cccccc/ffffff?text=لا+صورة"} alt="صورة المنتج" className="w-full h-auto max-h-64 object-contain rounded-lg mx-auto border border-gray-200 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/cccccc/ffffff?text=لا+صورة'; }} />
                </div>
                <div className="text-right space-y-3">
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">المنتج:</strong> {item.productName}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الوصف:</strong> {item.productDescription || 'لا يوجد وصف'}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الكمية الصادرة:</strong> {item.quantityIssued}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">تاريخ الإصدار:</strong> {new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <button onClick={onClose} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    <X className="inline-block h-5 w-5 ml-2" /> إغلاق
                </button>
            </div>
        </div>
    );
};


// New: Public Event Viewer Component
const PublicEventViewer = ({ publicToken, displayMessage, API_BASE_URL }) => {
    const [eventData, setEventData] = useState(null);
    const [outgoingItems, setOutgoingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPublicProductModal, setShowPublicProductModal] = useState(false);
    const [selectedPublicProduct, setSelectedPublicProduct] = useState(null);

    const handleOpenPublicProductModal = (item) => {
        setSelectedPublicProduct(item);
        setShowPublicProductModal(true);
    };

    const handleClosePublicProductModal = () => {
        setShowPublicProductModal(false);
        setSelectedPublicProduct(null);
    };

    useEffect(() => {
        const fetchPublicEventData = async () => {
            try {
                setLoading(true);
                // هذا الاستدعاء يستخدم fetch العادي وليس authenticatedFetch
                // لأنه لا يتطلب مصادقة JWT وهو مخصص للعرض العام
                const response = await fetch(`${API_BASE_URL}/public-event/${publicToken}`);
                if (!response.ok) {
                    const errorJson = await response.json();
                    throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setEventData(data.event);
                setOutgoingItems(data.outgoing_items);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch public event data:", err);
                setError(err.message);
                displayMessage('خطأ في تحميل الحدث', `تعذر تحميل تفاصيل الحدث: ${err.message}`, 'error');
                setLoading(false);
            }
        };

        if (publicToken) {
            fetchPublicEventData();
        }
    }, [publicToken, API_BASE_URL, displayMessage]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="text-2xl font-semibold text-gray-700">جاري تحميل تفاصيل الحدث...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-xl border border-red-300">
                    <h2 className="text-3xl font-extrabold text-red-700 mb-4">خطأ</h2>
                    <p className="text-lg text-red-600 mb-6">{error}</p>
                    <p className="text-md text-gray-700">يرجى التأكد من أن الرابط صحيح وغير منتهي الصلاحية.</p>
                </div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-300">
                    <h2 className="text-3xl font-extrabold text-gray-700 mb-4">الحدث غير موجود</h2>
                    <p className="text-lg text-gray-600">يبدو أن هذا الرابط غير صالح أو تم حذفه.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 flex flex-col items-center p-4">
            <header className="w-full max-w-4xl bg-white shadow-lg p-6 rounded-b-xl mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-blue-700 mb-2">{eventData.name}</h1>
                <p className="text-gray-600 text-lg">تفاصيل الحدث والمنتجات الصادرة</p>
                {eventData.isCompleted && (
                    <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full mt-2">
                        حدث منتهي
                    </span>
                )}
            </header>

            <main className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
                <div className="text-right space-y-3 mb-6">
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">التاريخ:</strong> {eventData.date}</p>
                    <p className="text-lg text-gray-800"><strong className="text-blue-600">الوصف:</strong> {eventData.description || 'لا يوجد وصف'}</p>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4 border-t pt-4">المنتجات الصادرة للحدث:</h3>
                {outgoingItems.length === 0 ? (
                    <p className="text-gray-500">لم يتم إصدار أي منتجات لهذا الحدث.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {outgoingItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center"
                                onClick={() => handleOpenPublicProductModal(item)}
                            >
                                <img src={item.productImageUrl || "https://placehold.co/100x100/cccccc/ffffff?text=لا+صورة"} alt={item.productName} className="w-24 h-24 object-contain rounded-md border border-gray-200 mb-2" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/ffffff?text=لا+صورة'; }} />
                                <p className="text-lg font-semibold text-gray-900 truncate w-full">{item.productName}</p>
                                <p className="text-md text-gray-700">الكمية: <span className="font-bold">{item.quantityIssued}</span></p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <PublicProductDetailsModal
                show={showPublicProductModal}
                onClose={handleClosePublicProductModal}
                item={selectedPublicProduct}
            />


        </div>
    );
};


// ========================================================================================================
// مكون التذييل (Footer Component)
// ========================================================================================================
const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="bg-gray-800 text-white p-6 mt-12 shadow-inner rounded-t-xl">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-right space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <img
              src={logo}
              alt="شعار AWJ"
              className="h-16 w-16 rounded-full border-2 border-white shadow-lg"
            />
            <span className="text-xl font-bold text-gray-200">
              نظام إدارة مخزن AWJ
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            <p>&copy; {currentYear} AWJ. جميع الحقوق محفوظة.</p>
            <p className="mt-1">
              للاستفسارات، تواصل معنا على إنستجرام:{" "}
              <a
                href="https://www.instagram.com/awj.intl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                @awj.intl
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
};


// ========================================================================================================
// المكون الرئيسي App
// ========================================================================================================

function App() {
    // حالة التطبيق الرئيسية لتخزين البيانات وعناصر واجهة المستخدم
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [outgoingItems, setOutgoingItems] = useState([]);
    const [publicLinks, setPublicLinks] = useState([]); // New state for public links
    const [currentPage, setCurrentPage] = useState('products'); // الصفحة النشطة حاليًا

    // حالات المودالات وإظهارها/إخفائها
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // المنتج الذي يتم تعديله

    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null); // الحدث الذي يتم تعديله

    const [showIssueProductModal, setShowIssueProductModal] = useState(false);
    const [showEditOutgoingProductModal, setShowEditOutgoingProductModal] = useState(false);
    const [editingOutgoingItem, setEditingOutgoingItem] = useState(null); // العنصر الصادر الذي يتم تعديله

    const [showOutgoingProductDetailsModal, setShowOutgoingProductDetailsModal] = useState(false);
    const [viewingOutgoingItem, setViewingOutgoingItem] = useState(null); // العنصر الصادر الذي يتم عرض تفاصيله

    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false); // New: Event details modal
    const [viewingEvent, setViewingEvent] = useState(null); // New: Event being viewed in details modal

    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ title: '', text: '', type: '' });

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const [confirmText, setConfirmText] = useState('');

    const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // مصطلح البحث العام للمنتجات
    const [outgoingSearchTerm, setOutgoingSearchTerm] = useState(''); // مصطلح البحث للمنتجات الصادرة

    // ========================================================================================================
    // حالة المصادقة
    // ========================================================================================================
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // { id, username, name, role }
    const [userToken, setUserToken] = useState(null); // This will now store the JWT access_token
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authChecked, setAuthChecked] = useState(false); // لتتبع ما إذا كان التحقق الأولي للمصادقة قد تم

    // ========================================================================================================
    // حالة روابط الأحداث العامة
    // ========================================================================================================
    const [showCreatePublicLinkModal, setShowCreatePublicLinkModal] = useState(false);
    const [eventToCreatePublicLink, setEventToCreatePublicLink] = useState(null); // الحدث الذي سيتم إنشاء رابط عام له
    const [generatedLinkData, setGeneratedLinkData] = useState(null); // لتخزين الرابط و QR Code بعد الإنشاء


    // ========================================================================================================
    // حالة حقول النموذج (تم رفعها إلى المكون App)
    // ========================================================================================================
    // حالة نموذج المنتج
    const [productFormName, setProductFormName] = useState('');
    const [productFormQuantity, setProductFormQuantity] = useState('');
    const [productFormDescription, setProductFormDescription] = useState('');
    const [productFormImageUrl, setProductFormImageUrl] = useState('');

    // حالة نموذج الحدث
    const [eventFormName, setEventFormName] = useState('');
    const [eventFormDate, setEventFormDate] = useState('');
    const [eventFormDescription, setEventFormDescription] = useState('');
    const [eventFormIsCompleted, setEventFormIsCompleted] = useState(false); // New state for event completion status

    // حالة نموذج إصدار المنتج
    const [issueEventSelect, setIssueEventSelect] = useState('');
    const [issueProductSearch, setIssueProductSearch] = useState('');
    const [issueProductSelect, setIssueProductSelect] = useState('');
    const [issueQuantity, setIssueQuantity] = useState('');
    const [issueAvailableQuantity, setIssueAvailableQuantity] = useState(0);

    // حالة نموذج تعديل المنتج الصادر
    const [editOutgoingQuantity, setEditOutgoingQuantity] = useState('');
    const [editOutgoingCurrentStock, setEditOutgoingCurrentStock] = useState(0);


    // ========================================================================================================
    // وظائف مساعدة لواجهة المستخدم (UI Helpers)
    // ========================================================================================================

    // عرض رسالة (نجاح/خطأ)
    const displayMessage = useCallback((title, text, type) => {
        setMessageContent({ title, text, type });
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000); // إخفاء الرسالة بعد 3 ثوانٍ
    }, []);

    // عرض مودال التأكيد
    const displayConfirm = useCallback((text, callback) => {
        setConfirmText(text);
        setConfirmCallback(() => callback); // استخدام دالة لفحص النطاق
        setShowConfirm(true);
    }, []);

    // ========================================================================================================
    // وظائف API CRUD (الاتصال بـ Flask Backend)
    // ========================================================================================================

    // دالة مساعدة لعمليات الجلب الموثقة
    const authenticatedFetch = useCallback(async (url, options = {}) => {
        const accessToken = localStorage.getItem('access_token'); // جلب الرمز المميز JWT

        if (!accessToken) {
            // إذا لم يتم العثور على رمز مميز، يجب على المستخدم تسجيل الدخول.
            setIsLoggedIn(false);
            setCurrentUser(null);
            setShowLoginModal(true);
            displayMessage('المصادقة مطلوبة', 'الرجاء تسجيل الدخول للمتابعة.', 'error');
            throw new Error('Authentication required: No access token found.');
        }

        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // إضافة رأس Authorization
        };

        try {
            const response = await fetch(url, { ...options, headers });

            // إذا كانت الحالة 401 (غير مصرح به) أو 403 (محظور)، فربما يكون الرمز المميز منتهي الصلاحية أو غير صالح
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('username');
                localStorage.removeItem('access_token'); // مسح الرمز المميز غير الصالح
                setIsLoggedIn(false);
                setCurrentUser(null);
                setShowLoginModal(true);
                const errorData = await response.json();
                displayMessage('انتهاء صلاحية الجلسة', `الرجاء تسجيل الدخول مرة أخرى: ${errorData.error || 'توكن غير صالح أو منتهي الصلاحية'}`, 'error');
                throw new Error('Unauthorized or Forbidden: Token expired/invalid');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return response;

        } catch (error) {
            console.error('Authenticated fetch error:', error);
            throw error;
        }
    }, [displayMessage]);


    // جلب جميع البيانات من الواجهة الخلفية
    const fetchData = useCallback(async () => {
        // لا تجلب البيانات إذا لم يتم التحقق من المصادقة بعد
        // أو إذا لم يتم تسجيل الدخول (لتجنب طلبات API غير مصرح بها)
        // الأهم: لا تجلب البيانات إذا كان هناك publicToken في URL (لحل مشكلة الحلقة والثغرة الأمنية)
        const urlParams = new URLSearchParams(window.location.search);
        const publicToken = urlParams.get('public_token');
        if (!authChecked || !isLoggedIn || publicToken) { // أضف publicToken هنا
            return;
        }
        try {
            const productsResponse = await authenticatedFetch(`${API_BASE_URL}/products`);
            if (!productsResponse.ok) throw new Error('Failed to fetch products');
            const productsData = await productsResponse.json();
            setProducts(productsData);

            const eventsResponse = await authenticatedFetch(`${API_BASE_URL}/events`);
            if (!eventsResponse.ok) throw new Error('Failed to fetch events');
            const eventsData = await eventsResponse.json(); // جلب بيانات الأحداث أولاً
            
            // Fetch public links separately
            const publicLinksResponse = await authenticatedFetch(`${API_BASE_URL}/public-links`);
            if (!publicLinksResponse.ok) throw new Error('Failed to fetch public links');
            const publicLinksData = await publicLinksResponse.json();
            setPublicLinks(publicLinksData); // تحديث حالة publicLinks

            // دمج معلومات الرابط العام مع الأحداث للعرض في الواجهة الأمامية
            const updatedEventsData = eventsData.map(event => {
                const linkedPublicLink = publicLinksData.find(link => link.eventId === event.id);
                return { ...event, publicLinkToken: linkedPublicLink ? linkedPublicLink.token : null };
            });
            setEvents(updatedEventsData); // تحديث حالة الأحداث بعد الدمج


            const outgoingItemsResponse = await authenticatedFetch(`${API_BASE_URL}/outgoing-items`);
            if (!outgoingItemsResponse.ok) throw new Error('Failed to fetch outgoing items');
            // الواجهة الخلفية لـ Flask تقوم بالفعل بدمج تفاصيل المنتج والحدث
            const outgoingItemsData = await outgoingItemsResponse.json();
            outgoingItemsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // الفرز حسب التاريخ الأحدث
            setOutgoingItems(outgoingItemsData);


        } catch (error) {
            console.error('Error fetching data:', error);
            // displayMessage is already called by authenticatedFetch for auth errors
        }
    }, [authenticatedFetch, authChecked, isLoggedIn]);


    // تأثير للتحقق الأولي من المصادقة عند تحميل المكون
    useEffect(() => {
        const checkInitialAuth = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const publicToken = urlParams.get('public_token');

            // إذا كان الرابط عامًا، لا تحاول المصادقة أو جلب بيانات المستخدم
            if (publicToken) {
                setIsLoggedIn(false);
                setCurrentUser(null);
                setUserToken(null);
                setAuthChecked(true); // تم الانتهاء من التحقق الأولي للمصادقة (في وضع العرض العام)
                return; // لا تكمل عملية المصادقة
            }

            const username = localStorage.getItem('username');
            const accessToken = localStorage.getItem('access_token'); // جلب access_token

            if (username && accessToken) {
                setIsLoggedIn(true);
                setCurrentUser({ username: username, role: 'admin' }); // دور افتراضي مؤقت: admin
                setUserToken(accessToken); 
            } else {
                setIsLoggedIn(false);
                setCurrentUser(null);
                setUserToken(null);
                setShowLoginModal(true); // عرض مودال تسجيل الدخول إذا لم يتم العثور على رمز مميز
            }
            setAuthChecked(true); // تم الانتهاء من التحقق الأولي للمصادقة
        };

        checkInitialAuth();
    }, [displayMessage]);


    // تأثير لجلب البيانات مرة واحدة فقط بعد التحقق من المصادقة وتسجيل الدخول
    useEffect(() => {
        // يتم استدعاء fetchData فقط إذا تم التحقق من المصادقة، وتم تسجيل الدخول، ولا يوجد publicToken
        // (تم نقل منطق publicToken إلى داخل fetchData نفسها للتحكم المركزي)
        if (authChecked && isLoggedIn) {
             fetchData();
        }
    }, [authChecked, isLoggedIn, fetchData]);

    // دالة عامة لإرسال طلبات POST/PUT
    const sendApiRequest = async (url, method, data) => {
        try {
            const response = await authenticatedFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            displayMessage('نجاح!', 'تمت العملية بنجاح.', 'success');
            fetchData(); // إعادة جلب البيانات بعد العملية الناجحة لتحديث الواجهة
            return true;
        }
        catch (error) {
            console.error(`API ${method} request failed:`, error);
            // displayMessage is already called by authenticatedFetch for auth errors
            return false;
        }
    };

    // دالة عامة لإرسال طلبات DELETE
    const deleteApiRequest = async (url) => {
        try {
            const response = await authenticatedFetch(url, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            displayMessage('نجاح!', 'تم الحذف بنجاح!', 'success');
            fetchData(); // إعادة جلب البيانات بعد الحذف الناجح لتحديث الواجهة
            return true;
        } catch (error) {
            console.error('API DELETE request failed:', error);
            // displayMessage is already called by authenticatedFetch for auth errors
            return false;
        }
    };

    // ========================================================================================================
    // معالجات فتح/إغلاق المودالات وتهيئة حالة النموذج
    // ========================================================================================================

    const handleOpenProductModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            setProductFormName(product.name);
            setProductFormQuantity(product.quantity);
            setProductFormDescription(product.description || '');
            setProductFormImageUrl(product.imageUrl || '');
        } else {
            setProductFormName('');
            setProductFormQuantity('');
            setProductFormDescription('');
            setProductFormImageUrl('');
        }
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
        setEditingProduct(null); // مسح المنتج الذي يتم تعديله
    };

    const handleOpenEventModal = (event = null) => {
        setEditingEvent(event);
        if (event) {
            setEventFormName(event.name);
            setEventFormDate(event.date);
            setEventFormDescription(event.description || '');
            setEventFormIsCompleted(event.isCompleted || false); // Set initial value for isCompleted
        } else {
            setEventFormName('');
            setEventFormDate('');
            setEventFormDescription('');
            setEventFormIsCompleted(false); // Default to false for new events
        }
        setShowEventModal(true);
    };

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setEditingEvent(null); // مسح الحدث الذي يتم تعديله
    };

    const handleOpenIssueProductModal = () => {
        // تهيئة حقول نموذج الإصدار
        setIssueEventSelect('');
        setIssueProductSearch('');
        setIssueProductSelect('');
        setIssueQuantity('');
        setIssueAvailableQuantity(0); // إعادة تعيين الكمية المتاحة عند فتح المودال
        setShowIssueProductModal(true);
    };

    const handleCloseIssueProductModal = () => {
        setShowIssueProductModal(false);
    };

    const handleOpenEditOutgoingProductModal = (item) => {
        setEditingOutgoingItem(item);
        setEditOutgoingQuantity(item.quantityIssued);
        const associatedProduct = products.find(p => p.id === item.productId);
        // الكمية المتوفرة في المخزن (معدلة لتشمل الكمية الأصلية لهذا العنصر إذا تم إرجاعها)
        setEditOutgoingCurrentStock((associatedProduct?.quantity || 0) + item.quantityIssued);
        setShowEditOutgoingProductModal(true);
    };

    const handleCloseEditOutgoingProductModal = () => {
        setShowEditOutgoingProductModal(false);
        setEditingOutgoingItem(null);
    };

    const handleOpenOutgoingProductDetailsModal = (item) => {
        setViewingOutgoingItem(item);
        setShowOutgoingProductDetailsModal(true);
    };

    const handleCloseOutgoingProductDetailsModal = () => {
        setShowOutgoingProductDetailsModal(false);
        setViewingOutgoingItem(null);
    };

    const handleOpenEventDetailsModal = (event) => {
        setViewingEvent(event);
        setShowEventDetailsModal(true);
    };

    const handleCloseEventDetailsModal = () => {
        setShowEventDetailsModal(false);
        setViewingEvent(null);
    };

    const handleUserLoginSuccess = (userData) => {
        setIsLoggedIn(true);
        setCurrentUser(userData);
        // حفظ الرمز المميز JWT الذي تم إنشاؤه بواسطة Flask
        localStorage.setItem('username', userData.username);
        localStorage.setItem('access_token', userData.access_token); 
        setUserToken(userData.access_token);
        setShowLoginModal(false); // إخفاء مودال تسجيل الدخول
        fetchData(); // جلب البيانات بعد تسجيل الدخول بنجاح
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('access_token'); // مسح access_token
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserToken(null);
        setProducts([]); // مسح البيانات المعروضة بعد تسجيل الخروج
        setEvents([]);
        setOutgoingItems([]);
        setPublicLinks([]); // Clear public links
        displayMessage('تسجيل الخروج', 'تم تسجيل الخروج بنجاح.', 'success');
        setShowLoginModal(true); // عرض مودال تسجيل الدخول
    };


    // ========================================================================================================
    // معالجات إرسال النماذج (Form Submission Hوlers)
    // ========================================================================================================

    const handleProductFormSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            name: productFormName,
            quantity: parseInt(productFormQuantity, 10),
            description: productFormDescription,
            imageUrl: productFormImageUrl
        };

        if (editingProduct) {
            await sendApiRequest(`${API_BASE_URL}/products/${editingProduct.id}`, 'PUT', productData);
        } else {
            await sendApiRequest(`${API_BASE_URL}/products`, 'POST', productData);
        }
        handleCloseProductModal(); // إغلاق المودال بعد الإرسال
    };

    const handleEventFormSubmit = async (e) => {
        e.preventDefault();
        const eventData = {
            name: eventFormName,
            date: eventFormDate,
            description: eventFormDescription,
            isCompleted: eventFormIsCompleted // Include the new isCompleted field
        };

        if (editingEvent) {
            await sendApiRequest(`${API_BASE_URL}/events/${editingEvent.id}`, 'PUT', eventData);
        } else {
            await sendApiRequest(`${API_BASE_URL}/events`, 'POST', eventData);
        }
        handleCloseEventModal(); // إغلاق المودال بعد الإرسال
    };

    const handleIssueProductFormSubmit = async (e) => {
        e.preventDefault();
        const product = products.find(p => p.id === issueProductSelect);
        if (!product || issueQuantity <= 0 || issueQuantity > product.quantity) {
            displayMessage('خطأ في الكمية', `الكمية غير صالحة أو غير متوفرة. المتوفر: ${product?.quantity || 0}`, 'error');
            return;
        }

        await sendApiRequest(`${API_BASE_URL}/outgoing-items`, 'POST', {
            eventId: issueEventSelect,
            productId: issueProductSelect,
            quantity: issueQuantity // يجب أن تتطابق مع اسم الحقل في الواجهة الخلفية لـ Flask
        });
        handleCloseIssueProductModal(); // إغلاق المودال بعد الإرسال
    };

    const handleEditOutgoingProductFormSubmit = async (e) => {
        e.preventDefault();
        const newQuantity = parseInt(editOutgoingQuantity, 10);

        if (!editingOutgoingItem) return;

        await sendApiRequest(`${API_BASE_URL}/outgoing-items/${editingOutgoingItem.id}`, 'PUT', {
            quantityIssued: newQuantity // يجب أن تتطابق مع اسم الحقل في الواجهة الخلفية لـ Flask
        });
        handleCloseEditOutgoingProductModal(); // إغلاق المودال بعد الإرسال
    };

    // معالجة حذف المنتج الصادر (يتم التأكيد أولاً)
    const handleDeleteOutgoingItemConfirmed = async (item) => {
        await deleteApiRequest(`${API_BASE_URL}/outgoing-items/${item.id}`);
        setShowConfirm(false);
    };

    // New: Handle marking an event as completed
    const handleEndEvent = async (event) => {
        displayConfirm(`هل أنت متأكد أنك تريد إنهاء الحدث "${event.name}"؟ سيتم نقله إلى الأحداث المنتهية.`, async () => {
            const eventData = { ...event, isCompleted: true }; // Create a new object with updated status
            await sendApiRequest(`${API_BASE_URL}/events/${event.id}`, 'PUT', eventData);
            setShowConfirm(false);
        });
    };

    // New: Handle generating a public link for an event
    const handleGeneratePublicLink = (event) => {
        setEventToCreatePublicLink(event);
        setGeneratedLinkData(null); // Reset any previously generated link data
        setShowCreatePublicLinkModal(true);
    };

    const handleCreatePublicLinkSubmit = async (permanent, expirationDate) => {
        if (!eventToCreatePublicLink) return;

        const payload = {
            eventId: eventToCreatePublicLink.id,
            permanent: permanent
        };
        if (!permanent) {
            payload.expirationDate = expirationDate;
        }

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/public-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            // Assuming Flask returns { token, expiration_date, link_id }
            const fullLink = `${window.location.origin}/?public_token=${data.token}`;
            setGeneratedLinkData({ publicLink: fullLink, qrCodeValue: fullLink }); // Set QR value to full link
            displayMessage('نجاح!', 'تم إنشاء الرابط العام بنجاح!', 'success');
            fetchData(); // Refresh data to show public link on event card
        } catch (error) {
            console.error('Failed to create public link:', error);
            displayMessage('خطأ', `فشل إنشاء الرابط العام: ${error.message}`, 'error');
        }
    };

    // New: Handle deleting a public link
    const handleDeletePublicLink = async (linkId) => {
        console.log(`Attempting to delete public link with ID: ${linkId}`); // Log for debugging
        displayConfirm("هل أنت متأكد أنك تريد حذف هذا الرابط العام؟ لا يمكن التراجع عن هذا الإجراء.", async () => {
            console.log(`Confirmed deletion for link ID: ${linkId}`); // Log for debugging
            await deleteApiRequest(`${API_BASE_URL}/public-links/${linkId}`);
            setShowConfirm(false);
        });
    };

    // ========================================================================================================
    // وظائف عرض الأقسام (Section Renderers - داخل App Component)
    // ========================================================================================================

    const renderProductManagement = () => {
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(currentSearchTerm.toLowerCase()))
        );

        return (
            <section id="products-management" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">إدارة المنتجات</h1>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                    <button onClick={() => handleOpenProductModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out w-full sm:w-auto">
                        <PlusCircle className="inline-block h-5 w-5 ml-2" /> إضافة منتج جديد
                    </button>
                    <input type="text" placeholder="البحث عن المنتجات..." value={currentSearchTerm} onChange={e => setCurrentSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition duration-150 ease-in-out text-right" />
                </div>
                <div id="products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-500 text-lg">
                            لا توجد منتجات مطابقة لعملية البحث.
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out flex flex-col">
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <img src={product.imageUrl || "https://placehold.co/200x200/cccccc/ffffff?text=لا+صورة"} alt={product.name} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/cccccc/ffffff?text=لا+صورة'; }} />
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-700 mb-1">
                                        <strong className="text-blue-600">الكمية:</strong> {product.quantity}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {product.description || 'لا يوجد وصف.'}
                                    </p>
                                    <div className="flex justify-end space-x-2 mt-auto">
                                        <button onClick={() => handleOpenProductModal(product)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out">
                                            <Edit className="inline-block h-4 w-4" />
                                        </button>
                                        <button onClick={() => displayConfirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟", async () => { await deleteApiRequest(`${API_BASE_URL}/products/${product.id}`); })} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out">
                                            <Trash2 className="inline-block h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        );
    };

    const renderEventManagement = () => {
        return (
            <section id="events-management" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">إدارة الأحداث (جميع الأحداث)</h1>
                <div className="mb-6 text-center">
                    <button onClick={() => handleOpenEventModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
                        <PlusCircle className="inline-block h-5 w-5 ml-2" /> إضافة حدث جديد
                    </button>
                </div>
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-100"><tr>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">اسم الحدث</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">التاريخ</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">الوصف</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">الإجراءات</th>
                        </tr></thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        لا توجد أحداث حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                events.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition duration-150 ease-in-out even:bg-gray-50">
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{event.name} {event.isCompleted && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mr-2">منتهي</span>}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{event.date}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{event.description || 'لا يوجد وصف'}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-center space-x-2">
                                            <button onClick={() => handleOpenEventModal(event)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full text-xs shadow-md transition duration-200 ease-in-out">
                                                <Edit className="inline-block h-4 w-4" />
                                            </button>
                                            <button onClick={() => displayConfirm("هل أنت متأكد أنك تريد حذف هذا الحدث؟", async () => { await deleteApiRequest(`${API_BASE_URL}/events/${event.id}`); })} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-xs shadow-md transition duration-200 ease-in-out">
                                                <Trash2 className="inline-block h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    const renderOutgoingProducts = () => {
        const filteredItems = outgoingItems.filter(item =>
            (item.productName && item.productName.toLowerCase().includes(outgoingSearchTerm.toLowerCase())) ||
            (item.eventName && item.eventName.toLowerCase().includes(outgoingSearchTerm.toLowerCase())) ||
            (item.timestamp && new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }).toLowerCase().includes(outgoingSearchTerm.toLowerCase()))
        );

        return (
            <section id="outgoing-products" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">المنتجات الصادرة من المخزن</h1>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                    <button onClick={() => handleOpenIssueProductModal()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out w-full sm:w-auto">
                        <Download className="inline-block h-5 w-5 ml-2" /> إصدار منتجات جديدة
                    </button>
                    <input type="text" placeholder="البحث في المنتجات الصادرة..." value={outgoingSearchTerm} onChange={e => setOutgoingSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition duration-150 ease-in-out text-right" />
                </div>
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-100"><tr>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">الصورة</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">المنتج</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">الكمية الصادرة</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">اسم الحدث</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">تاريخ الحدث</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">تاريخ الإصدار</th>
                            <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">الإجراءات</th>
                        </tr></thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6 text-gray-500">
                                        لم يتم إصدار أي منتجات مطابقة لعملية البحث.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition duration-150 ease-in-out even:bg-gray-50 cursor-pointer" onClick={() => handleOpenOutgoingProductDetailsModal(item)}>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">
                                            <img src={item.productImageUrl || "https://placehold.co/60x60/cccccc/ffffff?text=لا+صورة"} alt={item.productName} className="w-12 h-12 object-contain rounded-md border border-gray-200" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/ffffff?text=لا+صورة'; }} />
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{item.productName}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{item.quantityIssued}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{item.eventName}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{item.eventDate || 'N/A'}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">
                                            {new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-center space-x-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenEditOutgoingProductModal(item); }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-xs shadow-md transition duration-200 ease-in-out">
                                                <Edit className="inline-block h-4 w-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); displayConfirm(`هل أنت متأكد أنك تريد حذف هذا السجل الصادر؟ (الكمية ${item.quantityIssued} من ${item.productName} ستعود للمخزن)`, () => handleDeleteOutgoingItemConfirmed(item)); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-xs shadow-md transition duration-200 ease-in-out">
                                                <Trash2 className="inline-block h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    // New: Render Active Events
    const renderActiveEvents = () => {
        const activeEvents = events.filter(event => !event.isCompleted);

        return (
            <section id="active-events" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">الأحداث الجارية</h1>
                <div className="mb-6 text-center">
                    <button onClick={() => handleOpenEventModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
                        <PlusCircle className="inline-block h-5 w-5 ml-2" /> إضافة حدث جديد
                    </button>
                </div>
                <div id="active-events-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeEvents.length === 0 ? (
                        <div className="col-span-full text-center py-6 text-gray-500">
                            لا توجد أحداث جارية حالياً.
                        </div>
                    ) : (
                        activeEvents.map(event => (
                            <div key={event.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-200 flex flex-col h-full" onClick={() => handleOpenEventDetailsModal(event)}>
                                <h2 className="text-2xl font-bold text-blue-700 mb-2 truncate" title={event.name}>{event.name}</h2>
                                <p className="text-gray-600 mb-1">
                                    <strong className="text-gray-800">التاريخ:</strong> {event.date}
                                </p>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    <strong className="text-gray-800">الوصف:</strong> {event.description || 'لا يوجد وصف'}
                                </p>

                                <h3 className="text-lg font-semibold text-gray-800 mb-2 border-t pt-4 mt-auto">المنتجات الصادرة:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1 max-h-24 overflow-y-auto mb-4">
                                    {outgoingItems.filter(item => item.eventId === event.id).length === 0 ? (
                                        <p className="text-sm text-gray-500">لم يتم إصدار منتجات لهذا الحدث.</p>
                                    ) : (
                                        outgoingItems.filter(item => item.eventId === event.id).map(item => (
                                            <li key={item.id} className="text-sm flex items-center">
                                                <img src={item.productImageUrl || "https://placehold.co/30x30/cccccc/ffffff?text=لا+صورة"} alt={item.name} className="w-6 h-6 object-contain rounded-full mr-2" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/cccccc/ffffff?text=لا+صورة'; }} />
                                                {item.productName}: <span className="font-medium">{item.quantityIssued}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                                {currentUser?.role === 'admin' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleEndEvent(event); }} className="mt-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out self-end w-auto">
                                        <Flag className="inline-block h-4 w-4 ml-2" /> انتهى الحدث
                                    </button>
                                )}
                                {currentUser?.role === 'admin' && !event.publicLinkToken && (
                                    <button onClick={(e) => { e.stopPropagation(); handleGeneratePublicLink(event); }} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition duration-200 ease-in-out self-end w-auto">
                                        <Share2 className="inline-block h-4 w-4 ml-2" /> إنشاء رابط عام
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        );
    };

    // New: Render Completed Events
    const renderCompletedEvents = () => {
        const completedEvents = events.filter(event => event.isCompleted);

        return (
            <section id="completed-events" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">الأحداث المنتهية</h1>
                <div id="completed-events-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedEvents.length === 0 ? (
                        <div className="col-span-full text-center py-6 text-gray-500">
                            لا توجد أحداث منتهية حتى الآن.
                        </div>
                    ) : (
                        completedEvents.map(event => (
                            <div key={event.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-200 flex flex-col h-full" onClick={() => handleOpenEventDetailsModal(event)}>
                                <h2 className="text-2xl font-bold text-gray-700 mb-2 truncate" title={event.name}>{event.name}</h2>
                                <p className="text-gray-600 mb-1">
                                    <strong className="text-gray-800">التاريخ:</strong> {event.date}
                                </p>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    <strong className="text-gray-800">الوصف:</strong> {event.description || 'لا يوجد وصف'}
                                </p>
                                <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full mt-auto self-start">
                                    حدث منتهي
                                </span>

                                <h3 className="text-lg font-semibold text-gray-800 mb-2 border-t pt-4 mt-auto">المنتجات الصادرة:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1 max-h-24 overflow-y-auto mb-4">
                                    {outgoingItems.filter(item => item.eventId === event.id).length === 0 ? (
                                        <p className="text-sm text-gray-500">لم يتم إصدار منتجات لهذا الحدث.</p>
                                    ) : (
                                        outgoingItems.filter(item => item.eventId === event.id).map(item => (
                                            <li key={item.id} className="text-sm flex items-center">
                                                <img src={item.productImageUrl || "https://placehold.co/30x30/cccccc/ffffff?text=لا+صورة"} alt={item.name} className="w-6 h-6 object-contain rounded-full mr-2" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/cccccc/ffffff?text=لا+صورة'; }} />
                                                {item.productName}: <span className="font-medium">{item.quantityIssued}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </section>
        );
    };

    // New: Render Public Links Management
    const renderPublicLinksManagement = () => {
        const sortedLinks = [...publicLinks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return (
            <section id="public-links-management" className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">روابط الأحداث العامة</h1>
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">الحدث</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">الرابط</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">تاريخ الإنشاء</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">تاريخ الانتهاء</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publicLinks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-500">
                                        لا توجد روابط عامة حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                sortedLinks.map(link => {
                                    const associatedEvent = events.find(event => event.id === link.eventId);
                                    const linkStatus = link.permanent ? 'دائم' : (new Date(link.expirationDate) > new Date() ? 'نشط' : 'منتهي');
                                    const statusColor = linkStatus === 'دائم' ? 'bg-blue-100 text-blue-700' : (linkStatus === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');

                                    return (
                                        <tr key={link.id} className="hover:bg-gray-50 transition duration-150 ease-in-out even:bg-gray-50">
                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{associatedEvent ? associatedEvent.name : 'حدث محذوف'}</td>
                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-blue-600 break-all">
                                                <a href={`${window.location.origin}/?public_token=${link.token}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    عرض الرابط
                                                </a>
                                            </td>
                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{new Date(link.created_at).toLocaleDateString('ar-EG')}</td>
                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{link.permanent ? 'دائم' : new Date(link.expirationDate).toLocaleDateString('ar-EG')}</td>
                                            <td className="py-3 px-4 border-b border-gray-200 text-center">
                                                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
                                                    {linkStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b border-gray-200 text-center">
                                                {currentUser?.role === 'admin' && (
                                                    <button onClick={() => handleDeletePublicLink(link.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-xs shadow-md transition duration-200 ease-in-out">
                                                        <Trash2 className="inline-block h-4 w-4" /> حذف
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };


    // وظيفة لاختيار القسم المراد عرضه
    const renderContent = () => {
        // التحقق مما إذا كان التطبيق يعمل في وضع العرض العام (عبر public_token في URL)
        const urlParams = new URLSearchParams(window.location.search);
        const publicToken = urlParams.get('public_token');

        if (publicToken) {
            // في وضع العرض العام، قم بعرض مكون PublicEventViewer فقط
            // ولا تمرر displayMessage كـ dependency ل useEffect الخاص بـ PublicEventViewer
            return <PublicEventViewer publicToken={publicToken} displayMessage={displayMessage} API_BASE_URL={API_BASE_URL} />;
        }

        // إذا لم يتم التحقق من المصادقة بعد، لا تعرض أي شيء
        if (!authChecked) {
            return (
                <div className="flex justify-center items-center h-96 text-lg text-gray-600">
                    جاري التحقق من المصادقة...
                </div>
            );
        }
        // إذا لم يتم تسجيل الدخول، لا تعرض أي شيء (مودال تسجيل الدخول سيظهر)
        if (!isLoggedIn) {
            return (
                <div className="flex justify-center items-center h-96 text-lg text-red-600">
                    الرجاء تسجيل الدخول للوصول إلى النظام.
                </div>
            );
        }

        switch (currentPage) {
            case 'products':
                return renderProductManagement();
            case 'events': // This now renders *all* events in one table
                return renderEventManagement();
            case 'outgoing':
                return renderOutgoingProducts();
            case 'activeEvents': // New case
                return renderActiveEvents();
            case 'completedEvents': // New case
                return renderCompletedEvents();
            case 'publicLinks': // New case
                return renderPublicLinksManagement();
            default:
                return renderProductManagement();
        }
    };

    // التحقق من وجود public_token في الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    const publicTokenPresent = urlParams.has('public_token');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900" dir="rtl">
            {/* إخفاء شريط التنقل بالكامل إذا كان public_token موجودًا */}
            {!publicTokenPresent && (
                <nav className="bg-white shadow-lg p-4 md:p-6 mb-8 rounded-b-xl">
                    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <img src={logo} alt="شعار AWJ" className="h-12 w-12 rounded-full border border-gray-200 ml-3" />
                            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center">
                                نظام إدارة مخزن AWJ
                            </h1>
                        </div>
                        <div className="flex flex-wrap justify-center md:space-x-4 space-x-2">
                            <button onClick={() => setCurrentPage('products')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'products' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                <Package className="inline-block h-5 w-5 ml-2" />
                                <span className="hidden sm:inline">إدارة المنتجات</span>
                            </button>
                            <button onClick={() => setCurrentPage('events')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'events' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                <CalendarDays className="inline-block h-5 w-5 ml-2" />
                                <span className="hidden sm:inline">إدارة الأحداث (جدول)</span>
                            </button>
                            <button onClick={() => setCurrentPage('activeEvents')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'activeEvents' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                <Hourglass className="inline-block h-5 w-5 ml-2" />
                                <span className="hidden sm:inline">أحداث جارية</span>
                            </button>
                            <button onClick={() => setCurrentPage('completedEvents')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'completedEvents' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                <CheckCircle className="inline-block h-5 w-5 ml-2" />
                                <span className="hidden sm:inline">أحداث منتهية</span>
                            </button>
                            <button onClick={() => setCurrentPage('outgoing')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'outgoing' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                <Truck className="inline-block h-5 w-5 ml-2" />
                                <span className="hidden sm:inline">المنتجات الصادرة</span>
                            </button>
                            {currentUser?.role === 'admin' && ( // Show public links button only for admins
                                <button onClick={() => setCurrentPage('publicLinks')} className={`nav-link px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ease-in-out shadow-md ${currentPage === 'publicLinks' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'} mb-2 md:mb-0`}>
                                    <Link className="inline-block h-5 w-5 ml-2" />
                                    <span className="hidden sm:inline">روابط الأحداث العامة</span>
                                </button>
                            )}
                        </div>
                        {isLoggedIn && currentUser && (
                            <div className="text-center md:text-left text-sm text-gray-600 mt-4 md:mt-0">
                                مرحباً، <span className="font-semibold text-blue-700">{currentUser.name || currentUser.username}</span> (<span className="text-gray-500">{currentUser.role}</span>)
                                <button onClick={handleLogout} className="ml-4 text-red-500 hover:underline">
                                    <LogOut className="inline-block h-4 w-4 ml-1" /> تسجيل الخروج
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            )}

            <main className="pb-8">
                {renderContent()}
            </main>

            <MessageModal
                show={showMessage}
                title={messageContent.title}
                text={messageContent.text}
                type={messageContent.type}
                onClose={() => setShowMessage(false)}
            />

            <ConfirmModal
                show={showConfirm}
                text={confirmText}
                onConfirm={() => { confirmCallback(); setShowConfirm(false); }}
                onCancel={() => setShowConfirm(false)}
            />

            {showLoginModal && (
                <LoginModal
                    show={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleUserLoginSuccess}
                    displayMessage={displayMessage}
                />
            )}

            <ProductFormModal
                show={showProductModal}
                onClose={handleCloseProductModal}
                onSubmit={handleProductFormSubmit}
                product={editingProduct}
                name={productFormName} setName={setProductFormName}
                quantity={productFormQuantity} setQuantity={setProductFormQuantity}
                description={productFormDescription} setDescription={setProductFormDescription}
                imageUrl={productFormImageUrl} setImageUrl={setProductFormImageUrl}
            />

            <EventFormModal
                show={showEventModal}
                onClose={handleCloseEventModal}
                onSubmit={handleEventFormSubmit}
                event={editingEvent}
                name={eventFormName} setName={setEventFormName}
                date={eventFormDate} setDate={setEventFormDate}
                description={eventFormDescription} setDescription={setEventFormDescription}
                isCompleted={eventFormIsCompleted} setIsCompleted={setEventFormIsCompleted}
            />

            <IssueProductFormModal
                show={showIssueProductModal}
                onClose={handleCloseIssueProductModal}
                onSubmit={handleIssueProductFormSubmit}
                products={products}
                events={events}
                issueEventSelect={issueEventSelect} setIssueEventSelect={setIssueEventSelect}
                issueProductSearch={issueProductSearch} setIssueProductSearch={setIssueProductSearch}
                issueProductSelect={issueProductSelect} setIssueProductSelect={setIssueProductSelect}
                issueQuantity={issueQuantity} setIssueQuantity={setIssueQuantity}
                issueAvailableQuantity={issueAvailableQuantity} setIssueAvailableQuantity={setIssueAvailableQuantity}
            />

            <EditOutgoingProductModal
                show={showEditOutgoingProductModal}
                onClose={handleCloseEditOutgoingProductModal}
                onSubmit={handleEditOutgoingProductFormSubmit}
                item={editingOutgoingItem}
                products={products}
                editOutgoingQuantity={editOutgoingQuantity} setEditOutgoingQuantity={setEditOutgoingQuantity}
                editOutgoingCurrentStock={editOutgoingCurrentStock}
            />

            <OutgoingProductDetailsModal
                show={showOutgoingProductDetailsModal}
                onClose={handleCloseOutgoingProductDetailsModal}
                item={viewingOutgoingItem}
                products={products}
            />
            <CreatePublicLinkModal
                show={showCreatePublicLinkModal}
                onClose={() => setShowCreatePublicLinkModal(false)}
                onSubmit={handleCreatePublicLinkSubmit}
                eventName={eventToCreatePublicLink?.name || ''}
                generatedLinkData={generatedLinkData}
                setGeneratedLinkData={setGeneratedLinkData}
                displayMessage={displayMessage}
            />
            <EventDetailsModal
                show={showEventDetailsModal}
                onClose={handleCloseEventDetailsModal}
                event={viewingEvent}
                outgoingItems={outgoingItems}
                products={products}
                isAdmin={currentUser?.role === 'admin'}
                onGeneratePublicLink={handleGeneratePublicLink}
                displayMessage={displayMessage}
            />

            <Footer />
        </div>
    );
}

export default App;
