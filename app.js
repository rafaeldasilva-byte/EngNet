// Variáveis Globais
let allCities = [];
let isAccordionOpen = false;

// Elementos do Accordion Central e KPIs
const ufAccordionBtn = document.getElementById('uf-accordion-btn');
const selectedUfText = document.getElementById('selected-uf-text');
const ufListContainer = document.getElementById('uf-list-container');
const ufList = document.getElementById('uf-list');
const citiesGrid = document.getElementById('cities-grid');
const searchCityInput = document.getElementById('search-city-input');
const kpiUfId = document.getElementById('kpi-uf-id');
const kpiTotalCities = document.getElementById('kpi-total-cities');

// Elementos do Menu Lateral (Sidebar)
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarUfList = document.getElementById('sidebar-uf-list');

// Inicialização
document.addEventListener('DOMContentLoaded', fetchStates);

// Lógica de abertura e fechamento do Menu Lateral (Sidebar) COM ANIMAÇÃO
openSidebarBtn.addEventListener('click', () => {
    // Remove a margem negativa para o menu deslizar para a tela
    sidebar.classList.remove('-ml-[300px]');
    openSidebarBtn.classList.add('hidden'); // Esconde o botão de abrir
});

closeSidebarBtn.addEventListener('click', () => {
    // Adiciona a margem negativa para o menu deslizar para fora
    sidebar.classList.add('-ml-[300px]');
    
    // Aguarda 300ms (tempo da transição do Tailwind) para devolver o botão à tela
    setTimeout(() => {
        openSidebarBtn.classList.remove('hidden');
    }, 300);
});

// Controle do Accordion Central
ufAccordionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isAccordionOpen = !isAccordionOpen;
    ufListContainer.classList.toggle('hidden', !isAccordionOpen);
});

document.addEventListener('click', (event) => {
    if (!ufAccordionBtn.contains(event.target) && !ufListContainer.contains(event.target)) {
        isAccordionOpen = false;
        ufListContainer.classList.add('hidden');
    }
});

// Filtro de Municípios
searchCityInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredCities = allCities.filter(city => city.nome.toLowerCase().includes(searchTerm));
    renderCities(filteredCities);
});

async function fetchStates() {
    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const states = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
        renderStatesList(states);
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
    }
}

function renderStatesList(states) {
    ufList.innerHTML = '';
    sidebarUfList.innerHTML = '';

    states.forEach(state => {
        // 1. Cria item para o Accordion Central
        const liCentral = document.createElement('li');
        liCentral.className = 'px-6 py-3 cursor-pointer hover:bg-[#3A7C48] hover:text-white border-b border-gray-100 transition-colors';
        liCentral.textContent = `${state.nome} - ${state.sigla}`;
        liCentral.addEventListener('click', () => selectState(state));
        ufList.appendChild(liCentral);

        // 2. Cria item para o Menu Lateral
        const liLateral = document.createElement('li');
        // A classe 'sidebar-item' é usada para gerenciar a cor do estado ativo depois
        liLateral.className = 'sidebar-item px-8 py-4 cursor-pointer text-center border-b border-gray-200 transition-colors text-[#3A7C48] bg-white hover:bg-[#A5CA8E] hover:text-white';
        liLateral.textContent = state.sigla;
        liLateral.dataset.id = state.id;
        
        liLateral.addEventListener('click', () => selectState(state));
        sidebarUfList.appendChild(liLateral);
    });
}

function selectState(state) {
    // Atualiza Textos
    selectedUfText.textContent = `${state.nome} - ${state.sigla}`;
    kpiUfId.textContent = state.id;
    
    // Fecha o accordion central
    isAccordionOpen = false;
    ufListContainer.classList.add('hidden');
    
    // Habilita e limpa barra de pesquisa
    searchCityInput.disabled = false;
    searchCityInput.value = '';

    // Atualiza estilo visual do menu lateral (marca o item como selecionado)
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        if (item.dataset.id == state.id) {
            // Estado Ativo (Fundo verde escuro, texto branco)
            item.classList.add('bg-[#3A7C48]', 'text-white');
            item.classList.remove('text-[#3A7C48]', 'bg-white', 'hover:bg-[#A5CA8E]');
        } else {
            // Estado Inativo
            item.classList.remove('bg-[#3A7C48]', 'text-white');
            item.classList.add('text-[#3A7C48]', 'bg-white', 'hover:bg-[#A5CA8E]');
        }
    });

    fetchCitiesByState(state.id);
}

async function fetchCitiesByState(stateId) {
    citiesGrid.innerHTML = '<div class="col-span-full text-center text-white font-bold mt-20 text-[28px]">Carregando municípios...</div>';
    
    try {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`);
        allCities = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
        kpiTotalCities.textContent = allCities.length;
        renderCities(allCities);
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        citiesGrid.innerHTML = '<div class="col-span-full text-center text-red-700 font-bold mt-20">Erro ao carregar municípios.</div>';
        kpiTotalCities.textContent = '0';
    }
}

function renderCities(citiesToRender) {
    citiesGrid.innerHTML = '';

    if (citiesToRender.length === 0) {
        citiesGrid.innerHTML = '<div class="col-span-full text-center text-white font-bold mt-20 text-[28px]">Nenhum município encontrado.</div>';
        return;
    }

    citiesToRender.forEach(city => {
        const cityBtn = document.createElement('button');
        
        // Botões com largura fixa e alinhamento central
        cityBtn.className = 'bg-white rounded-full px-6 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow text-[#3A7C48] w-full max-w-[260px] mx-auto text-left font-subtitle';
        
        const cityName = document.createElement('span');
        cityName.textContent = city.nome;
        cityName.className = 'truncate pr-2';

        const pinIcon = document.createElement('img');
        pinIcon.src = './img/Map pin.png';
        pinIcon.alt = 'Mapa';
        pinIcon.className = 'w-6 h-6 flex-shrink-0';

        cityBtn.appendChild(cityName);
        cityBtn.appendChild(pinIcon);

        cityBtn.addEventListener('click', () => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.nome)}`;
            window.open(mapsUrl, '_blank');
        });

        citiesGrid.appendChild(cityBtn);
    });
}