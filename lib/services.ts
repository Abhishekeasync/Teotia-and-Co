type Service = {
  slug: string;
  title: string;
  tagline: string;
  duration: string;
  price: string;
  priceLabel: string;
  shortDescription: string;
  features: string[];
  description: string[];
  highlights: string[];
};

export const services: Service[] = [
  {
    slug: 'tax-planning-filing',
    title: 'Tax Planning & Filing',
    tagline: 'Smart Strategies for Maximum Savings & Full Compliance',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Strategic tax planning to minimize liabilities and maximize savings.',
    features: ['Accurate Tax Filing', 'Maximize Savings', 'Compliant & Stress-Free'],
    description: [
      'Our Tax Planning & Filing services are designed to help individuals, professionals, and businesses effectively manage their tax obligations while optimizing savings. We follow a proactive, year-round tax planning approach that allows us to identify potential deductions, credits, and strategic opportunities before tax deadlines arrive.',
      'By closely reviewing your income structure, expenses, and long-term financial goals, we develop customized tax strategies that reduce liabilities while ensuring full compliance with applicable laws and regulations. Our team stays up to date with changing tax rules to protect you from penalties, audits, and unnecessary stress.',
    ],
    highlights: [
      'Year-Round Strategic Tax Planning',
      'Accurate Individual & Business Tax Preparation',
      'Optimization of Deductions & Credits',
      'Full Compliance with Tax Laws',
      'Timely, Stress-Free Tax Filing',
    ],
  },
  {
    slug: 'business-accounting',
    title: 'Business Accounting',
    tagline: 'Clear Financial Records That Drive Better Decisions',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Accurate accounting to manage records, control costs, and support business growth.',
    features: [
      'Financial Record Management',
      'Cost Control & Reporting',
      'Growth-Focused Insights',
    ],
    description: [
      'Our Business Accounting services provide a strong financial foundation that supports daily operations and long-term growth. We manage financial transactions, maintain organized records, and ensure your books accurately reflect your business performance at all times.',
      'With consistent reporting and detailed financial analysis, we help you monitor cash flow, manage expenses, and evaluate profitability. Whether you are a startup, SME, or established company, our accounting solutions are tailored to your business size and industry needs.',
    ],
    highlights: [
      'Daily Bookkeeping & Transaction Management',
      'Expense Tracking & Cost Control',
      'Monthly, Quarterly & Annual Financial Reports',
      'Cash Flow Monitoring & Analysis',
      'Scalable Accounting Solutions for Growth',
    ],
  },
  {
    slug: 'payroll-management',
    title: 'Payroll Management',
    tagline: 'Accurate Payroll Processing Without Delays or Compliance Risk',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Accurate and timely payroll processing to ensure compliance, efficiency, and employee satisfaction.',
    features: [
      'On-Time Payroll Processing',
      'Tax & Compliance Ready',
      'Error-Free Payroll Management',
    ],
    description: [
      'Our Payroll Management services are designed to eliminate payroll errors, delays, and compliance risks. We handle the entire payroll process, from calculating salaries and deductions to managing benefits and filing payroll taxes.',
      'By outsourcing payroll to our experienced team, you reduce administrative burden and ensure your employees are paid accurately and on time. We also ensure full compliance with labor laws and tax regulations, helping you avoid penalties while maintaining employee trust and satisfaction.',
    ],
    highlights: [
      'End-to-End Payroll Processing',
      'Salary, Deductions & Benefits Management',
      'Payroll Tax Calculation & Filing',
      'Compliance with Labor & Tax Regulations',
      'Secure & Error-Free Payroll Systems',
    ],
  },
  {
    slug: 'audit-assurance',
    title: 'Audit & Assurance',
    tagline: 'Trusted Reviews That Strengthen Transparency & Confidence',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Independent audit services to ensure accuracy, compliance, and financial transparency.',
    features: [
      'Financial Accuracy Review',
      'Compliance & Risk Assessment',
      'Trusted Assurance Reports',
    ],
    description: [
      'Our Audit & Assurance services provide independent, objective evaluations of your financial records to ensure accuracy, transparency, and compliance. We conduct thorough audits that assess financial statements, internal controls, and regulatory requirements.',
      'Through detailed analysis and professional reporting, we help identify risks, improve governance, and strengthen internal processes. Our assurance services build credibility with stakeholders, investors, regulators, and financial institutions.',
    ],
    highlights: [
      'Financial Statement Audits',
      'Compliance & Regulatory Reviews',
      'Risk Assessment & Internal Control Evaluation',
      'Clear, Transparent Audit Reports',
      'Increased Stakeholder Confidence',
    ],
  },
  {
    slug: 'financial-advisory',
    title: 'Financial Advisory',
    tagline: 'Strategic Guidance for Smarter Financial Growth',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Expert guidance to optimize financial strategy, improve decision-making, and drive sustainable growth.',
    features: [
      'Strategic Financial Planning',
      'Business & Investment Insights',
      'Risk Management Support',
    ],
    description: [
      'Our Financial Advisory services help businesses and individuals make informed, data-driven financial decisions. We analyze financial performance, cash flow trends, and future projections to identify opportunities for growth and improvement.',
      'From budgeting and forecasting to investment planning and expansion strategies, our advisory services are tailored to your specific goals. We help you manage risk, improve profitability, and plan confidently for the future.',
    ],
    highlights: [
      'Strategic Financial Planning & Forecasting',
      'Cash Flow & Budget Management',
      'Investment & Expansion Advisory',
      'Financial Performance Analysis',
      'Risk Identification & Mitigation',
    ],
  },
  {
    slug: 'management-consulting',
    title: 'Management Consulting',
    tagline: 'Practical Solutions to Improve Performance & Efficiency',
    duration: '1 hr',
    price: '₹100',
    priceLabel: '100 Indian rupees',
    shortDescription:
      'Tailored consulting to enhance operations, improve efficiency, and achieve business objectives.',
    features: [
      'Process Improvement',
      'Operational Efficiency',
      'Performance Optimization',
    ],
    description: [
      'Our Management Consulting services focus on improving operational efficiency and financial performance across your organization. We work closely with leadership teams to evaluate existing processes, identify inefficiencies, and implement practical, results-driven solutions.',
      'By aligning strategy, operations, and financial management, we help businesses optimize resources, enhance productivity, and achieve long-term objectives. Our consulting services are customized, actionable, and focused on measurable outcomes.',
    ],
    highlights: [
      'Business Process Evaluation & Improvement',
      'Operational & Financial Efficiency Enhancement',
      'Performance Measurement & Optimization',
      'Customized Business & Growth Strategies',
      'Ongoing Strategic Advisory Support',
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}
