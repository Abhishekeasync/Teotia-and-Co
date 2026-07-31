export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  tags?: string[]; // Optional tags from API
};

const AUTHOR_AVATAR =
  '/assets/images/static.wixstatic.com/d8ab7d3a-12ec-4da4-96ad-a9761e57c1f0_edited-4fa8dd2ff7.png';

const IMAGES = {
  tax: '/assets/images/static.wixstatic.com/f8f680_0d3b57440fde42828ee05d7e474904eb-mv2-2ab6988627.png',
  books: '/assets/images/static.wixstatic.com/f8f680_717b7c9d22584804b678db100ac76db4-mv2-0315d2c5dc.png',
  accounting: '/assets/images/static.wixstatic.com/f8f680_80e716d7d98d4c38a679e29575a85f9c-mv2-04d5987dfa.png',
  payroll: '/assets/images/static.wixstatic.com/bb903024e9384ce683f9815b2a7cc503.jpg',
  finance: '/assets/images/static.wixstatic.com/ef9ce3e48be340a4b91f0c3e1644aa5b.jpg',
  planning: '/assets/images/static.wixstatic.com/f8f680_5dd961864da04fb2b40c73ba6fe42c65-mv2.jpg',
} as const;

function post(
  title: string,
  slug: string,
  category: string,
  excerpt: string,
  body: string,
  image: string,
  date: string,
  readTime: string,
  author = 'Kunal Teotia'
): BlogPost {
  return {
    title,
    slug,
    category,
    excerpt,
    content: [excerpt, body],
    image,
    author,
    authorAvatar: AUTHOR_AVATAR,
    date,
    readTime,
  };
}

