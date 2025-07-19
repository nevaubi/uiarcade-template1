import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Eye, Code, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EmailTemplateViewerProps {
  htmlContent: string;
  onHtmlChange: (html: string) => void;
  disabled?: boolean;
  loading?: boolean;
  isDirty?: boolean;
  onSave?: () => void;
  saveLoading?: boolean;
}

interface PreviewMode {
  width: string;
  height: string;
  label: string;
  icon: React.ReactNode;
  containerWidth: string;
}

const EmailTemplateViewer: React.FC<EmailTemplateViewerProps> = ({
  htmlContent,
  onHtmlChange,
  disabled = false,
  loading = false,
  isDirty = false,
  onSave,
  saveLoading = false
}) => {
  const [activeView, setActiveView] = useState<'split' | 'code' | 'preview'>('split');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const previewModes: Record<string, PreviewMode> = {
    desktop: {
      width: '600px',
      height: '500px',
      containerWidth: '100%',
      label: 'Desktop',
      icon: <Monitor className="h-4 w-4" />
    },
    mobile: {
      width: '420px',
      height: '600px',
      containerWidth: '420px',
      label: 'Mobile',
      icon: <Smartphone className="h-4 w-4" />
    }
  };

  // Sample data for variable substitution in preview
  const sampleData = {
    '[USER_EMAIL]': 'john.doe@example.com',
    '[USER_NAME]': 'John Doe',
    '[DASHBOARD_URL]': 'https://yourapp.com/dashboard',
    '[PLATFORM_NAME]': 'Your Platform',
    '[DATE]': new Date().toLocaleDateString(),
    '[COMPANY_NAME]': 'Your Company'
  };

  // More robust template variable replacement
  const replaceTemplateVariables = (content: string): string => {
    let processed = content;
    
    // Replace each variable with proper escaping
    Object.entries(sampleData).forEach(([variable, value]) => {
      // Simple string replacement approach that's more reliable
      processed = processed.split(variable).join(value);
    });
    
    return processed;
  };

  // Enhanced HTML sanitization for email content
  const sanitizeEmailHtml = (html: string): string => {
    try {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'strong', 'b', 'em', 'i', 'u', 'a', 'img', 'br', 'hr',
          'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'center', 'font', 'small', 'sub', 'sup', 'strike', 's',
          'style', 'title', 'meta', 'link'
        ],
        ALLOWED_ATTR: [
          'style', 'class', 'id', 'href', 'src', 'alt', 'title',
          'width', 'height', 'border', 'cellpadding', 'cellspacing',
          'align', 'valign', 'bgcolor', 'color', 'face', 'size',
          'target', 'rel', 'role', 'aria-label', 'aria-describedby',
          'dir', 'lang', 'colspan', 'rowspan', 'type', 'name', 'content'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_TAGS: ['style', 'meta', 'link'],
        ADD_ATTR: ['target', 'bgcolor', 'cellpadding', 'cellspacing'],
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'iframe'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup'],
        KEEP_CONTENT: true
      });
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      return html; // Return original if sanitization fails
    }
  };

  // Generate complete email-compatible HTML document
  const generateEmailDocument = (content: string): string => {
    try {
      const processedContent = replaceTemplateVariables(content);
      const sanitizedContent = sanitizeEmailHtml(processedContent);
      
      return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <meta name="format-detection" content="date=no">
  <meta name="format-detection" content="address=no">
  <meta name="format-detection" content="email=no">
  <title>Email Preview</title>
  <style type="text/css">
    /* Email client CSS reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #333333;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Outlook specific styles */
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }
    
    /* Apple Mail specific styles */
    .appleBody a { color: inherit; text-decoration: none; }
    .appleFooter a { color: inherit; text-decoration: none; }
    
    /* Gmail specific styles */
    u + .body .gmail-blend-screen { background: #000; mix-blend-mode: screen; }
    u + .body .gmail-blend-difference { background: #000; mix-blend-mode: difference; }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container { 
        width: 100% !important; 
        max-width: 100% !important;
        margin: 0 !important;
      }
      .mobile-center { text-align: center !important; }
      .mobile-full-width { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-hide { display: none !important; }
      .mobile-show { display: block !important; }
      
      /* Ensure tables and content scale properly */
      table { width: 100% !important; }
      td { padding: 10px !important; }
      
      /* Font size adjustments */
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
      p { font-size: 16px !important; }
      
      /* Button responsiveness */
      a[style*="display: inline-block"] {
        display: block !important;
        width: auto !important;
        max-width: 280px !important;
        margin: 0 auto !important;
      }
      
      /* Image responsiveness */
      img { 
        max-width: 100% !important; 
        height: auto !important; 
      }
    }
    
    /* Additional mobile-specific styles for smaller screens */
    @media only screen and (max-width: 480px) {
      .email-container { 
        width: 100% !important; 
        max-width: 100% !important;
        margin: 0 !important;
      }
      
      body { 
        font-size: 14px !important; 
        line-height: 1.5 !important; 
      }
      
      div[style*="padding"] { 
        padding: 15px !important; 
      }
      
      h1 { font-size: 22px !important; }
      h2 { font-size: 18px !important; }
      p { font-size: 14px !important; }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg { background-color: #2d2d2d !important; }
      .dark-mode-text { color: #ffffff !important; }
    }
  </style>
</head>
<body class="body">
  <div class="email-container">
    ${sanitizedContent}
  </div>
</body>
</html>`;
    } catch (error) {
      console.error('Error generating email document:', error);
      return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Email Preview Error</title>
</head>
<body>
  <div style="padding: 40px; color: #dc2626; font-family: Arial, sans-serif;">
    <h3>Error processing email template</h3>
    <p>Please check your HTML syntax and try again.</p>
    <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
  </div>
</body>
</html>`;
    }
  };

  // Process HTML for preview
  const processedHtml = useMemo(() => {
    try {
      setPreviewError(null);
      
      if (!htmlContent.trim()) {
        return generateEmailDocument('<div style="padding: 40px; text-align: center; color: #666; font-family: Arial, sans-serif;"><h3>Start typing HTML to see preview...</h3><p>Use the "Load Sample" button to get started with a professional template.</p></div>');
      }

      return generateEmailDocument(htmlContent);
    } catch (error) {
      console.error('Error processing HTML:', error);
      setPreviewError('Error processing HTML content');
      return generateEmailDocument('<div style="padding: 40px; color: #dc2626; font-family: Arial, sans-serif;"><h3>Error processing HTML content</h3><p>Please check your HTML syntax and try again.</p></div>');
    }
  }, [htmlContent, refreshKey]);

  // Force refresh preview
  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onHtmlChange(e.target.value);
  };

  const loadSampleTemplate = () => {
    const sampleTemplate = `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to [PLATFORM_NAME]!</h1>
  </div>
  <div style="padding: 40px 20px; background: #ffffff;">
    <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Hi [USER_NAME],</h2>
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
      Thanks for joining us! We're excited to have you on board. Your account has been successfully created and you can now access all the features of our platform.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="[DASHBOARD_URL]" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
        Get Started
      </a>
    </div>
    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p style="color: #999; font-size: 14px; margin: 0;">
        If you have any questions, feel free to contact our support team.<br>
        Email: [USER_EMAIL] | Date: [DATE]
      </p>
    </div>
  </div>
</div>`;
    onHtmlChange(sampleTemplate);
  };

  const renderCodeEditor = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="text-sm font-medium">HTML Editor</span>
          {isDirty && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <Button
              variant={isDirty ? "default" : "outline"}
              size="sm"
              onClick={onSave}
              disabled={disabled || loading || saveLoading || !isDirty}
              className="text-xs"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleTemplate}
            disabled={disabled || loading}
            className="text-xs"
          >
            Load Sample
          </Button>
          <Badge variant="outline" className="text-xs">
            {htmlContent.length} chars
          </Badge>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>
      <Textarea
        value={htmlContent}
        onChange={handleHtmlChange}
        disabled={disabled || loading}
        className="font-mono text-sm resize-none h-[500px] border-2"
        placeholder="Enter your HTML email template here..."
      />
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Available template variables:</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {Object.keys(sampleData).map((variable) => (
            <code key={variable} className="bg-muted px-1 py-0.5 rounded text-xs">
              {variable}
            </code>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPreview}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <div className="flex rounded-md border">
            {Object.entries(previewModes).map(([key, mode]) => (
              <Button
                key={key}
                variant={previewMode === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode(key as 'desktop' | 'mobile')}
                className="h-8 px-2"
              >
                {mode.icon}
                <span className="ml-1 hidden sm:inline">{mode.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {previewError && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{previewError}</span>
        </div>
      )}

      <div 
        className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 bg-gray-50"
        style={{ height: `calc(${previewModes[previewMode].height} + 32px)` }}
      >
        <div 
          className="mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg"
          style={{ 
            width: previewModes[previewMode].containerWidth,
            maxWidth: '100%',
            minHeight: '400px'
          }}
        >
          <iframe
            key={refreshKey}
            title="Email Preview"
            srcDoc={processedHtml}
            className="w-full border-none"
            style={{ 
              height: previewModes[previewMode].height,
              minHeight: '400px'
            }}
            sandbox="allow-same-origin allow-popups"
          />
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Preview simulates email client rendering with sample data. Actual emails may vary slightly between clients.</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Email Template Editor
            {isDirty && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                Unsaved Changes
              </Badge>
            )}
          </CardTitle>
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="split" className="text-xs">Split</TabsTrigger>
              <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>{renderCodeEditor()}</div>
            <div>{renderPreview()}</div>
          </div>
        ) : activeView === 'code' ? (
          renderCodeEditor()
        ) : (
          renderPreview()
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTemplateViewer; 
