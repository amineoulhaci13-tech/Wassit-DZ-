
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '../context/LanguageContext';
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
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", "06 - Bejaia", "07 - Biskra", "08 - Bechar", "09 - Blida", "10 - Bouira",
  "11 - Tamanghasset", "12 - Tebessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Setif", "20 - Saida",
  "21 - Skikda", "22 - Sidi Bel Abbes", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Medea", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdes", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Ain Defla", "45 - Naama", "46 - Ain Temouchent", "47 - Ghardaia", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa",
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Beni Abbes", "54 - Timimoun", "55 - Touggourt", "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
];

const OrderForm: React.FC<OrderFormProps> = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

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
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

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
    return (productUrl && color && size && priceUsd && wilaya && phone && postalCode && screenshot && agreedToTerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setStatus({ type: 'error', message: t.error_fill_all });
      return;
    }

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const fileExt = screenshot!.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, screenshot!);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      const { data, error: insertError } = await supabase.from('orders').insert([
        {
          user_id: user.id, product_url: productUrl, color, size, price_usd: parseFloat(priceUsd), price_dzd: priceDzd,
          commission_dzd: COMMISSION_FEE, total_price_dzd: totalPriceDzd, screenshot_url: publicUrl, status: 'Pending',
          user_email: user.email, agreed_to_terms: true, wilaya, phone_number: phone, postal_code: postalCode
        },
      ]).select();

      if (insertError) throw insertError;
      if (data && data[0]) navigate(`/checkout/${data[0].id}`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Order Submission Error:", err);
      setStatus({ type: 'error', message: err.message || t.error_occurred });
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className={`flex items-center justify-between mb-10 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><Package size={24} /></div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.order_details}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{t.fill_info}</p>
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {status.type && (
        <div className={`mb-8 p-5 rounded-3xl flex items-start gap-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <div className="shrink-0 mt-0.5">{status.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}</div>
          <div className={`flex flex-col gap-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-lg leading-tight">{status.type === 'success' ? t.success_title : t.alert_title}</span>
            <span className="text-sm font-medium opacity-90">{status.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Link */}
          <div className={`space-y-2 md:col-span-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.product_link}</label>
            <div className="relative group">
              <LinkIcon className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="url" required value={productUrl} onChange={(e) => setProductUrl(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder={t.placeholder_link} />
            </div>
          </div>

          {/* Color */}
          <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.color}</label>
            <div className="relative group">
              <Palette className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="text" required value={color} onChange={(e) => setColor(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder={t.placeholder_color} />
            </div>
          </div>

          {/* Size */}
          <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.size}</label>
            <div className="relative group">
              <Ruler className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="text" required value={size} onChange={(e) => setSize(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder={t.placeholder_size} />
            </div>
          </div>

          {/* Price USD */}
          <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.price_usd}</label>
            <div className="relative group">
              <DollarSign className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="number" step="0.01" required value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder="0.00" />
            </div>
          </div>

          {/* Wilaya Selection */}
          <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.wilaya}</label>
            <div className="relative group">
              <MapPin className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <select required value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold appearance-none cursor-pointer`}>
                <option value="" disabled>{t.select_wilaya}</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.phone}</label>
            <div className="relative group">
              <Phone className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder={t.placeholder_phone} />
            </div>
          </div>

          {/* Postal Code */}
          <div className={`space-y-2 lg:col-span-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.postal_code}</label>
            <div className="relative group">
              <Hash className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
              <input type="text" maxLength={5} required value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className={`w-full ${isRtl ? 'pl-12 pr-5' : 'pr-12 pl-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-black font-bold placeholder:text-slate-300`}
                placeholder="00000" />
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} p-4 opacity-5 pointer-events-none`}><ReceiptText size={120} className="text-white" /></div>
          <h3 className={`text-white font-black text-lg mb-6 flex items-center gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}><div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>{t.payment_details}</h3>
          <div className="space-y-4">
            <div className={`flex justify-between items-center text-slate-400 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-sm font-bold">{t.product_price_calc}:</span>
              <span className="text-white font-mono font-bold">{priceDzd.toLocaleString()} {t.currency}</span>
            </div>
            <div className={`flex justify-between items-center text-slate-400 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-sm font-bold">{t.service_fee}:</span>
              <span className="text-emerald-400 font-mono font-bold">+{COMMISSION_FEE} {t.currency}</span>
            </div>
            <div className="h-[1px] bg-slate-800 my-2"></div>
            <div className={`flex justify-between items-end ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.total_due}</p>
                <h4 className="text-4xl font-black text-white">{totalPriceDzd.toLocaleString()} <span className="text-xl text-indigo-500">{t.currency}</span></h4>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Upload */}
        <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
          <label className="block text-sm font-black text-slate-700 mb-1 px-1">{t.screenshot}</label>
          <label
            htmlFor="screenshot-upload"
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-12 h-12 mb-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:-translate-y-1" />
              <p className="text-sm font-black text-slate-600 group-hover:text-indigo-600 transition-colors px-6">
                {screenshot ? screenshot.name : t.upload_hint}
              </p>
            </div>
            <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className={`flex items-center gap-3 px-2 py-1 ${isRtl ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
          />
          <label htmlFor="terms-checkbox" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
             {t.terms_agree.split(t.terms_link)[0]}
             <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 hover:underline font-black">{t.terms_link}</button>
             {t.terms_agree.split(t.terms_link)[1]}
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={uploading || !isFormValid()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all disabled:opacity-40 shadow-xl active:scale-[0.98] group">
          {uploading ? <Loader2 className="animate-spin" size={26} /> : (
            <span className="text-xl tracking-tight flex items-center gap-2">
              {t.submit}
              <ArrowRight size={22} className={`${isRtl ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:translate-x-1'} transition-transform`} />
            </span>
          )}
        </button>
      </form>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className={`p-8 border-b border-slate-50 flex items-center justify-between bg-white ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
               <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                 <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600"><ShieldCheck size={24} /></div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.terms_link}</h2>
               </div>
               <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                <p className={`text-indigo-900 font-bold leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>{t.terms_intro}</p>
              </div>
              <div className="space-y-5">
                {[t.term_1, t.term_2, t.term_3, t.term_4].map((term, index) => (
                  <div key={index} className={`flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="mt-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">{index + 1}</div>
                    <p className={`text-slate-700 font-bold text-base leading-relaxed flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{term}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-50">
              <button 
                onClick={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {t.terms_accept_btn}
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
