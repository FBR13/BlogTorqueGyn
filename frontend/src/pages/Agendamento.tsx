import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, AlertTriangle, CheckCircle, Clock, Sparkles, MapPin, Camera, Tag, User, Car, Loader2, XCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

// DADOS DA TABELA DE PREÇOS
const PHOTOGRAPHY_PACKAGES = [
  { id: 'basico', name: 'Básico', duration: '30 min', photos: '7 fotos', edit: 'Simples', extras: '1 local', price: 100, extraPhotoPrice: 15 },
  { id: 'intermediario', name: 'Intermediário', duration: '1 hora', photos: '12 fotos', edit: 'Avançada', extras: '2 locais', price: 200, extraPhotoPrice: 15 },
  { id: 'premium', name: 'Premium', duration: '2 horas', photos: '24 fotos', edit: 'Profissional', extras: '3 locais + rolling shots', price: 300, extraPhotoPrice: 15 },
  { id: 'completo', name: 'Completo', duration: '3 horas', photos: '30 fotos', edit: 'Premium', extras: '4 locais + rolling shots', price: 550, extraPhotoPrice: 15 }
];

export function Agendamento() {
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [acceptedExtras, setAcceptedExtras] = useState(false);

  // Estados do Cupom
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cnpj: '',
    message: ''
  });

  const formatCNPJ = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 14) v = v.substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    return v;
  };

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  };

  const validateCoupon = async () => {
    if (!couponInput) return;
    setCouponStatus('loading');

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        setCouponStatus('invalid');
        setDiscountPercent(0);
      } else {
        setCouponStatus('valid');
        setDiscountPercent(data.discount_percent);
      }
    } catch (err) {
      setCouponStatus('invalid');
      setDiscountPercent(0);
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage || !acceptedExtras) return;

    const packageDetails = PHOTOGRAPHY_PACKAGES.find(p => p.id === selectedPackage);
    const basePrice = packageDetails?.price || 0;
    const finalPrice = discountPercent > 0 ? basePrice - (basePrice * discountPercent / 100) : basePrice;

    const couponText = couponStatus === 'valid' ? `\n[CUPOM APLICADO: ${couponInput.toUpperCase()} - ${discountPercent}% OFF]` : '';
    const packageMessageContext = `[Pacote Escolhido: ${packageDetails?.name} - Valor Final: R$ ${finalPrice.toFixed(2)}]${couponText}\n` + formData.message;

    try {
      // 🚀 AQUI ESTÁ A CORREÇÃO: ENVIANDO OS VALORES PARA AS COLUNAS FINANCEIRAS DO BANCO!
      await supabase.from('bookings').insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        doc_type: docType,
        document: formData.cnpj,
        message: packageMessageContext,
        package_name: packageDetails?.name,
        base_price: basePrice,
        discount_applied: discountPercent,
        final_price: finalPrice,
        coupon_code: couponStatus === 'valid' ? couponInput.toUpperCase() : null
      }]);
    } catch (err) {
      console.error("Erro ao registrar agendamento no banco:", err);
    }

    const WHATSAPP_NUMBER = "5562991100118";

    let text = `*Agendamento de Ensaio - TorqueGyn*\n\n`;
    text += `*Nome:* ${formData.name}\n`;
    text += `*Telefone:* ${formData.phone}\n`;
    text += `*E-mail:* ${formData.email}\n`;
    text += `*Documento:* ${docType}\n`;

    if (docType === 'CNPJ') {
      text += `*CNPJ:* ${formData.cnpj}\n`;
    }

    text += `\n*PACOTE SELECIONADO:*\n`;
    text += `*${packageDetails?.name}* - R$ ${basePrice.toFixed(2)}\n`;

    if (couponStatus === 'valid') {
      text += `*Cupom Aplicado:* ${couponInput.toUpperCase()} (-${discountPercent}%)\n`;
      text += `*VALOR COM DESCONTO:* R$ ${finalPrice.toFixed(2)}\n`;
    }

    text += `*Ciente dos Extras:* Sim, R$ ${packageDetails?.extraPhotoPrice}/foto adicional\n`;
    text += `\n*Detalhes do Projeto:*\n${formData.message}`;

    const encodedText = encodeURIComponent(text);
    
    // ROTEAMENTO WHATSAPP MOBILE VS DESKTOP
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let whatsappUrl = '';

    if (isMobile) {
      whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    } else {
      whatsappUrl = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
    }

    window.open(whatsappUrl, '_blank');

    setFormData({ name: '', phone: '', email: '', cnpj: '', message: '' });
    setCouponInput('');
    setCouponStatus('idle');
    setDiscountPercent(0);
    setSelectedPackage(null);
    setAcceptedExtras(false);
  };

  const selectedPackageDetails = PHOTOGRAPHY_PACKAGES.find(p => p.id === selectedPackage);
  const calculatedPrice = selectedPackageDetails ? (selectedPackageDetails.price - (selectedPackageDetails.price * discountPercent / 100)) : 0;

  return (
    <>
      <Helmet>
        <title>TorqueGyn | Agendamento</title>
        <meta name="description" content="Agende seu ensaio fotográfico automotivo." />
      </Helmet>

      <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">

        {/* FUNDOS */}
        <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
        <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

        {/* CABEÇALHO */}
        <div className="pt-32 md:pt-40 pb-12 md:pb-16 px-6 border-b border-white/10 text-center relative overflow-hidden z-10">
          <h1 className="text-4xl md:text-8xl font-display font-bold tracking-tighter text-white">
            AGENDAR <span className="font-luxury italic text-gray-500 font-light lowercase">Ensaio</span>
          </h1>
          <p className="text-gray-400 mt-6 max-w-xl mx-auto text-sm md:text-base font-light tracking-wide">
            Preencha os dados abaixo para selecionarmos o melhor formato e darmos início ao seu projeto visual automotivo.
          </p>
        </div>

        {/* CONTEÚDO PRINCIPAL (GRID DIVIDIDO) */}
        <div className="container mx-auto px-6 py-16 md:py-24 z-10 relative max-w-7xl">
          <form onSubmit={handleWhatsAppSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* COLUNA ESQUERDA: DADOS E PROJETO */}
            <div className="lg:col-span-7 flex flex-col gap-12 md:gap-16">

              {/* BLOCO 01: DADOS */}
              <div className="bg-[#050505]/80 border border-white/5 p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan/50"></div>
                <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
                  <span className="text-neon-cyan font-display font-bold text-xs tracking-widest">01.</span>
                  <h3 className="text-white font-luxury tracking-widest uppercase text-xl flex items-center gap-3">
                    <User size={20} className="text-gray-500" /> Dados Pessoais
                  </h3>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pt-2 pb-4 text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="Nome Completo *" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative">
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} maxLength={15}
                        className="block w-full pt-2 pb-4 text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="Seu WhatsApp *" />
                    </div>
                    <div className="relative">
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pt-2 pb-4 text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="E-mail *" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setDocType('CPF')}
                        className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase font-bold rounded transition-all border ${docType === 'CPF' ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'}`}>Pessoa Física</button>
                      <button type="button" onClick={() => setDocType('CNPJ')}
                        className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase font-bold rounded transition-all border ${docType === 'CNPJ' ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'}`}>Pessoa Jurídica</button>
                    </div>
                  </div>

                  {docType === 'CNPJ' && (
                    <div className="relative animate-fade-in pt-2">
                      <input type="text" required value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })} maxLength={18}
                        className="block w-full pt-2 pb-4 text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="CNPJ *" />
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO 02: PROJETO E CUPOM */}
              <div className="bg-[#050505]/80 border border-white/5 p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan/50"></div>
                <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
                  <span className="text-neon-cyan font-display font-bold text-xs tracking-widest">02.</span>
                  <h3 className="text-white font-luxury tracking-widest uppercase text-xl flex items-center gap-3">
                    <Car size={20} className="text-gray-500" /> O Projeto
                  </h3>
                </div>

                <div className="space-y-8">
                  <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full p-6 text-base text-gray-300 bg-black border border-white/10 rounded-xl focus:outline-none focus:border-neon-cyan focus:bg-white/5 transition-colors placeholder:text-gray-600 resize-none"
                    placeholder="Fale um pouco sobre o veículo (marca, modelo) e qual a sua ideia para as fotos... *" />

                  <div className="relative pt-4 p-6 border border-white/10 rounded-xl bg-black/40">
                    <label className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-4 block flex items-center gap-2">
                      <Tag size={14} className="text-neon-cyan" /> Cupom Promocional
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border w-full transition-colors ${couponStatus === 'valid' ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan' : couponStatus === 'invalid' ? 'border-neon-red bg-neon-red/5 text-neon-red' : 'border-white/20 bg-transparent text-white focus-within:border-white'}`}>
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponStatus('idle');
                            setDiscountPercent(0);
                          }}
                          className="block w-full text-sm bg-transparent focus:outline-none placeholder:text-gray-600 tracking-widest"
                          placeholder="CÓDIGO (OPCIONAL)"
                        />
                        {couponStatus === 'valid' && <CheckCircle size={18} className="text-neon-cyan animate-fade-in" />}
                        {couponStatus === 'invalid' && <XCircle size={18} className="text-neon-red animate-fade-in" />}
                      </div>

                      <button
                        type="button"
                        onClick={validateCoupon}
                        disabled={!couponInput || couponStatus === 'loading'}
                        className="px-8 py-3 border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 w-full sm:w-auto shrink-0 flex items-center justify-center gap-2"
                      >
                        {couponStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponStatus === 'valid' && <span className="text-[10px] text-neon-cyan tracking-widest uppercase mt-3 block animate-fade-in">Cupom de {discountPercent}% aplicado com sucesso!</span>}
                    {couponStatus === 'invalid' && <span className="text-[10px] text-neon-red tracking-widest uppercase mt-3 block animate-fade-in">Cupom inválido ou expirado.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: PACOTE E CONFIRMAÇÃO (STICKY) */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">

              <div className="glass-dark bg-black/60 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                  <span className="text-neon-cyan font-display font-bold text-xs tracking-widest">03.</span>
                  <h3 className="text-white font-luxury tracking-widest uppercase text-xl flex items-center gap-3">
                    <Camera size={20} className="text-gray-500" /> Pacote
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {PHOTOGRAPHY_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        setAcceptedExtras(false);
                      }}
                      className={`text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedPackage === pkg.id
                          ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                          : 'border-white/10 bg-black/40 hover:border-white/30'
                        }`}
                    >
                      {selectedPackage === pkg.id && <div className="absolute top-0 left-0 w-1.5 h-full bg-neon-cyan"></div>}

                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-display font-bold uppercase tracking-widest ${selectedPackage === pkg.id ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-gray-300'}`}>
                          {pkg.name}
                        </span>
                        {selectedPackage === pkg.id && <CheckCircle size={16} className="text-neon-cyan" />}
                      </div>

                      <div className="flex items-end gap-3 mt-1">
                        <span className="text-2xl font-luxury text-white italic block">R$ {pkg.price}</span>
                        {couponStatus === 'valid' && (
                          <span className="text-xs font-luxury text-gray-500 italic line-through mb-1">R$ {pkg.price}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* RESUMO DO PEDIDO E ACEITE */}
                {selectedPackage && (
                  <div className="mt-6 border-t border-white/10 pt-6 animate-slide-up">
                    <div className="bg-black/50 p-5 rounded-xl border border-white/5 mb-6">
                      <h4 className="text-white font-display text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Resumo: {selectedPackageDetails?.name}</h4>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <span className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Clock size={12} className="text-neon-cyan/70" /> {selectedPackageDetails?.duration}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Camera size={12} className="text-neon-cyan/70" /> {selectedPackageDetails?.photos}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Sparkles size={12} className="text-neon-cyan/70" /> {selectedPackageDetails?.edit}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-gray-400">
                          <MapPin size={12} className="text-neon-cyan/70" /> {selectedPackageDetails?.extras}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 tracking-widest uppercase">Valor Final</span>
                        <span className="text-xl font-luxury text-neon-cyan italic">R$ {calculatedPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={acceptedExtras}
                          onChange={(e) => setAcceptedExtras(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border border-white/20 rounded-sm bg-black/50 checked:bg-neon-red checked:border-neon-red transition-all cursor-pointer hover:border-neon-red"
                        />
                        <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-[11px] text-gray-400 leading-relaxed select-none group-hover:text-gray-300 transition-colors">
                        <strong className="text-white flex items-center gap-1.5 mb-1"><AlertTriangle size={12} className="text-neon-red" /> Termo de Responsabilidade</strong>
                        Estou ciente que fotos além da cota custam <strong className="text-white">R$ {selectedPackageDetails?.extraPhotoPrice},00/cada</strong>. Ausência ou cancelamento no dia do ensaio gera taxa de <strong className="text-white">R$ 25,00</strong>.
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* BOTÃO FINAL CHECKOUT */}
              <button
                type="submit"
                disabled={!selectedPackage || !acceptedExtras}
                className="w-full flex items-center justify-between bg-neon-cyan text-black px-8 py-6 hover:bg-[#00d5e6] transition-all duration-300 rounded-xl font-bold shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-neon-cyan"
              >
                <span className="text-[11px] tracking-[0.2em] uppercase">
                  {!selectedPackage
                    ? 'Selecione um Pacote'
                    : !acceptedExtras
                      ? 'Aceite os Termos'
                      : 'Finalizar no WhatsApp'}
                </span>
                <Send size={18} className={`transition-transform ${selectedPackage && acceptedExtras ? 'group-hover:translate-x-2 group-hover:-translate-y-1' : ''}`} />
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}