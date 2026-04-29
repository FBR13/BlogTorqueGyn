import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, AlertTriangle, CheckCircle, Clock, Sparkles, MapPin, Camera, Tag, User, Car, Loader2, XCircle, Crosshair } from 'lucide-react';
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
        name: '', phone: '', email: '', cnpj: '', message: ''
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

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
        } else {
            window.location.href = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
            setTimeout(() => {
                window.open(`https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`, '_blank');
            }, 2000);
        }

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
                <meta name="description" content="Configure os detalhes do seu projeto visual automotivo." />
            </Helmet>

            {/* ADICIONADO overflow-x-hidden PARA BLOQUEAR SCROLL HORIZONTAL NO MOBILE */}
            <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0 overflow-x-hidden">

                {/* BACKGROUNDS */}
                <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
                <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/15 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

                {/* HERO HEADER */}
                <section className="relative flex flex-col justify-center px-4 md:px-6 pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/10 overflow-hidden w-full">
                    <div className="container mx-auto relative z-10 max-w-7xl">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in">
                            <Crosshair size={14} className="text-neon-red animate-spin-slow md:w-4 md:h-4" />
                            <span className="text-[9px] md:text-[10px] tracking-[0.4em] font-display font-bold uppercase text-neon-red text-glow-red">
                                Setup de Projeto
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-[90px] leading-[1.1] text-white mb-4 md:mb-8 animate-slide-up break-words">
                            <span className="font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600 uppercase block text-shadow-xl">
                                AGENDAMENTO
                            </span>
                            <span className="font-luxury italic text-gray-400 font-light block transform -translate-y-1 md:-translate-y-2 mt-1 md:mt-0">
                                Automotivo
                            </span>
                        </h1>

                        <p className="text-xs sm:text-sm md:text-lg text-gray-400 max-w-xl leading-relaxed font-light animate-slide-up border-l-2 border-neon-red pl-4 md:pl-6 mt-4 md:mt-0" style={{ animationDelay: '0.2s' }}>
                            Configure os detalhes abaixo para selecionarmos o melhor formato e darmos início ao registro da sua máquina.
                        </p>
                    </div>
                </section>

                {/* CONTEÚDO PRINCIPAL (FORMULÁRIO) */}
                <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 z-10 relative max-w-7xl w-full">
                    <form onSubmit={handleWhatsAppSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

                        {/* COLUNA ESQUERDA: DADOS E PROJETO */}
                        <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 w-full">

                            {/* BLOCO 01: DADOS */}
                            <div className="bg-black/60 backdrop-blur-md border border-white/5 p-6 md:p-10 rounded-xl relative shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-full">
                                <div className="flex items-center gap-3 mb-8 md:mb-10 border-b border-white/10 pb-4 md:pb-6">
                                    <span className="text-neon-cyan font-display font-bold text-[9px] md:text-[10px] tracking-[0.3em]">01.</span>
                                    <h3 className="text-white font-luxury tracking-widest uppercase text-lg md:text-xl flex items-center gap-2 md:gap-3">
                                        <User size={16} className="text-gray-500 md:w-5 md:h-5" /> Dados Pessoais
                                    </h3>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    <div className="relative">
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full pt-2 pb-3 md:pb-4 text-sm md:text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="Nome Completo *" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="relative">
                                            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} maxLength={15}
                                                className="block w-full pt-2 pb-3 md:pb-4 text-sm md:text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="Seu WhatsApp *" />
                                        </div>
                                        <div className="relative">
                                            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="block w-full pt-2 pb-3 md:pb-4 text-sm md:text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="E-mail *" />
                                        </div>
                                    </div>

                                    <div className="pt-2 w-full">
                                        <div className="flex flex-row gap-2 md:gap-4 w-full">
                                            <button type="button" onClick={() => setDocType('CPF')}
                                                className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase font-bold rounded-lg transition-all border ${docType === 'CPF' ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan' : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'}`}>Pessoa Física</button>
                                            <button type="button" onClick={() => setDocType('CNPJ')}
                                                className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase font-bold rounded-lg transition-all border ${docType === 'CNPJ' ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan' : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'}`}>Pessoa Jurídica</button>
                                        </div>
                                    </div>

                                    {docType === 'CNPJ' && (
                                        <div className="relative animate-fade-in pt-2">
                                            <input type="text" required value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })} maxLength={18}
                                                className="block w-full pt-2 pb-3 md:pb-4 text-sm md:text-base text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest" placeholder="CNPJ *" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BLOCO 02: PROJETO E CUPOM */}
                            <div className="bg-black/60 backdrop-blur-md border border-white/5 p-6 md:p-10 rounded-xl relative shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-full">
                                <div className="flex items-center gap-3 mb-8 md:mb-10 border-b border-white/10 pb-4 md:pb-6">
                                    <span className="text-neon-cyan font-display font-bold text-[9px] md:text-[10px] tracking-[0.3em]">02.</span>
                                    <h3 className="text-white font-luxury tracking-widest uppercase text-lg md:text-xl flex items-center gap-2 md:gap-3">
                                        <Car size={16} className="text-gray-500 md:w-5 md:h-5" /> O Projeto
                                    </h3>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="block w-full p-4 md:p-6 text-sm md:text-base text-gray-300 bg-[#050505] border border-white/10 rounded-xl focus:outline-none focus:border-neon-cyan focus:bg-white/5 transition-colors placeholder:text-gray-600 resize-none"
                                        placeholder="Fale um pouco sobre o veículo (marca, modelo) e qual a sua ideia para as fotos... *" />

                                    <div className="relative pt-2 md:pt-4 p-4 md:p-6 border border-white/10 rounded-xl bg-[#050505] w-full">
                                        <label className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-3 md:mb-4 block flex items-center gap-2">
                                            <Tag size={12} className="text-neon-cyan md:w-3.5 md:h-3.5" /> Cupom Promocional
                                        </label>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full">
                                            <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border w-full transition-colors ${couponStatus === 'valid' ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan' : couponStatus === 'invalid' ? 'border-neon-red bg-neon-red/5 text-neon-red' : 'border-white/10 bg-transparent text-white focus-within:border-white/30'}`}>
                                                <input
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={(e) => {
                                                        setCouponInput(e.target.value.toUpperCase());
                                                        setCouponStatus('idle');
                                                        setDiscountPercent(0);
                                                    }}
                                                    className="block w-full text-xs md:text-sm bg-transparent focus:outline-none placeholder:text-gray-600 tracking-widest"
                                                    placeholder="CÓDIGO (OPCIONAL)"
                                                />
                                                {couponStatus === 'valid' && <CheckCircle size={16} className="text-neon-cyan animate-fade-in md:w-[18px] md:h-[18px]" />}
                                                {couponStatus === 'invalid' && <XCircle size={16} className="text-neon-red animate-fade-in md:w-[18px] md:h-[18px]" />}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={validateCoupon}
                                                disabled={!couponInput || couponStatus === 'loading'}
                                                className="px-6 md:px-8 py-3 md:py-3.5 border border-white/10 bg-white/5 text-white rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/30 transition-all disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                                            >
                                                {couponStatus === 'loading' ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : 'Aplicar'}
                                            </button>
                                        </div>
                                        {couponStatus === 'valid' && <span className="text-[9px] md:text-[10px] text-neon-cyan tracking-widest uppercase mt-3 block animate-fade-in">Cupom de {discountPercent}% aplicado com sucesso!</span>}
                                        {couponStatus === 'invalid' && <span className="text-[9px] md:text-[10px] text-neon-red tracking-widest uppercase mt-3 block animate-fade-in">Cupom inválido ou expirado.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: PACOTE E CONFIRMAÇÃO (STICKY) */}
                        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20 md:top-28 w-full">

                            <div className="bg-black/60 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-full">
                                <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-white/10 pb-4 md:pb-6">
                                    <span className="text-neon-cyan font-display font-bold text-[9px] md:text-[10px] tracking-[0.3em]">03.</span>
                                    <h3 className="text-white font-luxury tracking-widest uppercase text-lg md:text-xl flex items-center gap-2 md:gap-3">
                                        <Camera size={16} className="text-gray-500 md:w-5 md:h-5" /> Pacote
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-3 md:gap-4 w-full">
                                    {PHOTOGRAPHY_PACKAGES.map(pkg => {
                                        const currentPkgPrice = couponStatus === 'valid'
                                            ? pkg.price - (pkg.price * discountPercent / 100)
                                            : pkg.price;

                                        return (
                                            <button
                                                key={pkg.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPackage(pkg.id);
                                                    setAcceptedExtras(false);
                                                }}
                                                className={`text-left p-4 md:p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group w-full ${selectedPackage === pkg.id
                                                    ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                                                    : 'border-white/10 bg-[#050505] hover:border-white/30'
                                                    }`}
                                            >
                                                {selectedPackage === pkg.id && <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-neon-cyan"></div>}

                                                <div className="flex justify-between items-center mb-1 md:mb-2">
                                                    <span className={`text-[9px] md:text-[10px] font-display font-bold uppercase tracking-[0.2em] ${selectedPackage === pkg.id ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                                        {pkg.name}
                                                    </span>
                                                    {selectedPackage === pkg.id && <CheckCircle size={14} className="text-neon-cyan md:w-4 md:h-4" />}
                                                </div>

                                                <div className="flex items-end gap-2 md:gap-3 mt-1 md:mt-2">
                                                    <span className="text-xl md:text-2xl font-luxury text-white italic block">R$ {currentPkgPrice.toFixed(2)}</span>
                                                    {couponStatus === 'valid' && (
                                                        <span className="text-[10px] md:text-xs font-luxury text-gray-600 italic line-through mb-0.5 md:mb-1">R$ {pkg.price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* RESUMO DO PEDIDO E ACEITE */}
                                {selectedPackage && (
                                    <div className="mt-6 md:mt-8 border-t border-white/10 pt-6 md:pt-8 animate-slide-up w-full">
                                        <div className="bg-[#050505] p-4 md:p-6 rounded-xl border border-white/5 mb-5 md:mb-6 w-full">
                                            <h4 className="text-white font-display text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold mb-4 md:mb-5 text-gray-400">Resumo: {selectedPackageDetails?.name}</h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-6">
                                                <span className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest break-words">
                                                    <Clock size={12} className="text-neon-cyan/70 shrink-0" /> {selectedPackageDetails?.duration}
                                                </span>
                                                <span className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest break-words">
                                                    <Camera size={12} className="text-neon-cyan/70 shrink-0" /> {selectedPackageDetails?.photos}
                                                </span>
                                                <span className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest break-words">
                                                    <Sparkles size={12} className="text-neon-cyan/70 shrink-0" /> {selectedPackageDetails?.edit}
                                                </span>
                                                <span className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest break-words">
                                                    <MapPin size={12} className="text-neon-cyan/70 shrink-0" /> {selectedPackageDetails?.extras}
                                                </span>
                                            </div>

                                            <div className="pt-3 md:pt-4 border-t border-white/5 flex justify-between items-center w-full">
                                                <span className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.2em] uppercase">Valor Final</span>
                                                <span className="text-lg md:text-2xl font-luxury text-white italic">R$ {calculatedPrice.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <label className="flex items-start gap-3 md:gap-4 cursor-pointer group w-full">
                                            <div className="relative flex items-center justify-center mt-0.5 md:mt-1 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptedExtras}
                                                    onChange={(e) => setAcceptedExtras(e.target.checked)}
                                                    className="peer appearance-none w-4 h-4 md:w-5 md:h-5 border border-white/20 rounded bg-black/50 checked:bg-neon-cyan checked:border-neon-cyan transition-all cursor-pointer hover:border-neon-cyan"
                                                />
                                                <svg className="absolute w-2.5 h-2.5 md:w-3 md:h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] text-gray-400 leading-relaxed select-none group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                                                <strong className="text-white flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2"><AlertTriangle size={10} className="text-neon-cyan md:w-3 md:h-3" /> Termo de Responsabilidade</strong>
                                                Estou ciente que fotos além da cota custam <strong className="text-white">R$ {selectedPackageDetails?.extraPhotoPrice},00/cada</strong>. Ausência ou cancelamento no dia do ensaio gera taxa de <strong className="text-white">R$ 25,00</strong>.
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* BOTÃO FINAL CHECKOUT - ESTILO TORQUE */}
                            <button
                                type="submit"
                                disabled={!selectedPackage || !acceptedExtras}
                                className="w-full flex items-center justify-center md:justify-between bg-transparent border border-white/20 text-white px-6 md:px-8 py-5 md:py-6 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-500 rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-transparent disabled:hover:border-white/20 disabled:hover:text-white"
                            >
                                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">
                                    {!selectedPackage
                                        ? 'Selecione um Pacote'
                                        : !acceptedExtras
                                            ? 'Aceite os Termos'
                                            : 'Agendar via WhatsApp'}
                                </span>
                                {selectedPackage && acceptedExtras && <Send size={14} className="hidden md:block group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform md:w-4 md:h-4" />}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}