// import React from 'react';
// import { useTheme } from '../../context/ThemeContext';
// import Footer from '../layout/Footer/Footer';

// const AuthLayout = ({ children }) => {
//   const { isDark } = useTheme();
  
//   return (
//     <div className={`min-h-screen flex flex-col
//       ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
//     >
//       {/* Fixed Background */}
//       <div className={`fixed inset-0 transition-colors duration-200
//         ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} 
//       />

//       {/* Main Content */}
//       <div className="relative flex-grow flex flex-col z-10">
//         {children}
//       </div>

//       {/* Footer */}
//       {/* <div className="relative z-10">
//         <Footer />
//       </div> */}
//     </div>
//   );
// };

// export default AuthLayout;