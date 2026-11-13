document.addEventListener('DOMContentLoaded', async () => {
    const [ayarlar, kategoriler, ilanlar, reklamlar] = await Promise.all([
        fetch('data/ayarlar.json').then(r => r.json()),
        fetch('data/kategoriler.json').then(r => r.json()),
        fetch('data/ilanlar.json').then(r => r.json()),
        fetch('data/reklamlar.json').then(r => r.json())
    ]);
    document.getElementById('header-baslik').textContent = ayarlar.dukkan_adi;
    document.getElementById('header-slogan').textContent = ayarlar.slogan;
    document.getElementById('footer-baslik').textContent = ayarlar.dukkan_adi;
    document.getElementById('footer-adres').textContent = ayarlar.adres;
    document.getElementById('footer-tel').textContent = ayarlar.telefon;
    document.getElementById('footer-hakkimizda').textContent = ayarlar.hakkimizda_kisa;

    const il = ayarlar.iletisim;
    document.getElementById('footer-sosyal').innerHTML = `
        <a href="https://wa.me/${il.whatsapp_no}" target="_blank" class="btn-wp px-3 py-1.5 rounded text-xs font-bold"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
        <a href="${il.instagram_url}" target="_blank" class="btn-ig px-3 py-1.5 rounded text-xs font-bold"><i class="fa-brands fa-instagram"></i> Instagram</a>
    `;

    document.getElementById('ust-butonlar-alani').innerHTML = (ayarlar.ust_butonlar || [])
        .filter(b => b.aktif)
        .map(b => `<a href="${b.link}" class="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-vurgu text-white transition flex items-center gap-1.5"><i class="${b.ikon}"></i> ${b.metin}</a>`).join('');

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.includes('kategori.html')) {
        const katId = params.get('kat');
        const kat = kategoriler.find(k => k.id === katId);
        document.getElementById('kat-sayfa-baslik').textContent = kat ? kat.baslik : 'Tüm İlanlar';
        const filtreli = ilanlar.filter(i => !katId || i.kategori === katId);
        document.getElementById('kategori-ilanlar-grid').innerHTML = filtreli.length ? filtreli.map(i => kart(i, ayarlar)).join('') : '<p class="text-slate-500">Bu kategoride henüz ilan bulunmuyor.</p>';
    } else if (path.includes('ilan-detay.html')) {
        const id = params.get('id');
        const ilan = ilanlar.find(i => i.id === id) || ilanlar[0];
        
        // Çoklu resim kontrolü (gorseller dizisi varsa ilkini al, yoksa eski gorsel alanını destekle)
        const resimler = ilan.gorseller && ilan.gorseller.length > 0 ? ilan.gorseller : [ilan.gorsel || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3'];
        
        document.getElementById('ilan-detay-konteyner').innerHTML = `
            <!-- Ana Büyük Görsel -->
            <div class="mb-4 bg-slate-100 rounded-xl overflow-hidden shadow-sm h-64 md:h-96">
                <img id="ana-fotograf" src="${resimler[0]}" class="w-full h-full object-cover transition duration-300">
            </div>
            
            <!-- Küçük Resim Galerisi (Thumbnail listesi) -->
            ${resimler.length > 1 ? `
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                ${resimler.map((img, idx) => `
                    <button onclick="document.getElementById('ana-fotograf').src='${img}'" class="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-vurgu shrink-0 focus:outline-none focus:border-vurgu shadow-sm">
                        <img src="${img}" class="w-full h-full object-cover">
                    </button>
                `).join('')}
            </div>` : ''}

            <span class="bg-vurgu text-white text-xs font-bold px-3 py-1 rounded-lg">${ilan.durum}</span>
            <h1 class="text-2xl md:text-3xl font-extrabold text-ana mt-3 mb-2">${ilan.baslik}</h1>
            <p class="text-vurgu font-extrabold text-2xl mb-4">${ilan.fiyat}</p>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2 mb-6">
                <p><strong>Uyumlu Model:</strong> ${ilan.uyumlu_model}</p>
                <p><strong>OEM Kodu:</strong> ${ilan.oem_kodu}</p>
                <p><strong>İlan Kodu:</strong> #${ilan.id}</p>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">${ilan.aciklama}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="https://wa.me/${il.whatsapp_no}?text=Merhaba,%20${encodeURIComponent(ilan.baslik)}%20(İlan%20No:%20${ilan.id})%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" class="btn-wp px-4 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <i class="fa-brands fa-whatsapp text-lg"></i> WhatsApp ile Bilgi Al
                </a>
                <a href="${il.instagram_url}" target="_blank" class="btn-ig px-4 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <i class="fa-brands fa-instagram text-lg"></i> Instagram ile Yaz
                </a>
            </div>
        `;
    } else {
        document.getElementById('one-cikan-ilanlar-grid').innerHTML = ilanlar.map(i => kart(i, ayarlar)).join('');
        document.getElementById('kategoriler-grid').innerHTML = kategoriler.map(k => `
            <a href="kategori.html?kat=${k.id}" class="bg-white p-5 rounded-2xl shadow border hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-lg text-ana mb-1"><i class="fa-solid ${k.ikon} text-vurgu mr-2"></i>${k.baslik}</h3>
                    <p class="text-xs text-slate-500">${k.aciklama}</p>
                </div>
            </a>
        `).join('');

        const aramaInput = document.getElementById('arama-input');
        if(aramaInput) {
            aramaInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                const filtreli = ilanlar.filter(i => i.baslik.toLowerCase().includes(q) || i.oem_kodu.toLowerCase().includes(q));
                document.getElementById('one-cikan-ilanlar-grid').innerHTML = filtreli.length ? filtreli.map(i => kart(i, ayarlar)).join('') : '<p class="col-span-full text-center text-slate-500">Aramanıza uygun parça bulunamadı.</p>';
            });
        }
    }
});

function kart(ilan, ayarlar) {
    // Kartlarda her zaman dizideki ilk resim kapak fotoğrafı olarak görünür
    const kapakResmi = ilan.gorseller && ilan.gorseller.length > 0 ? ilan.gorseller[0] : (ilan.gorsel || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3');
    return `
    <div class="bg-white border rounded-2xl overflow-hidden shadow-sm kart-stil flex flex-col">
        <a href="ilan-detay.html?id=${ilan.id}"><img src="${kapakResmi}" class="h-48 w-full object-cover"></a>
        <div class="p-4 flex flex-col flex-grow justify-between">
            <div>
                <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">${ilan.durum}</span>
                <a href="ilan-detay.html?id=${ilan.id}" class="font-bold text-base block mt-2 text-ana hover:text-vurgu">${ilan.baslik}</a>
            </div>
            <div class="mt-4 flex items-center justify-between">
                <span class="font-extrabold text-vurgu">${ilan.fiyat}</span>
                <a href="https://wa.me/${ayarlar.iletisim.whatsapp_no}?text=Merhaba,%20${encodeURIComponent(ilan.baslik)}%20bilgi" target="_blank" class="btn-wp px-3 py-1.5 rounded-lg text-xs font-bold"><i class="fa-brands fa-whatsapp"></i> Soru Sor</a>
            </div>
        </div>
    </div>`;
}
