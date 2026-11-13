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

    const il = ayarlar.iletisim;
    document.getElementById('footer-sosyal').innerHTML = `
        <a href="https://wa.me/${il.whatsapp_no}" target="_blank" class="btn-wp px-3 py-1.5 rounded text-xs font-bold"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
        <a href="${il.instagram_url}" target="_blank" class="btn-ig px-3 py-1.5 rounded text-xs font-bold"><i class="fa-brands fa-instagram"></i> Instagram</a>
    `;

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.includes('kategori.html')) {
        const katId = params.get('kat');
        const kat = kategoriler.find(k => k.id === katId);
        document.getElementById('kat-sayfa-baslik').textContent = kat ? kat.baslik : 'Tüm İlanlar';
        const filtreli = ilanlar.filter(i => !katId || i.kategori === katId);
        document.getElementById('kategori-ilanlar-grid').innerHTML = filtreli.map(i => kart(i, ayarlar)).join('');
    } else if (path.includes('ilan-detay.html')) {
        const id = params.get('id');
        const ilan = ilanlar.find(i => i.id === id) || ilanlar[0];
        document.getElementById('ilan-detay-konteyner').innerHTML = `
            <h1 class="text-2xl font-bold mb-2">${ilan.baslik}</h1>
            <p class="text-vurgu font-bold text-xl mb-4">${ilan.fiyat}</p>
            <p class="text-slate-600 mb-6">${ilan.aciklama}</p>
            <a href="https://wa.me/${il.whatsapp_no}?text=Merhaba,%20${ilan.baslik}%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" class="btn-wp px-4 py-2 rounded-xl font-bold inline-block">WhatsApp ile Bilgi Al</a>
        `;
    } else {
        document.getElementById('one-cikan-ilanlar-grid').innerHTML = ilanlar.map(i => kart(i, ayarlar)).join('');
        document.getElementById('kategoriler-grid').innerHTML = kategoriler.map(k => `
            <a href="kategori.html?kat=${k.id}" class="bg-white p-5 rounded-2xl shadow border hover:shadow-md transition">
                <h3 class="font-bold text-lg text-ana mb-1"><i class="fa-solid ${k.ikon} text-vurgu mr-2"></i>${k.baslik}</h3>
                <p class="text-xs text-slate-500">${k.aciklama}</p>
            </a>
        `).join('');
    }
});

function kart(ilan, ayarlar) {
    return `
    <div class="bg-white border rounded-2xl overflow-hidden shadow-sm kart-stil flex flex-col">
        <a href="ilan-detay.html?id=${ilan.id}"><img src="${ilan.gorsel}" class="h-48 w-full object-cover"></a>
        <div class="p-4 flex flex-col flex-grow justify-between">
            <div>
                <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">${ilan.durum}</span>
                <a href="ilan-detay.html?id=${ilan.id}" class="font-bold text-base block mt-2 text-ana hover:text-vurgu">${ilan.baslik}</a>
            </div>
            <div class="mt-4 flex items-center justify-between">
                <span class="font-extrabold text-vurgu">${ilan.fiyat}</span>
                <a href="https://wa.me/${ayarlar.iletisim.whatsapp_no}?text=Merhaba,%20${ilan.baslik}%20bilgi" target="_blank" class="btn-wp px-3 py-1.5 rounded-lg text-xs font-bold"><i class="fa-brands fa-whatsapp"></i> Soru Sor</a>
            </div>
        </div>
    </div>`;
}
