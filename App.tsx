
import React, { useState, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { CalculationInput, CalculationMode, Region } from './types';
import { performCalculation, formatCurrency, parseRawInput } from './services/calculator';
import { REGION_MIN_WAGE, REGION_DETAILS, DEDUCTIONS, MAX_INSURANCE_BASE, BASE_SALARY } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

// Helper: Chuẩn hóa chuỗi tiếng Việt (bỏ dấu) để so sánh
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

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
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [searchRegion, setSearchRegion] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => performCalculation(input), [input]);
  const insuranceBase = Math.min(result.gross, MAX_INSURANCE_BASE);

  // Auto focus input khi mở modal
  useEffect(() => {
    if (showRegionModal && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showRegionModal]);

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseRawInput(rawValue);
    if (numericValue > 100000000000) return;
    setInput(prev => ({ ...prev, salary: numericValue }));
    setSalaryDisplay(numericValue === 0 ? '' : formatCurrency(numericValue));
  };

  const handleCaptureImage = async () => {
    if (!resultsRef.current || isCapturing) return;
    setIsCapturing(true);
    document.body.classList.add('screenshot-mode');
    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));
      const canvas = await html2canvas(resultsRef.current, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });
      const link = document.createElement('a');
      link.download = `Vietnam-Salary-Report-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
    } finally {
      setIsCapturing(false);
      document.body.classList.remove('screenshot-mode');
    }
  };

  const pieData = [
    { name: 'Thực nhận', value: result.net, color: '#6366f1' },
    { name: 'Bảo hiểm', value: result.insurance.total, color: '#10b981' },
    { name: 'Thuế TNCN', value: result.tax, color: '#f43f5e' }
  ];

  // LOGIC TÌM KIẾM NÂNG CAO
  const searchResults = useMemo(() => {
    const normalizedSearch = removeAccents(searchRegion.toLowerCase()).trim();
    if (!normalizedSearch) {
      return { regions: [Region.I, Region.II, Region.III, Region.IV], matches: [] };
    }

    const searchTokens = normalizedSearch.split(/\s+/);
    const matchedRegions: Region[] = [];
    const specificMatches: { region: Region; text: string; source: string }[] = [];

    (Object.keys(REGION_DETAILS) as Region[]).forEach((region) => {
      const data = REGION_DETAILS[region];
      const normalizedName = removeAccents(data.name.toLowerCase());
      const normalizedLocations = removeAccents(data.locations.toLowerCase());
      
      // Kiểm tra khớp tên Vùng hoặc địa danh chung
      let isRegionMatch = searchTokens.every(token => 
        normalizedName.includes(token) || normalizedLocations.includes(token)
      );

      // Kiểm tra chi tiết từng quận/huyện
      data.details.forEach(detail => {
        const normalizedDetail = removeAccents(detail.toLowerCase());
        if (searchTokens.every(token => normalizedDetail.includes(token))) {
          isRegionMatch = true;
          specificMatches.push({ region, text: detail, source: data.name });
        }
      });

      if (isRegionMatch) {
        matchedRegions.push(region);
      }
    });

    return { regions: matchedRegions, matches: specificMatches.slice(0, 6) };
  }, [searchRegion]);

  // LOGIC HIGHLIGHT THÔNG MINH (Hỗ trợ tiếng Việt)
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Tạo regex pattern ánh xạ ký tự không dấu sang có dấu
    // Ví dụ: 'a' -> [aàáạảãâầấậẩẫăằắặẳẵ]
    const charMap: Record<string, string> = {
      'a': '[aàáạảãâầấậẩẫăằắặẳẵ]',
      'e': '[eèéẹẻẽêềếệểễ]',
      'i': '[iìíịỉĩ]',
      'o': '[oòóọỏõôồốộổỗơờớợởỡ]',
      'u': '[uùúụủũưừứựửữ]',
      'y': '[yỳýỵỷỹ]',
      'd': '[dđ]'
    };

    const tokens = removeAccents(query.toLowerCase()).trim().split(/\s+/);
    const pattern = tokens
      .map(t => t.split('').map(c => charMap[c] || c).join(''))
      .join('|');

    try {
      // Split text bằng capturing group để giữ lại phần khớp
      const regex = new RegExp(`(${pattern})`, 'gi');
      const parts = text.split(regex);
      
      return (
        <>
          {parts.map((part, i) => 
            // Các phần tử ở vị trí lẻ (1, 3, 5...) là phần match do capturing group
            regex.test(part) ? 
            <mark key={i} className="bg-brand-500/20 text-brand-700 px-0.5 rounded font-bold bg-transparent">{part}</mark> : 
            part
          )}
        </>
      );
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
      
      {/* SIDEBAR - CONTROL DECK */}
      <aside className="w-full lg:w-[380px] deck-gradient text-white flex flex-col z-50 no-print no-screenshot">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="material-icons text-xl">account_balance_wallet</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter">VIETNAM <span className="text-brand-500">SALARY</span></h1>
          </div>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Hệ thống dự toán lương 2026</p>
        </div>

        <div className="flex-grow p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Mode Switcher */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Phương thức tính</label>
            <div className="bg-white/5 p-1 rounded-2xl flex relative h-12">
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-500 rounded-xl transition-all duration-300 ${input.mode === CalculationMode.NET_TO_GROSS ? 'translate-x-full' : 'translate-x-0'}`}></div>
              <button onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.GROSS_TO_NET }))} className={`flex-1 text-[11px] font-black relative z-10 transition-colors ${input.mode === CalculationMode.GROSS_TO_NET ? 'text-white' : 'text-white/40'}`}>GROSS → NET</button>
              <button onClick={() => setInput(prev => ({ ...prev, mode: CalculationMode.NET_TO_GROSS }))} className={`flex-1 text-[11px] font-black relative z-10 transition-colors ${input.mode === CalculationMode.NET_TO_GROSS ? 'text-white' : 'text-white/40'}`}>NET → GROSS</button>
            </div>
          </div>

          {/* Salary Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Lương thỏa thuận ({input.mode.split('_')[0]})</label>
            <div className="relative group">
              <input 
                type="text" 
                value={salaryDisplay} 
                onChange={handleSalaryChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-black text-white focus:outline-none focus:border-brand-500 transition-all focus:ring-4 focus:ring-brand-500/10"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 font-black text-xl">₫</span>
            </div>
          </div>

          {/* Region Picker */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vùng Lương</label>
              <button onClick={() => setShowRegionModal(true)} className="text-[10px] text-brand-500 font-black uppercase hover:underline">Tra cứu vùng</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[Region.I, Region.II, Region.III, Region.IV].map(r => (
                <button key={r} onClick={() => setInput(prev => ({ ...prev, region: r }))} className={`py-3 rounded-xl font-black text-xs transition-all ${input.region === r ? 'bg-brand-500 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cấu hình nhân sự</label>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setInput(prev => ({ ...prev, isExpat: !prev.isExpat, isProbation: false }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${input.isExpat ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10'}`}>
                  <span className="material-icons text-xl">public</span>
                  <span className="text-[10px] font-black uppercase">Expat</span>
                </button>
                <button onClick={() => setInput(prev => ({ ...prev, isProbation: !prev.isProbation, isExpat: false }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${input.isProbation ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10'}`}>
                  <span className="material-icons text-xl">timer</span>
                  <span className="text-[10px] font-black uppercase">Thử việc</span>
                </button>
             </div>

             <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Người phụ thuộc</p>
                   <p className="text-lg font-black">{input.dependents} <span className="text-[10px] font-medium text-white/20">người</span></p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setInput(prev => ({ ...prev, dependents: Math.max(0, prev.dependents - 1) }))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><span className="material-icons">remove</span></button>
                   <button onClick={() => setInput(prev => ({ ...prev, dependents: prev.dependents + 1 }))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><span className="material-icons">add</span></button>
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/10">
          <button 
            onClick={handleCaptureImage}
            disabled={isCapturing}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
            <span className="material-icons">{isCapturing ? 'sync' : 'photo_camera'}</span>
            {isCapturing ? 'Đang xử lý...' : 'Xuất Báo Cáo HD'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT - THE REPORT */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none no-screenshot">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
          <div ref={resultsRef} className="max-w-5xl mx-auto w-full animate-report report-container relative overflow-hidden">
            <div className="export-watermark hidden uppercase">CONFIDENTIAL</div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
              <div>
                <span className="inline-block px-3 py-1 bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md mb-4">Official Estimation</span>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tightest">Personal Salary <span className="text-brand-500">Breakdown</span></h2>
                <p className="text-slate-400 font-bold mt-2">Dựa trên cơ sở pháp lý Nghị quyết 109/2025/QH15 áp dụng cho kỳ tính lương 2026.</p>
              </div>
              <div className="text-right md:min-w-[200px]">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ngày lập biểu</p>
                 <p className="text-sm font-black text-slate-900 uppercase">{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
              <div className="md:col-span-2 bg-white rounded-4xl p-10 shadow-premium border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lương thực nhận (NET)</span>
                  </div>
                  <div className="text-6xl font-black text-slate-900 tracking-tightest leading-none">
                    {formatCurrency(result.net)} <span className="text-2xl font-bold text-slate-300">₫</span>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black flex items-center gap-1">
                      <span className="material-icons text-xs">trending_up</span>
                      +{result.comparisonWith2025.increasePercentage.toFixed(1)}% vs 2025
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">Tăng {formatCurrency(result.comparisonWith2025.increase)} ₫/tháng</div>
                  </div>
                </div>
                
                <div className="w-48 h-48 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius="70%" outerRadius="95%" paddingAngle={8} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{((result.net / (result.gross + result.taxableAllowance)) * 100).toFixed(0)}%</span>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hiệu suất</span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-900 rounded-4xl p-10 text-white shadow-2xl flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Ngân sách doanh nghiệp</span>
                  <h4 className="text-2xl font-black tracking-tight">{formatCurrency(result.employerCost)} ₫</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Chi phí thực tế của DN</p>
                </div>
                <div className="pt-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase font-black">Mức tham chiếu</p>
                      <p className="text-sm font-bold">{formatCurrency(BASE_SALARY)} ₫</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/20 uppercase font-black">LTT Vùng {input.region}</p>
                      <p className="text-sm font-bold">{formatCurrency(REGION_MIN_WAGE[input.region])} ₫</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4xl shadow-premium border border-slate-100 overflow-hidden relative z-10">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bảng chi tiết khấu trừ</h3>
                  <span className="material-icons text-slate-200">receipt_long</span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng mục</th>
                        <th className="text-right px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Căn cứ / Tỷ lệ</th>
                        <th className="text-right px-10 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="px-10 py-8 font-extrabold text-slate-900">Tổng thu nhập (GROSS)</td>
                        <td className="px-10 py-8 text-right text-[10px] font-black text-slate-300 uppercase italic">Contracted Salary</td>
                        <td className="px-10 py-8 text-right font-black text-2xl text-slate-900 tracking-tight">{formatCurrency(result.gross)} ₫</td>
                      </tr>
                      
                      {!input.isProbation ? (
                        <>
                          <tr className="bg-brand-50/20"><td colSpan={3} className="px-10 py-2 text-[9px] font-black text-brand-500 uppercase tracking-[0.2em]">Bảo hiểm bắt buộc</td></tr>
                          <tr>
                            <td className="px-10 py-6 text-slate-600 font-bold flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><span className="material-icons text-xs">shield</span></span>
                              BH Xã hội (8%)
                            </td>
                            <td className="px-10 py-6 text-right text-slate-400 italic text-[11px]">{formatCurrency(insuranceBase)}</td>
                            <td className="px-10 py-6 text-right font-black text-slate-700">-{formatCurrency(result.insurance.bhxh)}</td>
                          </tr>
                          <tr>
                            <td className="px-10 py-6 text-slate-600 font-bold flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><span className="material-icons text-xs">medical_services</span></span>
                              BH Y tế (1.5%)
                            </td>
                            <td className="px-10 py-6 text-right text-slate-400 italic text-[11px]">Mức trần cao nhất</td>
                            <td className="px-10 py-6 text-right font-black text-slate-700">-{formatCurrency(result.insurance.bhyt)}</td>
                          </tr>
                          {!input.isExpat && <tr>
                            <td className="px-10 py-6 text-slate-600 font-bold flex items-center gap-3">
                              <span className="material-icons text-slate-200 text-sm">work_outline</span>
                              BH Thất nghiệp (1%)
                            </td>
                            <td className="px-10 py-6 text-right text-slate-400 italic text-[11px]">Vùng {input.region}</td>
                            <td className="px-10 py-6 text-right font-black text-slate-700">-{formatCurrency(result.insurance.bhtn)}</td>
                          </tr>}

                          <tr className="bg-rose-50/20"><td colSpan={3} className="px-10 py-2 text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Thuế thu nhập cá nhân</td></tr>
                          <tr>
                            <td className="px-10 py-6 text-slate-600 font-bold">Giảm trừ bản thân</td>
                            <td className="px-10 py-6 text-right text-slate-400 italic text-[11px]">Theo Luật mới 2026</td>
                            <td className="px-10 py-6 text-right font-black text-emerald-600">-{formatCurrency(DEDUCTIONS.PERSONAL_2026)}</td>
                          </tr>
                          {input.dependents > 0 && <tr>
                            <td className="px-10 py-6 text-slate-600 font-bold">Giảm trừ người phụ thuộc</td>
                            <td className="px-10 py-6 text-right text-slate-400 italic text-[11px]">{input.dependents} x {formatCurrency(DEDUCTIONS.DEPENDENT_2026)}</td>
                            <td className="px-10 py-6 text-right font-black text-emerald-600">-{formatCurrency(input.dependents * DEDUCTIONS.DEPENDENT_2026)}</td>
                          </tr>}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-10 py-16 text-center">
                            <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic leading-relaxed">Áp dụng thuế suất cố định 10% cho thu nhập trên 2.000.000 VNĐ<br/>đối với lao động thử việc / vãng lai</p>
                          </td>
                        </tr>
                      )}
                      
                      <tr className="bg-slate-900 text-white">
                        <td className="px-10 py-10 font-black uppercase tracking-widest">Thuế TNCN nộp ngân sách</td>
                        <td className="px-10 py-10 text-right text-white/30 italic text-[10px] font-bold uppercase">{input.isProbation ? 'Cố định 10%' : `Lũy tiến bậc ${result.taxBrackets.length}`}</td>
                        <td className="px-10 py-10 text-right font-black text-3xl tracking-tight">-{formatCurrency(result.tax)} ₫</td>
                      </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-200">
                    <span className="material-icons">verified</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Dữ liệu được xác thực</p>
                    <p className="text-xs font-bold text-slate-900">Vietnam Salary Pro v2.0</p>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 font-medium italic max-w-sm text-center md:text-right">Báo cáo dự toán mang tính tham khảo. Thu nhập thực tế có thể thay đổi tùy theo đặc thù BHXH tại từng đơn vị.</p>
            </div>
          </div>
        </div>
      </main>

      {/* REGION MODAL - ENHANCED SEARCH */}
      {showRegionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl no-print animate-fade-in">
          <div className="bg-white rounded-5xl w-full max-w-2xl shadow-huge overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 bg-slate-900 text-white relative">
              <h2 className="text-3xl font-black uppercase tracking-tightest">Tra cứu địa bàn 2026</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Xác định lương tối thiểu vùng theo khu vực làm việc</p>
              <button onClick={() => { setShowRegionModal(false); setSearchRegion(''); }} className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><span className="material-icons">close</span></button>
            </div>
            
            <div className="p-8 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
               <div className="relative">
                  <span className="material-icons absolute left-6 top-1/2 -translate-y-1/2 text-brand-500">search</span>
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Tìm nhanh: Quận 1, Ha Noi, Binh Duong..." 
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border-none shadow-premium focus:ring-4 focus:ring-brand-500/20 outline-none font-bold text-lg placeholder:text-slate-300 transition-all"
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                  />
                  {searchRegion && (
                    <button 
                      onClick={() => setSearchRegion('')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <span className="material-icons">cancel</span>
                    </button>
                  )}
               </div>

               {/* QUICK RESULTS MINI-LIST */}
               {searchRegion.trim() && searchResults.matches.length > 0 && (
                 <div className="mt-4 animate-report">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Kết quả gợi ý</p>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.matches.map((match, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { setInput(prev => ({ ...prev, region: match.region })); setShowRegionModal(false); setSearchRegion(''); }}
                          className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-brand-500 hover:text-brand-600 shadow-sm transition-all flex items-center gap-2 group"
                        >
                          <span className="material-icons text-[10px] text-slate-300 group-hover:text-brand-500">location_on</span>
                          <span>{highlightText(match.text.split(':')[0], searchRegion)}</span>
                          <span className="text-[9px] text-slate-300 uppercase font-black">{match.region}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {searchResults.regions.length > 0 ? (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {searchRegion ? `Tìm thấy ${searchResults.regions.length} vùng lương phù hợp` : 'Tất cả các vùng lương'}
                  </p>
                  {searchResults.regions.map((r) => (
                    <div key={r} className={`group rounded-4xl border-2 transition-all p-8 cursor-pointer ${input.region === r ? 'border-brand-500 bg-brand-50/50' : 'border-slate-100 bg-white hover:border-brand-500/30'}`}
                      onClick={() => { setInput(prev => ({ ...prev, region: r })); setShowRegionModal(false); setSearchRegion(''); }}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${input.region === r ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-100'}`}>
                              {REGION_DETAILS[r].name}
                            </span>
                            <h3 className="font-black text-slate-900 text-2xl tracking-tight">{formatCurrency(REGION_DETAILS[r].wage)} ₫</h3>
                          </div>
                          <div className="space-y-4">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl group-hover:bg-white transition-colors">
                              {highlightText(REGION_DETAILS[r].locations, searchRegion)}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                              {REGION_DETAILS[r].details.map((detail, idx) => (
                                <p key={idx} className="text-[11px] font-medium text-slate-500 leading-relaxed pl-4 border-l-2 border-slate-100 group-hover:border-brand-500/20">
                                  {highlightText(detail, searchRegion)}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                        {input.region === r && <span className="material-icons text-brand-500 mt-2">check_circle</span>}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner"><span className="material-icons text-5xl text-slate-200">location_off</span></div>
                  <div className="max-w-xs mx-auto">
                    <p className="text-slate-900 font-black uppercase text-xs tracking-widest">Không tìm thấy địa bàn này</p>
                    <p className="text-slate-400 text-xs mt-2 font-medium">Thử gõ tên tỉnh/thành phố lớn hơn (ví dụ: "Long An", "Đồng Nai") hoặc kiểm tra lại lỗi chính tả.</p>
                    <button 
                      onClick={() => setSearchRegion('')}
                      className="mt-6 text-brand-500 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      Xóa tìm kiếm để xem tất cả
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-slate-50 bg-slate-50 text-center">
               <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <span className="material-icons text-sm">info</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Cơ sở dữ liệu Nghị định Chính phủ 2026</p>
               </div>
               <p className="text-[9px] text-slate-300 font-medium italic">Việc xác định đúng vùng lương là nghĩa vụ của DN để đảm bảo quyền lợi tối thiểu cho NLĐ.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
