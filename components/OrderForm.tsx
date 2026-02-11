
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
// Add ArrowRight to the imports
import { 
  Package, 
  DollarSign, 
  Palette, 
  Ruler, 
  Link as LinkIcon, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ReceiptText, 
  ShieldCheck, 
  X, 
  MapPin, 
  Phone, 
  Hash,
  ArrowRight
} from 'lucide-react';

interface OrderFormProps {
  user: User;
  onSuccess?: () => void;
}

const WILAYAS = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة", "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو", "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة", "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
  "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس", "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة",
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة", "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - المغير", "50 - المنيعة",
  "51 - أولاد جلال", "52 - برج باجي مختار", "53 - بني عباس", "54 - تيميمون", "55 - تقرت", "56 - جانت", "57 - عين صالح", "58 - عين قزام"
];

const OrderForm: React.FC<OrderFormProps> = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const [productUrl, setProductUrl] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [priceUsd, setPriceUsd] = useState<string>('');
  const [wilaya, setWilaya] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [priceDzd, setPriceDzd] = useState<number>(0);
  const [totalPriceDzd, setTotalPriceDzd] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | 'rls-error' | null; message: string }>({ type: null, message: '' });

  const EXCHANGE_RATE = 250;
  const COMMISSION_FEE = 500; 
  const BUCKET_NAME = 'order-assets';

  useEffect(() => {
    const usd = parseFloat(priceUsd);
    if (!isNaN(usd)) {
      const subtotal = usd * EXCHANGE_RATE;
      setPriceDzd(subtotal);
      setTotalPriceDzd(subtotal + COMMISSION_FEE);
    } else {
      setPriceDzd(0);
      setTotalPriceDzd(0);
    }
  }, [priceUsd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const isFormValid = () => {
    return (
      productUrl && 
      color && 
      size && 
      priceUsd && 
      wilaya && 
      phone && 
      postalCode && 
      screenshot && 
      agreedToTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setStatus({ type: 'error', message: 'يرجى ملء جميع الحقول ورفع الصورة والموافقة على الشروط' });
      return;
    }

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const fileExt = screenshot!.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, screenshot!, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const { data, error: insertError } = await supabase.from('orders').insert([
        {
          user_id: user.id,
          product_url: productUrl,
          color,
          size,
          price_usd: parseFloat(priceUsd),
          price_dzd: priceDzd,
          commission_dzd: COMMISSION_FEE,
          total_price_dzd: totalPriceDzd,
          screenshot_url: publicUrl,
          status: 'Pending',
          user_email: user.email,
          agreed_to_terms: true,
          wilaya,
          phone_number: phone,
          postal_code: postalCode
        },
      ]).select();

      if (insertError) throw insertError;

      // Navigate to checkout with the new order ID
      if (data && data[0]) {
        navigate(`/checkout/${data[0].id}`);
      }

      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error("Order Submission Error:", err);
      setStatus({ 
        type: 'error', 
        message: err.message || 'حدث خطأ غير متوقع' 
      });
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <Package size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-right">تفاصيل الطلب</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5 text-right">Fill in product information</p>
        </div>
      </div>

      {status.type && (
        <div className={`mb-8 p-5 rounded-3xl flex items-start gap-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
          'bg-red-50 border-red-100 text-red-800'
        }`} dir="rtl">
          <div className="shrink-0 mt-0.5">
            {status.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="font-bold text-lg leading-tight">
              {status.type === 'success' ? 'تمت العملية' : 'تنبيه'}
            </span>
            <span className="text-sm font-medium opacity-90">{status.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Fields */}
          <div className="space-y-2 text-right md:col-span-2">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">رابط المنتج</label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="url" required value={productUrl} onChange={(e) => setProductUrl(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">اللون المختار</label>
            <div className="relative group">
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text" required value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="Red, Blue..."
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">المقاس</label>
            <div className="relative group">
              <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text" required value={size} onChange={(e) => setSize(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="XL, 42..."
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">السعر (بالدولار $)</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="number" step="0.01" required value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">الولاية</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <select
                required
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold appearance-none cursor-pointer"
              >
                <option value="" disabled>اختر ولايتك</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">رابع الهاتف</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="06 / 07 / 05..."
              />
            </div>
          </div>

          <div className="space-y-2 text-right md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">الرمز البريدي</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text" maxLength={5} required value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300 placeholder:font-medium"
                placeholder="00000"
              />
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden" dir="rtl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <ReceiptText size={120} className="text-white" />
          </div>
          
          <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            تفاصيل الدفع النهائية
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-sm font-bold">سعر المنتج ({priceUsd || 0} $ × 250):</span>
              <span className="text-white font-mono font-bold">{priceDzd.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-sm font-bold">رسوم الخدمة (عمولة ثابتة):</span>
              <span className="text-emerald-400 font-mono font-bold">+{COMMISSION_FEE} دج</span>
            </div>
            <div className="h-[1px] bg-slate-800 my-2"></div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">المبلغ الإجمالي المستحق</p>
                <h4 className="text-4xl font-black text-white tracking-tighter">
                  {totalPriceDzd.toLocaleString()} <span className="text-xl text-indigo-500">DZD</span>
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2 text-right">
          <label className="block text-sm font-black text-slate-700 mb-1 px-1">صورة المنتج (Screenshot)</label>
          <label
            htmlFor="screenshot-upload"
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-12 h-12 mb-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:-translate-y-1" />
              <p className="text-sm font-black text-slate-600 group-hover:text-indigo-600 transition-colors px-6">
                {screenshot ? screenshot.name : 'اسحب صورة المنتج هنا أو انقر للاختيار'}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Supports PNG, JPG (Max 5MB)</p>
            </div>
            <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-center justify-end gap-3 px-2 py-1" dir="rtl">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
          />
          <label htmlFor="terms-checkbox" className="text-sm font-bold text-slate-600 cursor-pointer select-none text-right">
            أوافق على <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 hover:underline font-black">الشروط والأحكام</button> الخاصة بالمنصة
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading || !isFormValid()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-indigo-100 active:scale-[0.98] group"
        >
          {uploading ? (
            <Loader2 className="animate-spin" size={26} />
          ) : (
            <span className="text-xl tracking-tight flex items-center gap-2">
              المتابعة للدفع
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      {/* Terms and Conditions Modal (Keep as is) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
               <div className="flex items-center gap-3">
                 <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
                    <ShieldCheck size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight text-right">شروط وأحكام الاستخدام</h2>
               </div>
               <button 
                 onClick={() => setShowTermsModal(false)}
                 className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
               >
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                <p className="text-indigo-900 font-bold leading-relaxed text-center">يرجى قراءة الشروط التالية بعناية قبل المتابعة في تقديم طلبك.</p>
              </div>

              <div className="space-y-5">
                {[
                  "المنصة وسيط شراء ولا تملك السلع.",
                  "العميل مسؤول عن صحة الرابط والمقاسات المختارة.",
                  "غير مسؤولين عن الحجز الجمركي أو الطرود المفقودة بعد دخولها الجزائر.",
                  "المبالغ المدفوعة غير قابلة للاسترداد بعد تنفيذ عملية الشراء من الموقع الأصلي."
                ].map((term, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 font-bold text-base leading-relaxed text-right">{term}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-50">
              <button 
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
              >
                لقد قرأت الشروط وأوافق عليها
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;