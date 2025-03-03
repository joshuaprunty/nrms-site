export function HeroSection({ children, backgroundColor, className = '' }) {
  return (
    <section 
      className={`w-full ${className}`}
      style={{ backgroundColor }}
    >
      <div className="mx-auto">
        {children}
      </div>
    </section>
  );
}