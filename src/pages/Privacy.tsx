
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This is placeholder content for the privacy policy. We collect information you provide directly to us, 
              such as when you create an account, make a purchase, or contact us for support.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              We may also automatically collect certain information about your device and usage of our service.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, 
              and communicate with you.
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process payments and transactions</li>
              <li>To send you technical notices and support messages</li>
              <li>To respond to your comments and questions</li>
            </ul>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Information Sharing</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this privacy policy or as required by law.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Data Security</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@template1.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
