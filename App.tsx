
import React, { useState, useMemo, ChangeEvent, useRef } from 'react';
import { CalculationInput, CalculationMode, Region } from './types';
import { performCalculation, formatCurrency, parseRawInput } from './services/calculator';
import { REGION_MIN_WAGE, REGION_DETAILS, DEDUCTIONS, MAX_INSURANCE_BASE, BASE_SALARY, EMPLOYEE_INSURANCE_RATES, EMPLOYER_INSURANCE_RATES } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [input, setInput] = useState<CalculationInput>({
    mode: CalculationMode.GROSS_TO_NET,
    salary: 35000000,
    taxableAllowance: 0,
    dependents: 0,
    region: Region.I,
    isExpat: false,
    isProbation: false
  });

  const [salaryDisplay, setSalaryDisplay] = useState<string>(formatCurrency(35000000));
  const [allowanceDisplay, setAllowanceDisplay] = useState<string>(formatCurrency(0));
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => performCalculation(input), [input]);
  const [expandedFormula, setExpandedFormula] = useState(true);

  const insuranceBase = Math.min(result.gross, MAX_INSURANCE_BASE);

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseRawInput(rawValue);
    if (numericValue > 100000000000) return;
    setInput(prev => ({ ...prev, salary: numericValue }));
    setSalaryDisplay(numericValue === 0 ? '' : formatCurrency(numericValue));
  };

  const handleAllowanceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseRawInput(rawValue);
    if (numericValue > 100000000000) return;
    setInput(prev => ({ ...prev, taxableAllowance: numericValue }));
    setAllowanceDisplay(numericValue === 0 ? '' : formatCurrency(numericValue));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCaptureImage = async () => {
    if (!resultsRef.current || isCapturing) return;
    
    setIsCapturing(true);
    // Add a class for screenshot-specific styling
    document.body.classList.add('screenshot-mode');

    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        windowWidth: 1200 // Ensure consistent width for the screenshot
      });
      
      const link = document.createElement('a');
      link.download = `Vietnam-Salary-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
      alert('Không thể chụp ảnh màn hình. Vui lòng thử lại.');
    } finally {
      setIsCapturing(false);
      document.body.classList.remove('screenshot-mode');
    }
  };

  const pieData = [
    { name: 'Thực nhận', value: result.net, color: '#2b6cee' },
    { name: 'Bảo hiểm', value: result.insurance.total, color: '#10b981' },
    { name: 'Thuế', value: result.tax, color: '#94a3b8' }
  ];

  const totalInputSalary = result.gross + result.taxableAllowance;
  const netRate = totalInputSalary > 0 ? ((result.net / totalInputSalary) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-primary-100 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-success/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Modern Header */}
      <header className="glass sticky top-0 z-[60] border-b border-white/40 shadow-sm no-print">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-primary-700 flex items-center justify-center text-white shadow-glow">
              <span className="material-icons text-xl sm:text-2xl">insights</span>
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-2xl tracking-tighter text-slate-900 leading-none">Vietnam <span className="text-accent">Salary</span></h1>
              <p className="hidden sm:flex text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Luật Thuế 109/2025/QH15
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
              <span className="material-icons text-sm">print</span>
              <span>IN</span>
            </button>
            <button 
              onClick={handleCaptureImage}
              disabled={isCapturing}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900 text-white text-[10px] sm:text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50">
              <span className="material-icons text-sm sm:text-base">{isCapturing ? 'sync' : 'camera_alt'}</span>
              <span>{isCapturing ? 'ĐANG CHỤP...' : 'CHỤP ẢNH'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-6 sm:px-8 sm:py-10 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* COLUMN 1: CONFIGURATION */}
          <aside className="lg:col-span-4 xl:col-span-3 order-1 animate-fade-in no-print">
            <div className="bg-white rounded-3xl sm:rounded-4xl shadow-premium border border-slate-100 p-5 sm:p-8 lg:sticky lg:top-28">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center">
                  <span className="material-icons text-accent text-lg">settings_suggest</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">Cấu hình lương</h2>
              </div>

              <div className="space-y-6">
                {/* Switcher */}
                <div className="bg-slate-100 p-1 rounded-xl flex relative h-11 shadow-inner-soft">
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${input.mode === CalculationMode.NET_TO_GROSS ? 'translate-x-full' : 'translate-x-0'}`}></div>
                  <button onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.GROSS_TO_NET }))}
                    className={`flex-1 text-[10px] font-black transition-all relative z-10 ${input.mode === CalculationMode.GROSS_TO_NET ? 'text-accent' : 'text-slate-400'}`}>
                    GROSS → NET
                  </button>
                  <button onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.NET_TO_GROSS }))}
                    className={`flex-1 text-[10px] font-black transition-all relative z-10 ${input.mode === CalculationMode.NET_TO_GROSS ? 'text-accent' : 'text-slate-400'}`}>
                    NET → GROSS
                  </button>
                </div>

                {/* Main Input Field */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {input.mode === CalculationMode.GROSS_TO_NET ? 'Lương Gross (Hợp đồng)' : 'Lương Net nhận về'}
                  </label>
                  <div className="relative group">
                    <input type="text" inputMode="numeric" value={salaryDisplay} onChange={handleSalaryChange}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none font-extrabold text-xl sm:text-2xl text-slate-900 transition-all shadow-inner-soft" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">₫</span>
                  </div>
                </div>

                {/* Taxable Allowance Field */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phụ cấp chịu thuế (Ko đóng BH)</label>
                  <div className="relative group">
                    <input type="text" inputMode="numeric" value={allowanceDisplay} onChange={handleAllowanceChange}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/5 outline-none font-bold text-lg text-slate-800 transition-all shadow-inner-soft" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">₫</span>
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Đối tượng</label>
                   <div className="space-y-2">
                      <button onClick={() => setInput(prev => ({ ...prev, isExpat: false, isProbation: false }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${!input.isExpat && !input.isProbation ? 'border-accent bg-accent/5' : 'border-slate-50 hover:border-slate-200'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!input.isExpat && !input.isProbation ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-icons text-sm">person</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">Lao động Việt Nam</span>
                      </button>
                      <button onClick={() => setInput(prev => ({ ...prev, isExpat: true, isProbation: false }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${input.isExpat ? 'border-accent bg-accent/5' : 'border-slate-50 hover:border-slate-200'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${input.isExpat ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-icons text-sm">public</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">Người nước ngoài</span>
                      </button>
                      <button onClick={() => setInput(prev => ({ ...prev, isProbation: true, isExpat: false }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${input.isProbation ? 'border-warning bg-warning/5' : 'border-slate-50 hover:border-slate-200'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${input.isProbation ? 'bg-warning text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">Thử việc (Thuế 10%)</span>
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phụ thuộc</label>
                    <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl p-1">
                      <button onClick={() => setInput(prev => ({ ...prev, dependents: Math.max(0, prev.dependents - 1) }))} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-lg"><span className="material-icons text-sm">remove</span></button>
                      <input className="flex-1 text-center bg-transparent border-none focus:ring-0 font-extrabold text-sm text-slate-900" readOnly value={input.dependents} />
                      <button onClick={() => setInput(prev => ({ ...prev, dependents: prev.dependents + 1 }))} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-lg"><span className="material-icons text-sm">add</span></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vùng Lương</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[Region.I, Region.II, Region.III, Region.IV].map((r) => (
                        <button key={r} onClick={() => setInput(prev => ({ ...prev, region: r }))}
                          className={`py-2 rounded-lg border-2 text-[10px] font-black transition-all ${input.region === r ? 'bg-accent border-accent text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insurance Rates Info Table */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tỉ lệ đóng bảo hiểm (%)</label>
                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-black text-slate-500 uppercase">Loại</th>
                          <th className="px-2 py-1.5 text-right font-black text-slate-500 uppercase">NLĐ</th>
                          <th className="px-2 py-1.5 text-right font-black text-slate-500 uppercase">DN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="px-2 py-1.5 text-slate-600 font-bold">BHXH</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYEE_INSURANCE_RATES.BHXH * 100).toFixed(1)}%</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYER_INSURANCE_RATES.BHXH * 100).toFixed(1)}%</td></tr>
                        <tr><td className="px-2 py-1.5 text-slate-600 font-bold">BHYT</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYEE_INSURANCE_RATES.BHYT * 100).toFixed(1)}%</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYER_INSURANCE_RATES.BHYT * 100).toFixed(1)}%</td></tr>
                        <tr><td className="px-2 py-1.5 text-slate-600 font-bold">BHTN</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYEE_INSURANCE_RATES.BHTN * 100).toFixed(1)}%</td><td className="px-2 py-1.5 text-right font-black">{(EMPLOYER_INSURANCE_RATES.BHTN * 100).toFixed(1)}%</td></tr>
                        <tr className="bg-slate-100/50"><td className="px-2 py-1.5 text-slate-900 font-black">Tổng</td><td className="px-2 py-1.5 text-right font-black text-success">{(EMPLOYEE_INSURANCE_RATES.TOTAL * 100).toFixed(1)}%</td><td className="px-2 py-1.5 text-right font-black text-accent">{(EMPLOYER_INSURANCE_RATES.TOTAL * 100).toFixed(1)}%</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* WRAPPER FOR RESULTS & BREAKDOWN - CAPTURED AREA */}
          <div ref={resultsRef} className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 2: KEY RESULTS */}
            <section className="animate-fade-in w-full">
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-3xl sm:rounded-4xl shadow-premium border border-slate-100 p-6 sm:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-accent"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Thực nhận hàng tháng</h3>
                      <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-success/10 text-success rounded-full text-[9px] font-black tracking-widest">
                        CẬP NHẬT 2026
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                      <span className="material-icons text-xl sm:text-2xl">payments</span>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tightest mb-1 break-all">{formatCurrency(result.net)}</div>
                    <div className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">VND / THÁNG</div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Cơ chế 2025</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-600 truncate block">{formatCurrency(result.comparisonWith2025.net2025)}</span>
                    </div>
                    <div className="bg-success/5 rounded-2xl p-4 border border-success/10">
                      <span className="text-[8px] font-black text-success/70 uppercase block mb-1">Chênh lệch</span>
                      <span className="text-xs sm:text-sm font-extrabold text-success truncate block">+{formatCurrency(result.comparisonWith2025.increase)}</span>
                    </div>
                  </div>

                  {/* Visual Analytics */}
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 sm:h-52 relative mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData} 
                            cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" 
                            paddingAngle={5} dataKey="value" stroke="none"
                          >
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{netRate}%</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Lương thực</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {pieData.map(item => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                          <span className="text-[9px] font-black text-slate-500 uppercase">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-[50px]"></div>
                   <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Tham số kỹ thuật 2026</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Lương cơ sở</p>
                       <p className="text-sm font-black">{formatCurrency(BASE_SALARY)} ₫</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Vùng {input.region}</p>
                       <p className="text-sm font-black">{formatCurrency(REGION_MIN_WAGE[input.region])} ₫</p>
                     </div>
                   </div>
                </div>
              </div>
            </section>

            {/* COLUMN 3: BREAKDOWN TABLE */}
            <section className="animate-fade-in w-full">
              <div className="bg-white rounded-3xl sm:rounded-4xl shadow-premium border border-slate-100 p-5 sm:p-8 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Chi tiết diễn giải</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Khai báo thu nhập & khấu trừ</p>
                  </div>
                  <div className="flex gap-2 no-print">
                    <button onClick={handlePrint} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-slate-600"><span className="material-icons text-sm">print</span></button>
                    <button onClick={handleCaptureImage} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20"><span className="material-icons text-sm">camera_alt</span></button>
                  </div>
                </div>

                {/* Optimized Table - Fix overflow */}
                <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0 scrollbar-hide">
                  <table className="w-full text-xs border-collapse min-w-[320px]">
                    <thead>
                      <tr className="border-b-2 border-slate-50">
                        <th className="text-left pb-3 font-black text-slate-300 uppercase text-[9px]">Danh mục</th>
                        <th className="text-right pb-3 font-black text-slate-300 uppercase text-[9px]">Tỉ lệ</th>
                        <th className="text-right pb-3 font-black text-slate-900 uppercase text-[9px]">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="group">
                        <td className="py-4 font-extrabold text-slate-900 text-sm">Lương Gross</td>
                        <td className="text-right py-4 text-[9px] text-slate-300">HĐLĐ</td>
                        <td className="text-right py-4 font-black text-slate-900 text-sm">{formatCurrency(result.gross)}</td>
                      </tr>
                      {result.taxableAllowance > 0 && (
                        <tr className="bg-warning/5">
                          <td className="py-3 px-2 font-bold text-slate-700">Phụ cấp (Tax)</td>
                          <td className="text-right py-3 text-[9px] text-slate-400">Ko BH</td>
                          <td className="text-right py-3 font-black text-slate-800">{formatCurrency(result.taxableAllowance)}</td>
                        </tr>
                      )}
                      
                      {!input.isProbation ? (
                        <>
                          <tr className="bg-slate-50/50"><td colSpan={3} className="py-1 px-2 text-[8px] font-black text-primary uppercase">Bảo hiểm nhân viên</td></tr>
                          <tr className="text-[11px]"><td className="py-3 px-2 text-slate-600">BH Xã hội ({(EMPLOYEE_INSURANCE_RATES.BHXH * 100).toFixed(0)}%)</td><td className="text-right py-3 text-[9px] text-slate-300">{formatCurrency(insuranceBase)}</td><td className="text-right py-3 font-bold text-slate-700">{formatCurrency(result.insurance.bhxh)}</td></tr>
                          <tr className="text-[11px]"><td className="py-3 px-2 text-slate-600">BH Y tế ({(EMPLOYEE_INSURANCE_RATES.BHYT * 100).toFixed(1)}%)</td><td className="text-right py-3 text-[9px] text-slate-300">Max</td><td className="text-right py-3 font-bold text-slate-700">{formatCurrency(result.insurance.bhyt)}</td></tr>
                          {!input.isExpat && <tr className="text-[11px]"><td className="py-3 px-2 text-slate-600">BH Thất nghiệp ({(EMPLOYEE_INSURANCE_RATES.BHTN * 100).toFixed(0)}%)</td><td className="text-right py-3 text-[9px] text-slate-300">Vùng {input.region}</td><td className="text-right py-3 font-bold text-slate-700">{formatCurrency(result.insurance.bhtn)}</td></tr>}
                          
                          <tr className="bg-slate-50/50"><td colSpan={3} className="py-1 px-2 text-[8px] font-black text-warning uppercase">Giảm trừ gia cảnh</td></tr>
                          <tr className="text-[11px]"><td className="py-3 px-2 text-slate-600">Bản thân</td><td className="text-right py-3 text-[9px] text-slate-300">Nghị quyết 110</td><td className="text-right py-3 font-black text-success">-{formatCurrency(DEDUCTIONS.PERSONAL_2026)}</td></tr>
                          {input.dependents > 0 && <tr className="text-[11px]"><td className="py-3 px-2 text-slate-600">NPT ({input.dependents})</td><td className="text-right py-3 text-[9px] text-slate-300">x {formatCurrency(DEDUCTIONS.DEPENDENT_2026)}</td><td className="text-right py-3 font-black text-success">-{formatCurrency(input.dependents * DEDUCTIONS.DEPENDENT_2026)}</td></tr>}
                        </>
                      ) : (
                        <tr><td colSpan={3} className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] italic">Chế độ thử việc 10% thuế khoán</td></tr>
                      )}
                      
                      <tr className="bg-slate-50 border-t-2 border-slate-100">
                        <td className="py-4 px-2 font-black text-slate-900">THU NHẬP TÍNH THUẾ</td>
                        <td className="text-right py-4"></td>
                        <td className="text-right py-4 font-black text-slate-900 text-sm">{formatCurrency(result.taxableIncome)}</td>
                      </tr>
                      
                      <tr className="bg-accent/5 border-t-2 border-accent">
                        <td className="py-5 px-2 text-accent font-black">THUẾ TNCN NỘP</td>
                        <td className="text-right py-5 text-[9px] text-accent/50 font-bold uppercase">{input.isProbation ? '10% cố định' : `Bậc ${result.taxBrackets.length}`}</td>
                        <td className="text-right py-5 font-black text-accent text-lg">{formatCurrency(result.tax)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase font-black mb-1">Employer Cost (DN Đóng {(EMPLOYER_INSURANCE_RATES.TOTAL * 100).toFixed(1)}% BH)</span>
                    <span className="text-[10px] font-bold text-accent">Tổng chi phí DN chi trả</span>
                  </div>
                  <span className="text-base sm:text-lg font-black">{formatCurrency(result.employerCost)} ₫</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-10 no-print">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
             <button 
                onClick={handleCaptureImage}
                disabled={isCapturing}
                className="px-8 py-4 rounded-2xl bg-accent hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isCapturing ? 'ĐANG CHỤP...' : 'LƯU ẢNH KẾT QUẢ'}
             </button>
          </div>
          <p className="text-xs text-slate-400 font-medium">© 2026 Vietnam Salary - Hệ thống tính toán tuân thủ Nghị định 293/2025/NĐ-CP</p>
        </div>
      </footer>

      {/* MODAL: Region Lookup */}
      {showRegionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-huge overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 uppercase">Chọn vùng 2026</h2>
              <button onClick={() => setShowRegionModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><span className="material-icons text-base">close</span></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {[Region.I, Region.II, Region.III, Region.IV].map((r) => (
                <button key={r} onClick={() => { setInput(prev => ({ ...prev, region: r })); setShowRegionModal(false); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${input.region === r ? 'border-accent bg-accent/5' : 'border-slate-50 bg-white'}`}>
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase block">{REGION_DETAILS[r].name}</span>
                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{REGION_DETAILS[r].locations}</span>
                  </div>
                  <span className="text-sm font-black text-accent">{formatCurrency(REGION_DETAILS[r].wage)} ₫</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
