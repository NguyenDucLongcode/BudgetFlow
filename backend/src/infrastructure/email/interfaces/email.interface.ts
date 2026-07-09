// Interface for email options
export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

// Interface for email attachments
export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  cid?: string;
}

// Interface for email template context
export interface EmailTemplateContext {
  name?: string;
  email?: string;
  link?: string;
  code?: string;
  company?: string;
  year?: number;
  [key: string]: any;
}
