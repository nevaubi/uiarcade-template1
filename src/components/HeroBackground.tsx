const HeroBackground = () => (
    <>
      {/* Dark Background Layer */}
      <div className="header-bg"></div>
      
      {/* Metallic Overlay */}
      <div className="metallic-overlay"></div>
      
      {/* Grid Overlay */}
      <div className="grid-overlay"></div>
      
      {/* Fade Effect Overlay */}
      <div className="fade-overlay"></div>

      {/* SVG Wave Shape */}
      <div className="wave-svg-container">
          <svg className="wave-svg" viewBox="0 0 1440 116" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,58.3333 C240,107.667 480,107.667 720,58.3333 C960,9.0000 1200,9.0000 1440,58.3333 L1440,116 L0,116 L0,58.3333 Z" className="fill-white dark:fill-navy-900"></path>
          </svg>
      </div>
    </>
  );

  export default HeroBackground; 
