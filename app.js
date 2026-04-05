/** Backend API (run: cd backend && uvicorn main:app --host 127.0.0.1 --port 8000) */
const API_BASE = 'http://127.0.0.1:8000';

const SOIL_TO_DATASET = {
    Loamy: 'Loamy',
    'Black Soil': 'Black',
    Sandy: 'Sandy',
};

const IRR_TO_DATASET = {
    'Drip Irrigation (Recommended)': 'Drip',
    'Sprinkler System': 'Sprinkler',
    'Flood/Surface': 'Canal',
};

const SEASON_TO_DATASET = {
    'Rabi (Winter)': 'Rabi',
    'Kharif (Monsoon)': 'Kharif',
};

function startApp() {
    const overlay = document.getElementById('landingOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.visibility = 'hidden';
    }, 800);
}

function openGuide() {
    document.getElementById('guideModal').classList.remove('hidden');
}

function closeGuide() {
    document.getElementById('guideModal').classList.add('hidden');
}

function recordHistory(config) {
    const container = document.getElementById('historyContainer');
    const empty = document.getElementById('emptyHistory');

    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'bg-white/5 border border-white/10 rounded-2xl p-4 animate-in mb-4';
    item.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <span class="text-[9px] font-black text-green-400 uppercase tracking-wider">${config.state}</span>
            <span class="text-[8px] text-white/40 font-bold">${config.time}</span>
        </div>
        <div class="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">🌾</div>
            <div>
                <p class="text-xs font-black text-white">${config.crop}</p>
                <p class="text-sm font-bold text-green-400">${config.yield} <span class="text-[8px] uppercase">kg/ha</span></p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div class="bg-black/20 p-2 rounded-lg">
                <p class="text-[7px] text-white/40 uppercase font-bold mb-1">Season</p>
                <p class="text-[9px] font-bold text-white/80">${config.season}</p>
            </div>
            <div class="bg-black/20 p-2 rounded-lg">
                <p class="text-[7px] text-white/40 uppercase font-bold mb-1">Soil Type</p>
                <p class="text-[9px] font-bold text-white/80">${config.soil}</p>
            </div>
        </div>
    `;
    container.prepend(item);
}

function fallbackYield(cropSelect) {
    const cropM = parseFloat(cropSelect.value);
    const base = 2500;
    return Math.floor(base * cropM + Math.random() * 600);
}

async function runPrediction() {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');

    const stateSelect = document.getElementById('state');
    const cropSelect = document.getElementById('crop');
    const seasonSelect = document.getElementById('season');
    const soilSelect = document.getElementById('soil');
    const irrigationSelect = document.getElementById('irrigation');

    const stateName = stateSelect.options[stateSelect.selectedIndex].text.trim();
    const cropName = cropSelect.options[cropSelect.selectedIndex].text.trim();
    const seasonName = seasonSelect.options[seasonSelect.selectedIndex].text.trim();
    const soilName = soilSelect.options[soilSelect.selectedIndex].text.trim();
    const irrigationName = irrigationSelect.options[irrigationSelect.selectedIndex].text.trim();
    const tempVal = document.getElementById('temp').value + '°C';

    const payload = {
        state: stateName,
        crop: cropName,
        season: SEASON_TO_DATASET[seasonName] || seasonName,
        soil_type: SOIL_TO_DATASET[soilName] || 'Loamy',
        irrigation_type: IRR_TO_DATASET[irrigationName] || 'Drip',
        temperature_c: parseFloat(document.getElementById('temp').value),
        rainfall_mm: parseFloat(document.getElementById('rain').value),
        soil_ph: parseFloat(document.getElementById('ph').value),
        nitrogen_n: parseFloat(document.getElementById('n_val').value),
        phosphorus_p: parseFloat(document.getElementById('p_val').value),
        potassium_k: parseFloat(document.getElementById('k_val').value),
    };

    const t0 = Date.now();
    let finalYield;
    let usedApi = false;
    let strategy = '';

    try {
        const res = await fetch(`${API_BASE}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        finalYield = data.yield_kg_per_ha;
        strategy = data.strategy || '';
        usedApi = true;
    } catch {
        finalYield = fallbackYield(cropSelect);
    }

    const elapsed = Date.now() - t0;
    if (elapsed < 1200) {
        await new Promise((r) => setTimeout(r, 1200 - elapsed));
    }

    loading.classList.add('hidden');

    const display = document.getElementById('yieldDisplay');
    display.innerHTML = `${finalYield.toLocaleString()}<br><span class="text-lg font-bold text-gray-300 tracking-normal uppercase">kg per hectare</span>`;

    const badge = document.getElementById('badge');
    badge.innerText = usedApi ? 'Dataset-informed estimate' : 'Offline estimate (start API for full data)';
    badge.className =
        'px-6 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm';

    const recs = document.getElementById('recommendations');
    const apiNote = usedApi
        ? `<div class="p-4 bg-white border border-green-100 rounded-2xl text-xs text-gray-600 animate-in" style="animation-delay: 0.05s">Based on ${strategy.replace(/\+/g, ' + ')} matches in the crop dataset.</div>`
        : `<div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 animate-in" style="animation-delay: 0.05s">Backend not reachable — start <code class="bg-amber-100 px-1 rounded">uvicorn</code> in <code class="bg-amber-100 px-1 rounded">backend/</code> for predictions from <code class="bg-amber-100 px-1 rounded">dataset.csv.xlsx</code>.</div>`;

    recs.innerHTML = `
        <div class="p-4 bg-green-600 text-white rounded-2xl text-xs font-bold animate-in">
            ${usedApi ? '✅' : '⚠️'} ${usedApi ? 'Yield estimate from historical records' : 'Approximate yield'} for ${cropName}.
        </div>
        ${apiNote}
        <div class="p-4 bg-white border border-green-100 rounded-2xl text-xs font-semibold text-gray-600 animate-in" style="animation-delay: 0.1s">
            📈 Tip: Keep your soil moisture steady for the best harvest.
        </div>
    `;

    const now = new Date();
    recordHistory({
        state: stateName,
        crop: cropName,
        yield: finalYield.toLocaleString(),
        season: seasonName,
        soil: soilName,
        irrigation: irrigationName,
        temp: tempVal,
        time:
            now.getHours().toString().padStart(2, '0') +
            ':' +
            now.getMinutes().toString().padStart(2, '0'),
    });
}

const tempInput = document.getElementById('temp');
const tempValEl = document.getElementById('tempVal');
if (tempInput && tempValEl) {
    tempInput.addEventListener('input', () => {
        tempValEl.textContent = tempInput.value + '°C';
    });
}