export const blogPosts: BlogPost[] = [
  post(
    '5 Key Tax Strategies for Small Businesses',
    '5-key-tax-strategies-for-small-businesses',
    'Taxation',
    'Taxes can be one of the most stressful and complex aspects of running a small business, but with careful planning and the right strategies, you can reduce liabilities and maximize savings.',
    'We explore deductions, credits, and timing strategies that keep you compliant while freeing capital to reinvest in growth.',
    IMAGES.tax,
    'Jan 31',
    '4 min read'
  ),
  post(
    'How Bookkeeping Improves Cash Flow',
    'how-bookkeeping-improves-cash-flow',
    'Bookkeeping',
    'Accurate bookkeeping is the cornerstone of a financially healthy business. Beyond recording transactions, it gives you insight into cash flow and helps you anticipate challenges before they become critical.',
    'Up-to-date books improve visibility into receivables, payables, and seasonal patterns so you can make smarter spending decisions.',
    IMAGES.books,
    'Jan 28',
    '3 min read'
  ),
  post(
    'Choosing the Right Accounting Firm',
    'choosing-the-right-accounting-firm',
    'Accounting',
    'Choosing the right accounting firm can have a profound impact on your business’s financial health and long-term success.',
    'Evaluate industry expertise, service breadth, communication, and technology so your advisor grows alongside your company.',
    IMAGES.accounting,
    'Jan 24',
    '5 min read'
  ),
  post(
    'Top Payroll Management Tips for Growing Businesses',
    'top-payroll-management-tips-for-growing-businesses',
    'Payroll',
    'Managing payroll becomes increasingly complex as your business expands, but efficient processes are essential for compliance and employee satisfaction.',
    'Automate calculations, stay current on withholdings, and document policies to scale payroll without bottlenecks.',
    IMAGES.payroll,
    'Jan 20',
    '4 min read'
  ),
  post(
    'Understanding Financial Statements: A Guide for Small Business Owners',
    'understanding-financial-statements',
    'Finance',
    'Financial statements are critical tools for understanding business health, yet many owners struggle to interpret them effectively.',
    'Learn what balance sheets, income statements, and cash flow statements reveal—and which ratios matter most.',
    IMAGES.finance,
    'Jan 15',
    '6 min read'
  ),
  post(
    'How Strategic Financial Planning Drives Business Growth',
    'how-strategic-financial-planning-drives-business-growth',
    'Planning',
    'Strategic financial planning is the foundation for long-term growth, helping you allocate resources, manage risk, and invest with confidence.',
    'Align budgets and forecasts with operational goals to measure progress and prepare for uncertainty.',
    IMAGES.planning,
    'Jan 10',
    '5 min read'
  ),
  post(
    'GST Compliance Checklist for Growing Businesses',
    'gst-compliance-checklist-for-growing-businesses',
    'GST',
    'Staying GST-compliant protects your cash flow and reputation. This checklist covers registration, invoicing, returns, and reconciliation essentials.',
    'Use a monthly review rhythm to catch mismatches early and avoid interest on delayed filings.',
    IMAGES.tax,
    'Feb 02',
    '4 min read'
  ),
  post(
    'Year-End Tax Planning Moves for Business Owners',
    'year-end-tax-planning-moves-for-business-owners',
    'Taxation',
    'The final quarter is your best window to reduce taxable income legally through timing, investments, and documentation.',
    'Coordinate with your CA on advance tax, depreciation, and eligible deductions before books close.',
    IMAGES.planning,
    'Feb 05',
    '5 min read'
  ),
  post(
    'How to Prepare for a Tax Audit with Confidence',
    'how-to-prepare-for-a-tax-audit-with-confidence',
    'Compliance',
    'An audit notice does not have to disrupt operations if records, reconciliations, and supporting documents are organized.',
    'Maintain a clear trail from invoices to bank entries and respond promptly with structured submissions.',
    IMAGES.accounting,
    'Feb 08',
    '6 min read'
  ),
  post(
    'Understanding TDS Obligations for SMEs',
    'understanding-tds-obligations-for-smes',
    'Taxation',
    'TDS rules apply across vendor payments, salaries, and professional fees. Missing deadlines creates avoidable liability.',
    'Map payment types to applicable sections and automate reminders for deposit and return due dates.',
    IMAGES.tax,
    'Feb 11',
    '4 min read'
  ),
  post(
    'Cash Flow Forecasting Basics Every Founder Should Know',
    'cash-flow-forecasting-basics-for-founders',
    'Finance',
    'Forecasting translates historical data into forward-looking scenarios so you can plan payroll, inventory, and investments.',
    'Start with a 13-week rolling view, then extend to quarterly projections tied to sales assumptions.',
    IMAGES.finance,
    'Feb 14',
    '5 min read'
  ),
  post(
    'When to Register for GST: A Practical Guide',
    'when-to-register-for-gst-practical-guide',
    'GST',
    'Registration thresholds and voluntary enrollment decisions affect input credit, pricing, and customer contracts.',
    'Weigh turnover trends, B2B client expectations, and compliance costs before you register.',
    IMAGES.tax,
    'Feb 17',
    '3 min read'
  ),
  post(
    'Common Bookkeeping Mistakes That Trigger Penalties',
    'common-bookkeeping-mistakes-that-trigger-penalties',
    'Bookkeeping',
    'Small errors in classification, GST treatment, or bank reconciliation compound into filing issues and fines.',
    'Separate personal and business accounts, reconcile monthly, and document adjusting entries clearly.',
    IMAGES.books,
    'Feb 20',
    '4 min read'
  ),
  post(
    'Section 80C and Beyond: Smart Tax Savings for Professionals',
    'section-80c-and-beyond-tax-savings',
    'Taxation',
    'Beyond 80C, professionals can optimize allowances, home loan interest, and retirement contributions within legal limits.',
    'Plan investments early in the year instead of rushing in March to maximize compounding and compliance.',
    IMAGES.planning,
    'Feb 23',
    '5 min read'
  ),
  post(
    'Managing Working Capital During Slow Seasons',
    'managing-working-capital-during-slow-seasons',
    'Finance',
    'Seasonal dips strain liquidity unless you manage receivables, payables, and inventory deliberately.',
    'Negotiate supplier terms, tighten collection follow-ups, and build a minimal cash buffer target.',
    IMAGES.finance,
    'Feb 26',
    '4 min read'
  ),
  post(
    'Digital Invoicing and E-Way Bill Essentials',
    'digital-invoicing-and-e-way-bill-essentials',
    'GST',
    'Digital invoicing standards and e-way bill rules affect how goods move and how audits verify transactions.',
    'Validate GSTIN, HSN codes, and document links on every shipment to prevent transit delays.',
    IMAGES.accounting,
    'Mar 01',
    '4 min read'
  ),
  post(
    'How Internal Controls Protect Small Businesses',
    'how-internal-controls-protect-small-businesses',
    'Accounting',
    'Segregation of duties, approval limits, and periodic reviews reduce fraud risk even in lean teams.',
    'Implement simple checklists for payments and inventory so controls scale as headcount grows.',
    IMAGES.books,
    'Mar 04',
    '5 min read'
  ),
  post(
    'Startup Financial Metrics Investors Expect',
    'startup-financial-metrics-investors-expect',
    'Finance',
    'Investors look beyond revenue at unit economics, burn rate, runway, and gross margin trends.',
    'Present clean monthly management accounts and explain variances against your operating plan.',
    IMAGES.finance,
    'Mar 07',
    '6 min read'
  ),
  post(
    'Choosing Between Cash and Accrual Accounting',
    'cash-vs-accrual-accounting-for-smes',
    'Accounting',
    'Your accounting method affects tax timing, reporting accuracy, and how lenders view performance.',
    'Match the method to business size, industry norms, and statutory requirements with professional advice.',
    IMAGES.accounting,
    'Mar 10',
    '4 min read'
  ),
  post(
    'Employee vs Contractor: Tax and Compliance Implications',
    'employee-vs-contractor-tax-implications',
    'Payroll',
    'Misclassifying workers creates PF, ESI, and TDS exposure. Structure engagements based on control and dependency tests.',
    'Document scope, deliverables, and independence clearly in contracts reviewed by your advisor.',
    IMAGES.payroll,
    'Mar 13',
    '5 min read'
  ),
  post(
    'Importance of Timely ROC and Statutory Filings',
    'timely-roc-and-statutory-filings',
    'Compliance',
    'Delayed annual returns and event-based filings affect director liability and fundraising readiness.',
    'Maintain a compliance calendar aligned to your financial year-end and board meeting schedule.',
    IMAGES.planning,
    'Mar 16',
    '4 min read'
  ),
  post(
    'Budgeting for Business Expansion in 2026',
    'budgeting-for-business-expansion-2026',
    'Planning',
    'Expansion budgets should tie capex, hiring, and marketing to measurable milestones and cash constraints.',
    'Stress-test scenarios for slower sales or higher interest costs before committing to new locations or product lines.',
    IMAGES.planning,
    'Mar 19',
    '5 min read'
  ),
  post(
    'How to Reconcile Bank Statements Efficiently',
    'how-to-reconcile-bank-statements-efficiently',
    'Bookkeeping',
    'Monthly reconciliation catches unauthorized transactions, duplicate entries, and timing differences early.',
    'Use accounting software rules for recurring items and investigate unmatched lines within 48 hours.',
    IMAGES.books,
    'Mar 22',
    '3 min read'
  ),
  post(
    'Indirect Tax Updates Every Retailer Should Track',
    'indirect-tax-updates-for-retailers',
    'GST',
    'Retailers face frequent rate changes, credit rules, and invoice format updates that affect pricing and margins.',
    'Subscribe to official notifications and review product tax codes each quarter with your CA.',
    IMAGES.tax,
    'Mar 25',
    '4 min read'
  ),
  post(
    'Building a Resilient Finance Team on a Budget',
    'building-a-resilient-finance-team-on-a-budget',
    'Advisory',
    'You do not need a large department to run strong finance—combine outsourced expertise with one accountable internal owner.',
    'Define roles for bookkeeping, compliance, and management reporting so nothing falls through the cracks.',
    IMAGES.accounting,
    'Mar 28',
    '5 min read'
  ),
  post(
    'Exit Planning and Business Valuation Fundamentals',
    'exit-planning-and-business-valuation-fundamentals',
    'Advisory',
    'Whether you sell, merge, or succession-plan, normalized earnings and clean compliance history drive valuation.',
    'Begin data room preparation years ahead: audited summaries, contracts, tax positions, and KPI trends.',
    IMAGES.finance,
    'Mar 31',
    '6 min read'
  ),
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRecentPosts(excludeSlug: string, limit = 3): BlogPost[] {
  return blogPosts.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
