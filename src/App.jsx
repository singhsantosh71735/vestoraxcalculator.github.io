import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, ShieldCheck, Zap, ChevronRight, Menu, X,
  BarChart3, Calculator, Download, CheckCircle2, ArrowRight,
  PieChart, Target, LineChart, Layers, Sparkles, Lightbulb,
  Activity, Home, Info, ChevronDown, ChevronUp, Search,
  Briefcase, PiggyBank, Percent, Landmark, Receipt, ArrowLeft,
  Lock
} from 'lucide-react';

// --- Shared UI Components ---

const GlassCard = ({ children, className = "", hoverEffect = false, onClick }) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      {...(onClick ? { type: 'button' } : {})}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[#112240]/40 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        ${onClick ? 'block w-full text-left' : ''}
        ${hoverEffect ? 'transition-all duration-300 hover:-translate-y-2 hover:border-[#10B981]/50 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] cursor-pointer group' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

const GradientText = ({ children, className = "" }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-[#10B981] ${className}`}>
    {children}
  </span>
);

const scrollToHub = () => document.getElementById('hub')?.scrollIntoView({ behavior: 'smooth' });

const PrimaryButton = ({ children, icon, className = "", onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      group relative inline-flex items-center justify-center
      px-8 py-3.5 text-sm font-semibold text-white
      transition-all duration-300 ease-in-out
      rounded-full overflow-hidden
      ${disabled ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#10B981] to-teal-500 hover:from-teal-400 hover:to-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105'}
      ${className}
    `}
  >
    <span className="relative z-10 flex items-center gap-2">
      {children}
      {icon && <span className="transition-transform group-hover:translate-x-1">{icon}</span>}
    </span>
  </button>
);

const SecondaryButton = ({ children, className = "", onClick }) => (
  <button onClick={onClick} className={`
    px-8 py-3.5 text-sm font-semibold text-white
    transition-all duration-300 ease-in-out
    rounded-full border border-white/20
    bg-white/5 backdrop-blur-sm
    hover:bg-white/10 hover:border-white/40
    ${className}
  `}>
    {children}
  </button>
);
// --- Financial Math Engine ---

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const calculateWealth = (type, state) => {
  let { amount, rate, years, frequency, monthlyAddition, targetAmount, currentAge, retAge, expenses, initialVal, finalVal, income, existingEmi, newRate, withdrawal, rent, medical, depositType } = state;
  let result = { primary: 0, totalInvested: 0, estimatedReturns: 0, secondary: [], chartType: 'growth', multiplier: 1 };

  switch (type) {
    case 'SIP':
      result.totalInvested = amount * 12 * years;
      let monthlyRate = rate / 100 / 12;
      let months = years * 12;
      result.primary = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      result.estimatedReturns = result.primary - result.totalInvested;
      break;

    case 'Lumpsum':
      result.totalInvested = amount;
      result.primary = amount * Math.pow(1 + rate / 100, years);
      result.estimatedReturns = result.primary - result.totalInvested;
      break;

    case 'Compounding':
      let balance = amount;
      result.totalInvested = amount;
      let periods = frequency * years;
      let ratePerPeriod = (rate / 100) / frequency;
      let additionsPerPeriod = (monthlyAddition * 12) / frequency;
      for(let i = 0; i < periods; i++) {
         balance += additionsPerPeriod;
         balance *= (1 + ratePerPeriod);
         result.totalInvested += additionsPerPeriod;
      }
      result.primary = balance;
      result.estimatedReturns = result.primary - result.totalInvested;
      result.multiplier = result.totalInvested > 0 ? (result.primary / result.totalInvested) : 1;
      break;

    case 'EMI':
      result.chartType = 'donut';
      let r = rate / 12 / 100;
      let n = years * 12; // years is loan tenure here
      if (r > 0) {
        let emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        let totalPayment = emi * n;
        result.primary = emi;
        result.totalInvested = amount; // Used as Principal
        result.estimatedReturns = totalPayment - amount; // Used as Interest
        result.secondary = [{ label: "Total Payment", value: formatCurrency(totalPayment) }];
      }
      break;

    case 'Goal':
      // Calculate required SIP to reach target
      let gMonthlyRate = rate / 100 / 12;
      let gMonths = years * 12;
      let reqSip = targetAmount / ( ((Math.pow(1 + gMonthlyRate, gMonths) - 1) / gMonthlyRate) * (1 + gMonthlyRate) );
      result.primary = reqSip;
      result.totalInvested = reqSip * gMonths;
      result.estimatedReturns = targetAmount - result.totalInvested;
      break;

    case 'Retirement':
      // Simplified retirement math
      let yrsToRet = Math.max(1, retAge - currentAge);
      let inflationRate = 6; // Fixed 6% inflation for simplicity
      let expAtRet = expenses * Math.pow(1 + inflationRate / 100, yrsToRet);
      // 4% Rule: 25x annual expenses at retirement
      let corpusReq = (expAtRet * 12) * 25;
      result.primary = corpusReq;
      result.totalInvested = expAtRet * 12; // Used to show Annual Exp at Ret
      result.estimatedReturns = yrsToRet; // Used to show Years to Ret
      break;

    case 'CAGR':
      let cagr = (Math.pow(finalVal / initialVal, 1 / years) - 1) * 100;
      result.primary = cagr; // Rate
      result.totalInvested = initialVal;
      result.estimatedReturns = finalVal - initialVal;
      break;

    case 'FD':
      if (depositType === 'RD') {
        result.totalInvested = amount * 12 * years;
        let rdRate = rate / 100 / 4; // Quarterly compounding typically for RD
        let rdMonths = years * 12;
        let maturity = 0;
        for (let i=0; i<rdMonths; i++) {
            maturity += amount;
            if ((i+1) % 3 === 0) maturity *= (1 + rdRate); // compound quarterly
        }
        result.primary = maturity;
      } else {
        result.totalInvested = amount;
        result.primary = amount * Math.pow(1 + rate / 100 / 4, years * 4); // Quarterly
      }
      result.estimatedReturns = result.primary - result.totalInvested;
      break;

    case 'Eligibility':
      let safeEmi = Math.max(0, (income * 0.5) - existingEmi);
      let elR = rate / 12 / 100;
      let elN = years * 12;
      let maxLoan = elR > 0 ? (safeEmi * (Math.pow(1 + elR, elN) - 1)) / (elR * Math.pow(1 + elR, elN)) : safeEmi * elN;
      result.primary = maxLoan;
      result.totalInvested = safeEmi;
      result.estimatedReturns = (safeEmi * elN) - maxLoan;
      break;

    case 'Transfer':
      let trR1 = rate / 12 / 100;
      let trR2 = newRate / 12 / 100;
      let trN = years * 12;
      let emi1 = trR1 > 0 ? (amount * trR1 * Math.pow(1 + trR1, trN)) / (Math.pow(1 + trR1, trN) - 1) : amount / trN;
      let emi2 = trR2 > 0 ? (amount * trR2 * Math.pow(1 + trR2, trN)) / (Math.pow(1 + trR2, trN) - 1) : amount / trN;
      let total1 = emi1 * trN;
      let total2 = emi2 * trN;
      result.primary = total1 - total2; // Savings
      result.totalInvested = emi1;      // Old EMI
      result.estimatedReturns = emi2;   // New EMI
      break;

    case 'SWP':
      let swpBalance = amount;
      let swpRate = rate / 12 / 100;
      let swpMonths = years * 12;
      for (let i = 0; i < swpMonths; i++) {
        swpBalance = (swpBalance * (1 + swpRate)) - withdrawal;
      }
      result.primary = Math.max(0, swpBalance);
      result.totalInvested = withdrawal * swpMonths;
      result.estimatedReturns = amount;
      break;

    case 'RentBuy':
      let futurePropVal = amount * Math.pow(1 + rate / 100, years);
      let totalRent = rent * 12 * years;
      result.primary = futurePropVal;
      result.totalInvested = totalRent;
      result.estimatedReturns = futurePropVal - totalRent;
      break;

    case 'Tax':
      let deductions = amount + medical;
      let cappedDeductions = Math.min(deductions, 200000); // 1.5L 80C + 50k 80D max standard
      let taxSaved = cappedDeductions * 0.30; // Assuming 30% bracket for impact
      result.primary = taxSaved;
      result.totalInvested = cappedDeductions;
      result.estimatedReturns = income - taxSaved;
      break;

    case 'Inflation':
      let futureCost = amount * Math.pow(1 + rate / 100, years);
      result.primary = futureCost;
      result.totalInvested = amount;
      result.estimatedReturns = futureCost - amount;
      break;

    default:
      break;
  }
  return result;
};

const PRIMARY_RESULT_LABELS = {
  EMI: 'Your Monthly EMI',
  Goal: 'Required Monthly SIP',
  Retirement: 'Required Retirement Corpus',
  CAGR: 'Annualized Growth Rate',
  Eligibility: 'Max Eligible Loan Amount',
  Transfer: 'Total Savings By Transferring',
  SWP: 'Final Balance After Withdrawals',
  RentBuy: 'Future Property Value',
  Tax: 'Estimated Tax Saved',
  Inflation: 'Future Inflated Cost',
  FD: 'Total Maturity Value',
};

const FIRST_STAT_LABELS = {
  EMI: 'Principal Amount',
  Goal: 'Total Investment',
  Retirement: 'Est. Annual Exp at Ret.',
  Eligibility: 'Safe Monthly EMI',
  Transfer: 'Old Monthly EMI',
  SWP: 'Total Withdrawn',
  RentBuy: 'Total Rent Paid',
  Tax: 'Total Deductions',
  Inflation: 'Current Cost',
  FD: 'Total Invested',
};

const SECOND_STAT_LABELS = {
  EMI: 'Total Interest Payable',
  Retirement: 'Years to Retirement',
  Eligibility: 'Total Interest Payable',
  Transfer: 'New Monthly EMI',
  SWP: 'Initial Investment',
  RentBuy: 'Net Difference',
  Tax: 'Effective Net Income',
  Inflation: 'Cost Difference',
  FD: 'Total Interest Earned',
};

const REPORT_INPUTS = {
  SIP: [['Monthly Investment', 'amount'], ['Expected Return Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  Lumpsum: [['Total Investment', 'amount'], ['Expected Return Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  Compounding: [['Initial Investment', 'amount'], ['Monthly Contribution', 'monthlyAddition'], ['Expected Return Rate', 'rate', 'percent'], ['Compounding Frequency', 'frequency'], ['Time Period', 'years', 'years']],
  CAGR: [['Initial Investment Value', 'initialVal'], ['Final Value', 'finalVal'], ['Time Period', 'years', 'years']],
  FD: [['Deposit Type', 'depositType', 'text'], ['Deposit Amount', 'amount'], ['Expected Return Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  EMI: [['Loan Amount', 'amount'], ['Interest Rate', 'rate', 'percent'], ['Loan Tenure', 'years', 'years']],
  Eligibility: [['Monthly Net Income', 'income'], ['Existing Monthly EMIs', 'existingEmi'], ['Interest Rate', 'rate', 'percent'], ['Loan Tenure', 'years', 'years']],
  Transfer: [['Outstanding Loan Amount', 'amount'], ['Current Interest Rate', 'rate', 'percent'], ['New Interest Rate', 'newRate', 'percent'], ['Loan Tenure', 'years', 'years']],
  Goal: [['Target Goal Amount', 'targetAmount'], ['Expected Return Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  Retirement: [['Current Age', 'currentAge', 'years'], ['Retirement Age', 'retAge', 'years'], ['Current Monthly Expenses', 'expenses']],
  SWP: [['Total Investment Corpus', 'amount'], ['Monthly Withdrawal', 'withdrawal'], ['Expected Return Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  RentBuy: [['Property Value', 'amount'], ['Current Monthly Rent', 'rent'], ['Property Appreciation Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
  Tax: [['Annual Income', 'income'], ['80C Investments', 'amount'], ['80D Medical Insurance', 'medical']],
  Inflation: [['Current Cost / Amount', 'amount'], ['Inflation Rate', 'rate', 'percent'], ['Time Period', 'years', 'years']],
};

const formatInputValue = (value, type) => {
  if (type === 'percent') return `${value}%`;
  if (type === 'years') return `${value} Yrs`;
  if (type === 'text') return value;
  return formatCurrency(value);
};

const formatPrimaryResult = (activeCalcId, result) => (
  activeCalcId === 'CAGR' ? `${result.primary.toFixed(2)}%` : formatCurrency(result.primary)
);

const buildReportText = (activeCalc, formState, result) => {
  const inputLines = (REPORT_INPUTS[activeCalc.id] || [])
    .map(([label, field, type]) => `${label}: ${formatInputValue(formState[field], type)}`)
    .join('\n');

  const secondaryLines = activeCalc.id === 'CAGR'
    ? ''
    : `\n${FIRST_STAT_LABELS[activeCalc.id] || 'Total Invested'}: ${formatCurrency(result.totalInvested)}\n${SECOND_STAT_LABELS[activeCalc.id] || 'Est. Wealth Gained'}: ${activeCalc.id === 'Retirement' ? `${result.estimatedReturns} Yrs` : formatCurrency(result.estimatedReturns)}`;

  return [
    'VestoraX Financial Calculator Report',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    `Tool: ${activeCalc.title}`,
    activeCalc.desc,
    '',
    'Inputs',
    inputLines,
    '',
    'Results',
    `${PRIMARY_RESULT_LABELS[activeCalc.id] || 'Total Future Value'}: ${formatPrimaryResult(activeCalc.id, result)}${secondaryLines}`,
    '',
    'Note: This report is an educational estimate. Please verify numbers before making financial decisions.',
  ].join('\n');
};

const downloadReport = (activeCalc, formState, result) => {
  const report = buildReportText(activeCalc, formState, result);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vestorax-${activeCalc.id.toLowerCase()}-report.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// --- Calculator Data Definitions ---

const CALCULATORS = [
  { id: 'SIP', title: 'SIP Calculator', category: 'Investment', icon: <Activity className="w-5 h-5"/>, desc: 'Project monthly mutual fund investments.', color: 'text-emerald-400', active: true },
  { id: 'Lumpsum', title: 'Lump Sum', category: 'Investment', icon: <PieChart className="w-5 h-5"/>, desc: 'Calculate one-time investment growth.', color: 'text-teal-400', active: true },
  { id: 'Compounding', title: 'Compounding', category: 'Investment', icon: <Layers className="w-5 h-5"/>, desc: 'Understand the power of compound interest.', color: 'text-purple-400', active: true },
  { id: 'CAGR', title: 'CAGR Calculator', category: 'Investment', icon: <TrendingUp className="w-5 h-5"/>, desc: 'Calculate your true annualized return rate.', color: 'text-blue-400', active: true },
  { id: 'FD', title: 'FD / RD', category: 'Investment', icon: <Landmark className="w-5 h-5"/>, desc: 'Fixed & recurring deposit returns.', color: 'text-yellow-400', active: true },

  { id: 'EMI', title: 'EMI Calculator', category: 'Loan', icon: <Home className="w-5 h-5"/>, desc: 'Plan your home or auto loan payments.', color: 'text-blue-500', active: true },
  { id: 'Eligibility', title: 'Loan Eligibility', category: 'Loan', icon: <ShieldCheck className="w-5 h-5"/>, desc: 'Check your maximum borrowing capacity.', color: 'text-indigo-400', active: true },
  { id: 'Transfer', title: 'Balance Transfer', category: 'Loan', icon: <ArrowRight className="w-5 h-5"/>, desc: 'Compare savings by switching banks.', color: 'text-orange-400', active: true },

  { id: 'Goal', title: 'Goal Planner', category: 'Planning', icon: <Target className="w-5 h-5"/>, desc: 'Calculate SIP needed for your dream goal.', color: 'text-pink-400', active: true },
  { id: 'Retirement', title: 'Retirement', category: 'Planning', icon: <Briefcase className="w-5 h-5"/>, desc: 'Build your financial independence corpus.', color: 'text-emerald-500', active: true },
  { id: 'SWP', title: 'SWP Planner', category: 'Planning', icon: <Receipt className="w-5 h-5"/>, desc: 'Plan systematic cash withdrawals.', color: 'text-rose-400', active: true },
  { id: 'RentBuy', title: 'Rent vs Buy', category: 'Planning', icon: <Home className="w-5 h-5"/>, desc: 'Mathematical breakdown of housing choices.', color: 'text-cyan-400', active: true },

  { id: 'Tax', title: 'Tax Saver', category: 'Tax', icon: <PiggyBank className="w-5 h-5"/>, desc: 'Optimize your investments to save taxes.', color: 'text-yellow-500', active: true },
  { id: 'Inflation', title: 'Inflation Impact', category: 'Tax', icon: <Percent className="w-5 h-5"/>, desc: 'See the real future value of your money.', color: 'text-red-400', active: true },
];

const CATEGORIES = ['All', 'Investment', 'Loan', 'Planning', 'Tax'];

// --- Sections ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 w-full z-50 transition-all duration-300
      ${isScrolled ? 'bg-[#0B1D3A]/80 backdrop-blur-lg border-b border-white/10 py-4' : 'bg-transparent py-6'}
    `}>
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#1E3A8A] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Vestora<span className="text-[#10B981]">X</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#hub" className="text-white font-semibold transition-colors">All Calculators</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
        </div>

        <div className="hidden md:block">
          <PrimaryButton className="py-2.5 px-6" onClick={() => document.getElementById('hub').scrollIntoView({ behavior: 'smooth' })}>Launch Hub</PrimaryButton>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0B1D3A]/95 backdrop-blur-xl border-b border-white/10 flex flex-col p-6 gap-4 md:hidden">
          <a href="#home" className="text-white text-lg py-2 border-b border-white/5">Home</a>
          <a href="#hub" className="text-white text-lg py-2 border-b border-white/5">All Calculators</a>
          <a href="#features" className="text-white text-lg py-2 border-b border-white/5">Features</a>
          <div className="pt-4 flex flex-col gap-3">
            <PrimaryButton className="w-full" onClick={() => { setMobileMenuOpen(false); document.getElementById('hub').scrollIntoView({ behavior: 'smooth' }); }}>Launch Hub</PrimaryButton>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-[#0B1D3A]">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E3A8A]/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#10B981]/20 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <Sparkles className="w-4 h-4 text-[#10B981]" />
          <span className="text-sm font-medium text-teal-100">Introducing the All-In-One Financial Toolkit</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight max-w-4xl">
          Plan Your Wealth. <br />
          <GradientText>Predict Your Future.</GradientText>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl">
          Access a premium suite of intelligent calculators. From SIPs and Retirements to Loans and Taxes-everything you need to make elite financial decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <PrimaryButton icon={<ArrowRight className="w-4 h-4" />} onClick={() => document.getElementById('hub').scrollIntoView({ behavior: 'smooth' })}>
            Explore Calculators
          </PrimaryButton>
          <SecondaryButton onClick={() => document.getElementById('hub').scrollIntoView({ behavior: 'smooth' })}>
            View Dashboard
          </SecondaryButton>
        </div>

        {/* Sneak peek of tools */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-80">
          {[
            { icon: <Activity className="w-5 h-5"/>, label: "SIP" },
            { icon: <Briefcase className="w-5 h-5"/>, label: "Retirement" },
            { icon: <Target className="w-5 h-5"/>, label: "Goals" },
            { icon: <Home className="w-5 h-5"/>, label: "EMI" },
            { icon: <PiggyBank className="w-5 h-5"/>, label: "Tax" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
              <span className="text-[#10B981]">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- THE NEW CALCULATOR HUB ---
const CalculatorsHub = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCalcId, setActiveCalcId] = useState(null);

  // Form States (Unified to handle all active calculators)
  const [formState, setFormState] = useState({
    amount: 10000,
    rate: 12,
    years: 10,
    frequency: 12,
    monthlyAddition: 2000,
    targetAmount: 5000000,
    currentAge: 30,
    retAge: 60,
    expenses: 50000,
    initialVal: 100000,
    finalVal: 310000,
    depositType: 'FD',
    income: 150000,
    existingEmi: 15000,
    newRate: 8.5,
    withdrawal: 25000,
    rent: 30000,
    medical: 25000
  });

  const handleInputChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: Number(value) }));
  };

  const filteredCalculators = useMemo(() => {
    return CALCULATORS.filter(calc => {
      const matchCat = activeTab === 'All' || calc.category === activeTab;
      const matchSearch = calc.title.toLowerCase().includes(searchQuery.toLowerCase()) || calc.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeTab, searchQuery]);

  const activeCalc = CALCULATORS.find(c => c.id === activeCalcId);
  const result = activeCalc ? calculateWealth(activeCalc.id, formState) : null;

  return (
    <section id="hub" className="py-24 bg-[#050A15] relative min-h-screen">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* State 1: Grid View */}
        {!activeCalcId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Financial <GradientText>Toolkit</GradientText></h2>
                <p className="text-gray-400">Select a calculator to start planning your financial future.</p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Find a calculator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#112240] border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                    activeTab === cat
                    ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCalculators.map(calc => (
                <GlassCard
                  key={calc.id}
                  hoverEffect
                  onClick={() => calc.active && setActiveCalcId(calc.id)}
                  className={`p-6 flex flex-col h-full ${!calc.active ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${calc.color}`}>
                      {calc.icon}
                    </div>
                    {!calc.active && (
                      <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 bg-white/5 rounded-md flex items-center gap-1">
                        <Lock className="w-3 h-3"/> PRO
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{calc.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed flex-grow">{calc.desc}</p>

                  {calc.active ? (
                    <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-[#10B981] group-hover:gap-2 transition-all">
                      Open Tool <ArrowRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="mt-6 text-sm font-medium text-gray-500">Coming Soon</div>
                  )}
                </GlassCard>
              ))}
            </div>

            {filteredCalculators.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400">No calculators found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* State 2: Active Calculator Detail View */}
        {activeCalcId && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
              onClick={() => setActiveCalcId(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to all calculators
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${activeCalc.color}`}>
                {activeCalc.icon}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{activeCalc.title}</h2>
                <p className="text-gray-400">{activeCalc.desc}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* INPUT PANEL */}
              <div className="lg:col-span-5 space-y-6">
                <GlassCard className="p-6 md:p-8 space-y-8">

                  {/* Dynamic Inputs based on activeCalcId */}
                  {(activeCalcId === 'SIP' || activeCalcId === 'Lumpsum' || activeCalcId === 'Compounding') && (
                    <SliderInput label={activeCalcId === 'SIP' ? 'Monthly Investment' : 'Total Investment'} val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={500} max={1000000} step={500} format={formatCurrency} />
                  )}

                  {activeCalcId === 'FD' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">Deposit Type</label>
                        <div className="flex gap-2">
                          {['FD', 'RD'].map(t => (
                            <button key={t} onClick={() => setFormState(prev => ({...prev, depositType: t}))} className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all flex-1 ${formState.depositType === t ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-[#112240] border-white/10 text-gray-400 hover:border-white/30'}`}>
                              {t === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <SliderInput label={formState.depositType === 'FD' ? 'Total Deposit' : 'Monthly Deposit'} val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={5000} max={10000000} step={5000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'Eligibility' && (
                    <>
                      <SliderInput label="Monthly Net Income" val={formState.income} setVal={(v) => handleInputChange('income', v)} min={20000} max={1000000} step={5000} format={formatCurrency} />
                      <SliderInput label="Existing Monthly EMIs" val={formState.existingEmi} setVal={(v) => handleInputChange('existingEmi', v)} min={0} max={500000} step={1000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'Transfer' && (
                    <>
                      <SliderInput label="Outstanding Loan Amount" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={100000} max={50000000} step={100000} format={formatCurrency} />
                      <SliderInput label="Current Interest Rate (%)" val={formState.rate} setVal={(v) => handleInputChange('rate', v)} min={5} max={20} step={0.1} format={v=>`${v}%`} />
                      <SliderInput label="New Interest Rate (%)" val={formState.newRate} setVal={(v) => handleInputChange('newRate', v)} min={5} max={20} step={0.1} format={v=>`${v}%`} />
                    </>
                  )}

                  {activeCalcId === 'SWP' && (
                    <>
                      <SliderInput label="Total Investment Corpus" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={100000} max={50000000} step={50000} format={formatCurrency} />
                      <SliderInput label="Monthly Withdrawal" val={formState.withdrawal} setVal={(v) => handleInputChange('withdrawal', v)} min={1000} max={500000} step={1000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'RentBuy' && (
                    <>
                      <SliderInput label="Property Value" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={1000000} max={100000000} step={500000} format={formatCurrency} />
                      <SliderInput label="Current Monthly Rent" val={formState.rent} setVal={(v) => handleInputChange('rent', v)} min={5000} max={500000} step={1000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'Tax' && (
                    <>
                      <SliderInput label="Annual Income" val={formState.income} setVal={(v) => handleInputChange('income', v)} min={300000} max={50000000} step={50000} format={formatCurrency} />
                      <SliderInput label="80C Investments (PPF, ELSS, etc.)" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={0} max={150000} step={5000} format={formatCurrency} />
                      <SliderInput label="80D Medical Insurance" val={formState.medical} setVal={(v) => handleInputChange('medical', v)} min={0} max={100000} step={5000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'Inflation' && (
                    <SliderInput label="Current Cost / Amount" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={1000} max={10000000} step={1000} format={formatCurrency} />
                  )}

                  {activeCalcId === 'Compounding' && (
                    <SliderInput label="Monthly Contribution (Optional)" val={formState.monthlyAddition} setVal={(v) => handleInputChange('monthlyAddition', v)} min={0} max={100000} step={500} format={formatCurrency} />
                  )}

                  {activeCalcId === 'EMI' && (
                    <SliderInput label="Loan Amount" val={formState.amount} setVal={(v) => handleInputChange('amount', v)} min={100000} max={50000000} step={100000} format={formatCurrency} />
                  )}

                  {activeCalcId === 'Goal' && (
                    <SliderInput label="Target Goal Amount" val={formState.targetAmount} setVal={(v) => handleInputChange('targetAmount', v)} min={100000} max={1000000000} step={100000} format={formatCurrency} />
                  )}

                  {activeCalcId === 'Retirement' && (
                    <>
                      <SliderInput label="Current Age" val={formState.currentAge} setVal={(v) => handleInputChange('currentAge', v)} min={18} max={60} step={1} format={v=>`${v} Yrs`} />
                      <SliderInput label="Retirement Age" val={formState.retAge} setVal={(v) => handleInputChange('retAge', v)} min={40} max={75} step={1} format={v=>`${v} Yrs`} />
                      <SliderInput label="Current Monthly Expenses" val={formState.expenses} setVal={(v) => handleInputChange('expenses', v)} min={10000} max={500000} step={5000} format={formatCurrency} />
                    </>
                  )}

                  {activeCalcId === 'CAGR' && (
                    <>
                      <SliderInput label="Initial Investment Value" val={formState.initialVal} setVal={(v) => handleInputChange('initialVal', v)} min={10000} max={10000000} step={10000} format={formatCurrency} />
                      <SliderInput label="Final Value" val={formState.finalVal} setVal={(v) => handleInputChange('finalVal', v)} min={10000} max={1000000000} step={10000} format={formatCurrency} />
                    </>
                  )}

                  {/* Common Time Sliders */}
                  {(['SIP', 'Lumpsum', 'Compounding', 'EMI', 'Goal', 'CAGR', 'FD', 'Eligibility', 'Transfer', 'SWP', 'RentBuy', 'Inflation'].includes(activeCalcId)) && (
                    <SliderInput
                      label={['EMI', 'Eligibility', 'Transfer'].includes(activeCalcId) ? 'Loan Tenure (Years)' : 'Time Period (Years)'}
                      val={formState.years} setVal={(v) => handleInputChange('years', v)} min={1} max={activeCalcId === 'Goal' ? 50 : 40} step={1} format={v=>`${v} Yrs`}
                    />
                  )}

                  {/* Common Rate Sliders */}
                  {(['SIP', 'Lumpsum', 'Compounding', 'EMI', 'Goal', 'FD', 'Eligibility', 'SWP', 'RentBuy', 'Inflation'].includes(activeCalcId)) && (
                    <SliderInput
                      label={
                        ['EMI', 'Eligibility'].includes(activeCalcId) ? 'Interest Rate (% p.a.)' :
                        activeCalcId === 'Inflation' ? 'Inflation Rate (%)' :
                        activeCalcId === 'RentBuy' ? 'Property Appreciation Rate (%)' : 'Expected Return Rate (%)'
                      }
                      val={formState.rate} setVal={(v) => handleInputChange('rate', v)} min={1} max={30} step={0.1} format={v=>`${v}%`}
                    />
                  )}

                  {activeCalcId === 'Compounding' && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">Compounding Frequency</label>
                      <div className="flex flex-wrap gap-2">
                        {[{l:'Yearly', v:1}, {l:'Half-Yearly', v:2}, {l:'Quarterly', v:4}, {l:'Monthly', v:12}].map(f => (
                          <button key={f.v} onClick={() => handleInputChange('frequency', f.v)} className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${formState.frequency === f.v ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#112240] border-white/10 text-gray-400 hover:border-white/30'}`}>
                            {f.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* OUTPUT PANEL */}
              <div className="lg:col-span-7 relative h-full">
                <GlassCard className="p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Primary Highlight */}
                    <div className="text-center mb-8 relative">
                      <p className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wider">
                        {{
                          'EMI': 'Your Monthly EMI',
                          'Goal': 'Required Monthly SIP',
                          'Retirement': 'Required Retirement Corpus',
                          'CAGR': 'Annualized Growth Rate',
                          'Eligibility': 'Max Eligible Loan Amount',
                          'Transfer': 'Total Savings By Transferring',
                          'SWP': 'Final Balance After Withdrawals',
                          'RentBuy': 'Future Property Value',
                          'Tax': 'Estimated Tax Saved',
                          'Inflation': 'Future Inflated Cost',
                          'FD': 'Total Maturity Value'
                        }[activeCalcId] || 'Total Future Value'}
                      </p>
                      <h3 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${['CAGR', 'Tax', 'Transfer'].includes(activeCalcId) ? 'text-blue-400' : 'text-white'}`}>
                        {activeCalcId === 'CAGR' ? `${result.primary.toFixed(2)}%` : formatCurrency(result.primary)}
                      </h3>
                    </div>

                    {/* Secondary Stats Grid */}
                    {activeCalcId !== 'CAGR' && (
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-[#112240]/80 border border-white/5 text-center">
                          <p className="text-xs text-gray-400 mb-1">
                            {{
                              'EMI': 'Principal Amount',
                              'Goal': 'Total Investment',
                              'Retirement': 'Est. Annual Exp at Ret.',
                              'Eligibility': 'Safe Monthly EMI',
                              'Transfer': 'Old Monthly EMI',
                              'SWP': 'Total Withdrawn',
                              'RentBuy': 'Total Rent Paid',
                              'Tax': 'Total Deductions',
                              'Inflation': 'Current Cost',
                              'FD': 'Total Invested'
                            }[activeCalcId] || 'Total Invested'}
                          </p>
                          <p className="text-lg font-semibold text-white">{formatCurrency(result.totalInvested)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#112240]/80 border border-[#10B981]/20 text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent pointer-events-none" />
                          <p className="text-xs text-[#10B981] mb-1">
                            {{
                              'EMI': 'Total Interest Payable',
                              'Retirement': 'Years to Retirement',
                              'Eligibility': 'Total Interest Payable',
                              'Transfer': 'New Monthly EMI',
                              'SWP': 'Initial Investment',
                              'RentBuy': 'Net Difference',
                              'Tax': 'Effective Net Income',
                              'Inflation': 'Cost Difference',
                              'FD': 'Total Interest Earned'
                            }[activeCalcId] || 'Est. Wealth Gained'}
                          </p>
                          <p className="text-lg font-semibold text-[#10B981] relative z-10">
                            {activeCalcId === 'Retirement' ? `${result.estimatedReturns} Yrs` : formatCurrency(result.estimatedReturns)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Visual Charts */}
                    {result.chartType === 'donut' ? (
                       <div className="flex justify-center mb-8">
                         <div className="relative w-40 h-40">
                           <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                             <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1E3A8A" strokeWidth="16" />
                             <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="16"
                               strokeDasharray={`${(result.estimatedReturns / (result.primary * formState.years * 12)) * 251.32 || 0} 251.32`}
                               className="transition-all duration-1000 ease-out" />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center flex-col">
                             <span className="text-[10px] text-gray-400">Total Payment</span>
                             <span className="text-sm font-bold text-white">{formatCurrency(result.primary * formState.years * 12)}</span>
                           </div>
                         </div>
                       </div>
                    ) : (
                      <div className="h-40 w-full relative mb-8">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                          <path d={`M0,100 Q30,90 50,60 T100,20`} fill="none" stroke="url(#lineGrad)" strokeWidth="3" className="transition-all duration-500" />
                          <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#10B981"/></linearGradient>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/><stop offset="100%" stopColor="#10B981" stopOpacity="0"/></linearGradient>
                          </defs>
                          <path d={`M0,100 Q30,90 50,60 T100,20 L100,100 Z`} fill="url(#areaGrad)" className="transition-all duration-500" />
                        </svg>
                      </div>
                    )}

                    {/* Smart Insights Box */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-900/20 border border-blue-500/20 mb-6">
                      <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-200/90 leading-relaxed">
                        {activeCalcId === 'SIP' && "Consistency is key. Even a small increase in your monthly SIP can drastically alter your final corpus due to compounding."}
                        {activeCalcId === 'EMI' && "Prepaying even 5% of your loan principal annually can shave years off your tenure and save massive interest."}
                        {activeCalcId === 'Retirement' && "This simplified calculation assumes a 4% safe withdrawal rate post-retirement. Start early to let compounding do the heavy lifting."}
                        {activeCalcId === 'Goal' && "Set up an automated SIP for this exact amount. Automation removes emotion and guarantees progress towards your target."}
                        {activeCalcId === 'CAGR' && "CAGR smooths out volatility to show you the steady annual rate of return. Aim for a CAGR that comfortably beats inflation."}
                        {activeCalcId === 'Compounding' && "Your money is making money! The longer you leave it invested, the steeper the exponential growth curve becomes."}
                        {activeCalcId === 'Lumpsum' && "Time in the market beats timing the market. Leaving a lump sum untouched allows maximum compounding efficiency."}
                        {activeCalcId === 'FD' && "Fixed Deposits offer guaranteed returns. RD helps you build that corpus systematically every month."}
                        {activeCalcId === 'Eligibility' && "Keeping your existing EMIs low dramatically improves your borrowing power for essential assets like a home."}
                        {activeCalcId === 'Transfer' && "If the savings cover the processing fees of the new bank, a balance transfer is highly recommended to reduce financial burden."}
                        {activeCalcId === 'SWP' && "SWP allows you to create a regular income stream while your remaining capital continues to grow in the market."}
                        {activeCalcId === 'RentBuy' && "Compare the equity built by buying against the opportunity cost of investing the downpayment instead."}
                        {activeCalcId === 'Tax' && "Maximizing 80C and 80D limits is the first step. Consider ELSS for wealth generation along with tax saving."}
                        {activeCalcId === 'Inflation' && "Inflation silently erodes purchasing power. Your investments must yield more than this rate to generate real wealth."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10">
                    <PrimaryButton icon={<Download className="w-4 h-4" />} className="w-full" onClick={() => downloadReport(activeCalc, formState, result)}>
                      Download Detailed Report
                    </PrimaryButton>
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Reports are saved as local text files and use the current slider values.
                    </p>
                  </div>
                </GlassCard>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Sub-component for Sliders to keep code clean
const SliderInput = ({ label, val, setVal, min, max, step, format }) => (
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <span className="text-sm font-bold text-[#10B981]">{format(val)}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={val}
      onChange={(e) => setVal(e.target.value)}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
    />
  </div>
);



const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#081226] border-t border-white/5 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why Choose <GradientText>VestoraX?</GradientText></h2>
          <p className="text-gray-400">Beyond simple calculators. We provide a comprehensive ecosystem for financial clarity.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
             { icon: <Layers className="w-6 h-6 text-blue-400"/>, title: "All-in-One Toolkit", desc: "No need to bounce between websites. From EMI to Retirement, every formula you need is right here." },
             { icon: <Activity className="w-6 h-6 text-[#10B981]"/>, title: "Dynamic Visualizations", desc: "Understand complex math instantly with our smooth, interactive charts and visual milestone markers." },
             { icon: <ShieldCheck className="w-6 h-6 text-purple-400"/>, title: "Unbiased Insights", desc: "We don't push products. We provide pure, mathematical clarity so you can make independent choices." }
          ].map((f,i) => (
             <GlassCard key={i} className="p-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
             </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0B1D3A]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#10B981]/10" />
      <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          Take Control of Your <GradientText>Financial Destiny</GradientText>
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          Stop guessing. Start planning with precision using the VestoraX toolkit.
        </p>
        <PrimaryButton className="text-lg px-10 py-4" onClick={() => document.getElementById('hub').scrollIntoView({ behavior: 'smooth' })}>
          Start Calculating Now
        </PrimaryButton>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#050A15] border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#10B981] to-[#1E3A8A] flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Vestora<span className="text-[#10B981]">X</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Premium financial calculators and wealth planning tools designed for clarity, accuracy, and growth.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Top Tools</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#hub" className="hover:text-[#10B981] transition-colors">SIP Calculator</a></li>
              <li><a href="#hub" className="hover:text-[#10B981] transition-colors">Retirement Planner</a></li>
              <li><a href="#hub" className="hover:text-[#10B981] transition-colors">EMI Planner</a></li>
              <li><a href="#hub" className="hover:text-[#10B981] transition-colors">Goal Planner</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#hub" className="hover:text-[#10B981] transition-colors">All Calculators</a></li>
              <li><a href="#features" className="hover:text-[#10B981] transition-colors">Features</a></li>
              <li><a href="#home" className="hover:text-[#10B981] transition-colors">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Trust</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>No sign-up required</li>
              <li>Reports stay on your device</li>
              <li>Educational estimates only</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">&copy; 2026 VestoraX. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Privacy-first tools</span>
            <span>Review before investing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="font-sans bg-[#0B1D3A] min-h-screen text-slate-50 selection:bg-[#10B981] selection:text-white scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <CalculatorsHub />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
