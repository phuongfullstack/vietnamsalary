
import React, { useState, useMemo, ChangeEvent } from 'react';
import { CalculationInput, CalculationMode, Region } from './types';
import { performCalculation, formatCurrency, parseRawInput } from './services/calculator';
import { REGION_MIN_WAGE, REGION_DETAILS, DEDUCTIONS, MAX_INSURANCE_BASE } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell as ReCell } from 'recharts';

const App: React.FC = () => {
  const [input, setInput] = useState<CalculationInput>({
    mode: CalculationMode.GROSS_TO_NET,
    salary: 35000000,
    dependents: 0,
    region: Region.I,
    isExpat: false,
    isProbation: false
  });

  const [salaryDisplay, setSalaryDisplay] = useState<string>(formatCurrency(35000000));
  const [showRegionModal, setShowRegionModal] = useState(false);

  const result = useMemo(() => performCalculation(input), [input]);
  const [expandedFormula, setExpandedFormula] = useState(true);

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseRawInput(rawValue);
    
    if (numericValue > 100000000000) return;

    setInput(prev => ({ ...prev, salary: numericValue }));
    setSalaryDisplay(numericValue === 0 ? '' : formatCurrency(numericValue));
  };

  const pieData = [
    { name: 'Thực nhận', value: result.net, color: '#2b6cee' },
    { name: 'Bảo hiểm', value: result.insurance.total, color: '#10b981' },
    { name: 'Thuế', value: result.tax, color: '#94a3b8' }
  ];

  const barData = [
    { year: '2025', value: result.comparisonWith2025.net2025, label: formatCurrency(result.comparisonWith2025.net2025) },
    { year: '2026', value: result.net, label: formatCurrency(result.net) }
  ];

  const netRate = result.gross > 0 ? ((result.net / result.gross) * 100).toFixed(0) : "0";

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons">calculate</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Tính Lương One-Page 2026</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Luật 109/2025/QH15 chính thức
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Hướng dẫn</button>
            <div className="w-px h-6 bg-slate-200"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm hover:bg-slate-50 transition-colors">
              <span className="material-icons text-lg">language</span>
              <span>Tiếng Việt</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Input Section */}
          <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit sticky top-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-icons text-primary">tune</span>
                Thông tin đầu vào
              </h2>
              <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
                <button 
                  onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.GROSS_TO_NET }))}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${input.mode === CalculationMode.GROSS_TO_NET ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Gross → Net
                </button>
                <button 
                  onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.NET_TO_GROSS }))}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${input.mode === CalculationMode.NET_TO_GROSS ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Net → Gross
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Lương tháng (VND)</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={salaryDisplay}
                      onChange={handleSalaryChange}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none font-black text-xl text-slate-900 shadow-inner group-hover:bg-slate-100/50 transition-all" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black select-none text-lg">₫</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Người phụ thuộc</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-hidden">
                    <button 
                      onClick={() => setInput(prev => ({ ...prev, dependents: Math.max(0, prev.dependents - 1) }))}
                      className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-all"
                    >
                      <span className="material-icons">remove</span>
                    </button>
                    <input 
                      className="flex-1 text-center bg-transparent border-none focus:ring-0 font-black text-xl text-slate-900" 
                      readOnly 
                      value={input.dependents} 
                    />
                    <button 
                      onClick={() => setInput(prev => ({ ...prev, dependents: prev.dependents + 1 }))}
                      className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-all"
                    >
                      <span className="material-icons">add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Vùng lương tối thiểu</label>
                    <button 
                      onClick={() => setShowRegionModal(true)}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1"
                    >
                      <span className="material-icons text-[12px]">search</span>
                      Tra cứu vùng
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[Region.I, Region.II, Region.III, Region.IV].map((r) => (
                      <button
                        key={r}
                        onClick={() => setInput(prev => ({ ...prev, region: r }))}
                        className={`flex items-center justify-center py-2.5 rounded-xl border text-sm font-black transition-all ${input.region === r ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Căn cứ 2026 (Nghị định 293)</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(REGION_MIN_WAGE[input.region])} ₫</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium italic">
                      {REGION_DETAILS[input.region].locations.substring(0, 100)}...
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700">Người nước ngoài (Expat)</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={input.isExpat}
                        onChange={(e) => setInput(prev => ({ ...prev, isExpat: e.target.checked }))}
                      />
                      <div className="w-12 h-6.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">Thử việc/Vãng lai</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Thuế khoán 10%</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={input.isProbation}
                        onChange={(e) => setInput(prev => ({ ...prev, isProbation: e.target.checked }))}
                      />
                      <div className="w-12 h-6.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-warning shadow-inner"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col items-center justify-start relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-success to-primary"></div>
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">Lương Thực Nhận (Net)</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400">LUẬT 2026</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-sm shadow-success/50"></span>
                </div>
              </div>

              <div className="text-5xl font-black text-primary mb-2 tracking-tight text-center break-all selection:bg-primary/20">{formatCurrency(result.net)}</div>
              <div className="text-[10px] text-slate-400 font-black mb-8 text-center tracking-[0.3em] uppercase">VND / Tháng</div>

              {/* Increase Banner */}
              <div className="w-full bg-slate-50 rounded-2xl p-5 mb-8 relative group transition-all duration-300 border border-slate-100 shadow-inner">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-xl shadow-emerald-500/30 flex items-center gap-2 whitespace-nowrap border-2 border-white">
                    <span className="material-icons text-lg">auto_awesome</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">Tăng thêm: +{formatCurrency(result.comparisonWith2025.increase)} ₫</span>
                  </div>
                </div>

                <div className="h-40 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 900 }} />
                      <RechartsTooltip 
                        cursor={{fill: 'rgba(255,255,255,0.5)'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[11px] py-2 px-4 rounded-xl shadow-2xl font-black border border-white/10">
                                {formatCurrency(payload[0].value as number)} ₫
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                        {barData.map((entry, index) => (
                          <ReCell key={`cell-${index}`} fill={index === 1 ? '#10b981' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-[11px] font-black text-slate-400 mt-3 uppercase tracking-tighter">
                  <div className="flex flex-col items-center">
                    <span>2025</span>
                    <span className="text-slate-500">{(result.comparisonWith2025.net2025 / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-slate-900 font-black">2026</span>
                    <span className="text-emerald-600">{(result.net / 1000000).toFixed(1)}M <span className="text-success ml-1">+{result.comparisonWith2025.increasePercentage.toFixed(1)}%</span></span>
                  </div>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="relative w-52 h-52 mb-8 mt-auto group transition-transform duration-500 hover:scale-105">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Tỷ lệ Net</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">{netRate}%</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 py-2 px-6 rounded-full border border-slate-100">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Bracket Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span>Biểu thuế lũy tiến 2026</span>
                <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                  {input.isProbation ? 'THUẾ KHOÁN 10%' : `BẬC ${result.taxBrackets.length > 0 ? result.taxBrackets.length : 0} / 5`}
                </span>
              </h3>
              <div className="relative pt-6 pb-2 px-2">
                <div className="absolute top-[35px] left-0 w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-success via-primary to-primary transition-all duration-1000 ease-out"
                    style={{ width: input.isProbation ? '100%' : `${Math.min(100, (result.taxableIncome / 100000000) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between relative">
                  {[5, 10, 20, 30, 35].map((rate, i) => (
                    <div key={rate} className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border-2 border-white shadow-xl z-10 transition-all duration-500 ${result.taxBrackets.some(b => b.rate === rate / 100) || (input.isProbation && rate === 10) ? 'bg-primary scale-125 ring-8 ring-primary/5' : 'bg-slate-200 group-hover:bg-slate-300'}`}></div>
                      <span className={`text-[11px] font-black transition-colors ${result.taxBrackets.some(b => b.rate === rate / 100) || (input.isProbation && rate === 10) ? 'text-primary' : 'text-slate-400'}`}>{rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-6 text-center font-black uppercase tracking-[0.2em] bg-slate-50 py-2 rounded-xl">
                {result.taxableIncome > 0 
                  ? `Thu nhập tính thuế: ${formatCurrency(result.taxableIncome)} ₫`
                  : input.isProbation ? 'KHẤU TRỪ TẠI NGUỒN (THỬ VIỆC)' : 'CHƯA ĐẠT MỨC CHỊU THUẾ'}
              </p>
            </div>
          </section>

          {/* Details Section */}
          <section className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                <span className="material-icons text-primary">analytics</span>
                Phân tích lương chi tiết 2026
              </h2>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-icons text-sm">schedule</span>
                Áp dụng 01/01/2026
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar mb-8 flex-grow">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Khoản mục</th>
                    <th className="text-right pb-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Cơ sở tính</th>
                    <th className="text-right pb-4 font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Số tiền (₫)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-black text-slate-800 text-base">Lương Gross</td>
                    <td className="text-right py-5 text-slate-400 font-bold uppercase text-[10px]">Hợp đồng</td>
                    <td className="text-right py-5 font-black text-slate-900 text-lg">{formatCurrency(result.gross)}</td>
                  </tr>
                  {!input.isProbation && (
                    <>
                      <tr>
                        <td className="py-2 pt-8 text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2" colSpan={3}>
                          <span className="w-4 h-0.5 bg-primary/20"></span>
                          Bảo hiểm trích đóng
                        </td>
                      </tr>
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4 text-slate-700 border-l-4 border-success/40 font-bold">BH Xã hội</td>
                        <td className="text-right py-4 text-[10px] text-slate-400 font-black uppercase">8% (Max {formatCurrency(MAX_INSURANCE_BASE)})</td>
                        <td className="text-right py-4 font-bold text-slate-800">{formatCurrency(result.insurance.bhxh)}</td>
                      </tr>
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4 text-slate-700 border-l-4 border-success/40 font-bold">BH Y tế</td>
                        <td className="text-right py-4 text-[10px] text-slate-400 font-black uppercase">1.5% (Max {formatCurrency(MAX_INSURANCE_BASE)})</td>
                        <td className="text-right py-4 font-bold text-slate-800">{formatCurrency(result.insurance.bhyt)}</td>
                      </tr>
                      {!input.isExpat && (
                        <tr className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 pl-4 text-slate-700 border-l-4 border-success/40 font-bold">BH Thất nghiệp</td>
                          <td className="text-right py-4 text-[10px] text-slate-400 font-black uppercase">1% (Vùng {input.region})</td>
                          <td className="text-right py-4 font-bold text-slate-800">{formatCurrency(result.insurance.bhtn)}</td>
                        </tr>
                      )}
                    </>
                  )}
                  <tr>
                    <td className="py-2 pt-8 text-[11px] font-black text-warning uppercase tracking-[0.3em] flex items-center gap-2" colSpan={3}>
                      <span className="w-4 h-0.5 bg-warning/20"></span>
                      Các khoản giảm trừ
                    </td>
                  </tr>
                  {!input.isProbation && (
                    <>
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-slate-700 font-bold">Giảm trừ bản thân</td>
                        <td className="text-right py-4 text-[10px] text-slate-400 font-black uppercase">Mức mới 2026</td>
                        <td className="text-right py-4 font-black text-success">-{formatCurrency(DEDUCTIONS.PERSONAL_2026)}</td>
                      </tr>
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-slate-700 font-bold">Giảm trừ phụ thuộc</td>
                        <td className="text-right py-4 text-[10px] text-slate-400 font-black uppercase">{input.dependents} Người</td>
                        <td className="text-right py-4 font-black text-success">-{formatCurrency(input.dependents * DEDUCTIONS.DEPENDENT_2026)}</td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-slate-50/50 font-black border-t border-slate-100">
                    <td className="py-5 text-slate-900 font-black pl-2">Thu nhập tính thuế</td>
                    <td className="text-right py-5 italic text-slate-400 text-xs font-medium">Đối tượng nộp thuế</td>
                    <td className="text-right py-5 font-black text-slate-900 text-lg pr-2">{formatCurrency(result.taxableIncome)}</td>
                  </tr>
                  <tr className="bg-primary/5 font-black border-t-2 border-primary/30">
                    <td className="py-6 text-primary font-black uppercase tracking-widest pl-3 text-base">Thuế TNCN nộp</td>
                    <td className="text-right py-6 text-[11px] text-primary font-black uppercase tracking-tighter">
                      {input.isProbation ? 'KHOÁN 10% (THỬ VIỆC)' : `LŨY TIẾN BẬC ${result.taxBrackets.length}`}
                    </td>
                    <td className="text-right py-6 text-primary font-black text-2xl pr-3">{formatCurrency(result.tax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <button 
                onClick={() => setExpandedFormula(!expandedFormula)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 text-xs font-black text-slate-600 uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-icons text-sm">history_edu</span>
                  Chi tiết 5 bậc thuế Luật 109
                </div>
                <span className="material-icons text-slate-400 transition-transform duration-500" style={{ transform: expandedFormula ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
              </button>
              {expandedFormula && (
                <div className="p-5 bg-white text-[11px] space-y-4 border-t border-slate-100 animate-fadeIn">
                  {result.taxBrackets.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-bold uppercase tracking-widest">Chưa phát sinh thuế TNCN</div>
                  ) : (
                    result.taxBrackets.map((bracket, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{bracket.label}</span>
                          <span className="text-[9px] text-slate-300 font-bold">Thuế suất {(bracket.rate * 100).toFixed(0)}%</span>
                        </div>
                        <span className="font-black text-slate-800 text-sm tracking-tight">{formatCurrency(bracket.amount)} ₫</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-4 mt-2 font-black">
                    <span className="text-slate-900 uppercase tracking-widest text-xs">Tổng số thuế</span>
                    <span className="text-primary text-base underline decoration-primary/30 underline-offset-4">{formatCurrency(result.tax)} ₫</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">
                <span>Chi phí thực của DN (Cost)</span>
                <span className="font-black text-slate-900 text-base tracking-normal bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">{formatCurrency(result.employerCost)} ₫</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Region Lookup Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className