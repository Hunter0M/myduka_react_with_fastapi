const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-100">
    <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
    <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

export default AuthLayout; 