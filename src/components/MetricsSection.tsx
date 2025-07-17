import { useEffect } from 'react';

const MetricsSection = () => {
  // Smooth scroll animation hook
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, {
      threshold: 0.1
    });
    const elements = document.querySelectorAll('.metrics-animate');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-navy-900 dark:bg-navy-950 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Stats */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-300 metrics-animate opacity-0 transform translate-y-4">
                METRICS
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4 metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '100ms'}}>
                We believe in developer experience
              </h2>
              <p className="text-lg text-navy-300 max-w-xl metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '200ms'}}>
                Template1 is the ultimate SaaS boilerplate that helps you launch products faster with pre-built components and integrations across all essential platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Metric 1 */}
              <div className="metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '300ms'}}>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  40+
                </p>
                <h3 className="text-xl font-semibold text-navy-200 mt-2">
                  Hours Saved
                </h3>
                <p className="text-navy-400 mt-2">
                  Skip the boilerplate setup and focus on building your unique features
                </p>
              </div>
              
              {/* Metric 2 */}
              <div className="metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '400ms'}}>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  50+
                </p>
                <h3 className="text-xl font-semibold text-navy-200 mt-2">
                  UI Components
                </h3>
                <p className="text-navy-400 mt-2">
                  Beautiful, accessible components ready for your next project
                </p>
              </div>
              
              {/* Metric 3 */}
              <div className="metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '500ms'}}>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  10x
                </p>
                <h3 className="text-xl font-semibold text-navy-200 mt-2">
                  Faster Launch
                </h3>
                <p className="text-navy-400 mt-2">
                  Go from idea to production in days instead of months
                </p>
              </div>
              
              {/* Metric 4 */}
              <div className="metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '600ms'}}>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  ∞
                </p>
                <h3 className="text-xl font-semibold text-navy-200 mt-2">
                  Unlimited Usage
                </h3>
                <p className="text-navy-400 mt-2">
                  Reuse your production ready boilerplate as many times as you'd like
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="relative lg:ml-8 metrics-animate opacity-0 transform translate-y-4" style={{animationDelay: '700ms'}}>
            <div className="relative bg-navy-800 rounded-2xl p-4 shadow-xl overflow-hidden border border-navy-700">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Developer working on code" 
                className="w-full h-auto rounded-xl shadow-md object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection; 
