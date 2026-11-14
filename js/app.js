document.addEventListener('DOMContentLoaded', async () => {
    const repoPrefix = window.location.hostname.includes('github.io') ? '/ford-transit-yedek-parca' : '';
    try {
        const [ayarlar, kategoriler, ilanlar, reklamlar] = await Promise.all([
            fetch(repoPrefix + '/data/ayarlar.json').then(r => r.json()),
            fetch(repoPrefix + '/data/kategoriler.json').then(r => r.json()),
            fetch(repoPrefix + '/data/ilanlar.json').then(r => r.json()),
            fetch(repoPrefix + '/data/reklamlar.json').then(r => r.json())
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

        // Reklam Alanı Yükleme
        const ustReklam = (reklamlar || []).find(r => r.aktif && r.konum === 'ust_banner');
        const ustReklamAlani = document.getElementById('ust-reklam-alani');
        if (ustReklam && ustReklamAlani) {
            ustReklamAlani.innerHTML = `
                <div style="background: ${ustReklam.arkaplan}" class="text-white py-2 px-4 text-center text-xs md:text-sm font-bold flex flex-wrap items-center justify-center gap-2">
                    <span>${ustReklam.baslik}</span>
                    ${ustReklam.buton_metin ? `<a href="${ustReklam.link}" target="_blank" class="bg-white text-slate-900 px-2.5 py-0.5 rounded-md text-xs font-extrabold hover:bg-slate-100 transition">${ustReklam.buton_metin}</a>` : ''}
                </div>
            `;
        }

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
            const resimler = ilan.gorseller && ilan.gorseller.length > 0 ? ilan.gorseller : [ilan.gorsel || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3'];
            
            document.getElementById('ilan-detay-konteyner').innerHTML = `
                <!-- Tam Boyutlu (Kırpılmayan) ve Tıklanabilir Ana Fotoğraf -->
                <div onclick="tamEkranAc(document.getElementById('ana-fotograf').src)" class="relative group cursor-zoom-in mb-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[550px]">
                    <img id="ana-fotograf" src="${resimler[0]}" class="max-w-full max-h-[520px] object-contain transition duration-300">
                    <div class="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                        <i class="fa-solid fa-magnifying-glass-plus"></i> Büyütmek için tıkla
                    </div>
                </div>

                <!-- Küçük Resim Galerisi (Thumbnail) -->
                ${resimler.length > 1 ? `
                <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                    ${resimler.map((img) => `
                        <button onclick="document.getElementById('ana-fotograf').src='${img}'" class="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-vurgu shrink-0 focus:outline-none focus:border-vurgu shadow-sm flex items-center justify-center p-1">
                            <img src="${img}" class="max-w-full max-h-full object-contain">
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

                <!-- Tam Ekran Büyüteç (Lightbox) Penceresi -->
                <div id="lightbox-modal" onclick="tamEkranKapat()" class="fixed inset-0 bg-black/90 z-[9999] hidden items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out">
                    <button onclick="tamEkranKapat()" class="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <img id="lightbox-img" src="" class="max-w-full max-h-[92vh] object-contain rounded-lg shadow-2xl">
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
    } catch (err) {
        console.error('Veri yükleme hatası:', err);
    }
});

// Tam ekran büyüteç açma / kapama fonksiyonları
function tamEkranAc(resimUrl) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = resimUrl;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function tamEkranKapat() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ESC tuşu ile tam ekrandan çıkma desteği
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tamEkranKapat();
});

function kart(ilan, ayarlar) {
    const kapakResmi = ilan.gorseller && ilan.gorseller.length > 0 ? ilan.gorseller[0] : (ilan.gorsel || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3');
    return `
    <div class="bg-white border rounded-2xl overflow-hidden shadow-sm kart-stil flex flex-col">
        <a href="ilan-detay.html?id=${ilan.id}" class="bg-slate-50 border-b border-slate-100 h-52 w-full flex items-center justify-center p-2 overflow-hidden">
            <img src="${kapakResmi}" class="max-h-full max-w-full object-contain">
        </a>
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
