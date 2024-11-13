// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// function Categories() {
//   const [categories, setCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchCategories();
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`/api/categories?search=${searchTerm}`);
//       setCategories(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('خطأ في جلب الفئات:', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* عنوان الصفحة */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">فئات المنتجات</h1>
//         <p className="mt-2 text-sm text-gray-600">
//           اكتش�� مجموعتنا المتنوعة من الفئات والمنتجات
//         </p>
//       </div>

//       {/* شريط البحث */}
//       <div className="mb-8">
//         <div className="relative max-w-xl">
//           <input
//             type="text"
//             placeholder="ابحث عن الفئات..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//           />
//           <MagnifyingGlassIcon 
//             className="h-6 w-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2"
//           />
//         </div>
//       </div>

//       {/* عرض الفئات */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {categories.map((category) => (
//           <div
//             key={category.id}
//             className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-xl"
//           >
//             {/* رأس الفئة */}
//             <div className="p-6 border-b border-gray-100">
//               <div className="flex items-center space-x-4 rtl:space-x-reverse">
//                 {category.icon && (
//                   <div className="shrink-0">
//                     <img
//                       src={category.icon}
//                       alt={category.name}
//                       className="w-16 h-16 object-cover rounded-lg shadow-sm"
//                     />
//                   </div>
//                 )}
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
//                   <p className="text-sm text-gray-600">
//                     {category.product_count} منتج
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* وصف الفئة */}
//             {category.description && (
//               <div className="p-6 bg-gray-50">
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   {category.description}
//                 </p>
//               </div>
//             )}

//             {/* المنتجات الشائعة */}
//             {category.popular_products?.length > 0 && (
//               <div className="p-6">
//                 <h4 className="font-semibold text-gray-900 mb-4">
//                   المنتجات الأكثر مبيعاً
//                 </h4>
//                 <div className="grid grid-cols-3 gap-3">
//                   {category.popular_products.map((product) => (
//                     <div 
//                       key={product.id} 
//                       className="group relative"
//                     >
//                       <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
//                         <img
//                           src={product.image}
//                           alt={product.product_name}
//                           className="h-full w-full object-cover object-center group-hover:opacity-75 transition duration-300"
//                         />
//                       </div>
//                       <div className="mt-2">
//                         <p className="text-sm text-gray-700 truncate">
//                           {product.product_name}
//                         </p>
//                         <p className="text-sm font-medium text-blue-600">
//                           ${product.selling_price}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* زر عرض المنتجات */}
//             <div className="p-6 bg-gray-50 border-t border-gray-100">
//               <Link
//                 to={`/products?category=${category.id}`}
//                 className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               >
//                 عرض المنتجات
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* رسالة التحميل */}
//       {loading && (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
//         </div>
//       )}

//       {/* رسالة عند عدم وجود نتائج */}
//       {!loading && categories.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">
//             لم يتم العثور على فئات مطابقة للبحث
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Categories;