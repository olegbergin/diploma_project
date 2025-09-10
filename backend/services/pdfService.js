const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

/**
 * PDF Service - Handles PDF generation from HTML templates
 */

class PDFService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/reports');
  }

  /**
   * Generate PDF from HTML template and data
   * @param {string} templateName - Name of the template file
   * @param {Object} data - Data to populate the template
   * @returns {Buffer} PDF buffer
   */
  async generatePDF(templateName, data) {
    let browser;
    
    try {
      // Read and populate template
      const html = await this.populateTemplate(templateName, data);
      
      // Launch puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set content and wait for any async operations
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Read template file and populate with data
   * @param {string} templateName - Template filename
   * @param {Object} data - Data to populate
   * @returns {string} Populated HTML
   */
  async populateTemplate(templateName, data) {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Simple template replacement (could be enhanced with a proper template engine)
      template = this.replaceTemplatePlaceholders(template, data);
      
      return template;
    } catch (error) {
      console.error('Error reading template:', error);
      throw new Error(`Template reading failed: ${error.message}`);
    }
  }

  /**
   * Replace template placeholders with actual data
   * @param {string} template - HTML template string
   * @param {Object} data - Data object
   * @returns {string} Populated template
   */
  replaceTemplatePlaceholders(template, data) {
    // Replace simple placeholders like {{businessName}}
    template = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.getNestedValue(data, key) || match;
    });

    // Replace nested placeholders like {{business.name}}
    template = template.replace(/\{\{(\w+\.\w+)\}\}/g, (match, path) => {
      return this.getNestedValue(data, path) || match;
    });

    // Replace loops for arrays (simple implementation)
    template = this.replaceArrayLoops(template, data);

    return template;
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {*} Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Replace array loops in template
   * @param {string} template - HTML template
   * @param {Object} data - Data object
   * @returns {string} Template with replaced loops
   */
  replaceArrayLoops(template, data) {
    // Replace {{#each arrayName}} ... {{/each}} blocks
    const loopRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(loopRegex, (match, arrayName, loopContent) => {
      const array = this.getNestedValue(data, arrayName);
      
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map(item => {
        let itemContent = loopContent;
        
        // Replace {{this.property}} with item values
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (itemMatch, property) => {
          return item[property] || '';
        });
        
        // Replace {{@index}} with array index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, array.indexOf(item));
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount || 0);
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    if (!date) return '';
    
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  /**
   * Format percentage for display
   * @param {number} value - Value to format as percentage
   * @returns {string} Formatted percentage
   */
  formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return `${parseFloat(value).toFixed(1)}%`;
  }

  /**
   * Generate chart data URL for embedding in PDF
   * @param {Object} chartConfig - Chart configuration
   * @returns {string} Data URL for chart image
   */
  async generateChartDataURL(chartConfig) {
    // This is a placeholder for chart generation
    // In a real implementation, you might use Chart.js with node-canvas
    // or generate charts server-side and return data URLs
    
    // For now, return a placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  /**
   * Get PDF filename based on report type and date
   * @param {Object} reportData - Report data
   * @returns {string} Filename
   */
  getReportFilename(reportData) {
    const businessName = reportData.business.name.replace(/[^a-zA-Z0-9]/g, '_');
    const reportType = reportData.reportType;
    
    let dateStr = '';
    if (reportType === 'daily') {
      dateStr = reportData.reportDate;
    } else if (reportType === 'monthly') {
      dateStr = reportData.reportMonth;
    } else if (reportType === 'yearly') {
      dateStr = reportData.reportYear;
    }
    
    return `${businessName}_${reportType}_report_${dateStr}.pdf`;
  }
}

module.exports = new PDFService();