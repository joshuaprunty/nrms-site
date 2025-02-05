export function Section({ children, backgroundColor, className = '' }) {
  return (
    <section 
      className={`w-full ${className}`}
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}