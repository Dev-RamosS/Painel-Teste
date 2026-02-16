/* ============================================================
   FRONTIER PIZZARIA - SISTEMA ADMINISTRATIVO
   JavaScript Puro - Sem frameworks ou bibliotecas externas
   ============================================================ */

// ============================================================
//  CONFIGURAÇÕES GLOBAIS
// ============================================================

const STORAGE_KEY = 'frontierSession';

// Definição de usuários válidos (simulação de banco de dados)
const VALID_USERS = {
    'admin': {
        password: '1234',
        role: 'dono',
        roleDisplay: 'Dono'
    },
    'gerente': {
        password: '54321',
        role: 'gerente',
        roleDisplay: 'Gerente'
    }
};

// Array global que armazena os pedidos
let allOrders = [];

// Filtros atuais
let currentFilters = {
    date: '',
    category: ''
};

// Sessão do usuário atual
let currentUser = null;

// ============================================================
//  FUNÇÃO: GERAR NOMES DE CLIENTES FICTÍCIOS
// ============================================================

function generateClientNames() {
    const firstNames = [
        'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Jessica',
        'Felipe', 'Beatriz', 'Lucas', 'Fernanda', 'Rafael', 'Mariana',
        'Gustavo', 'Sofia', 'André', 'Camila', 'Bruno', 'Paula',
        'Fernando', 'Leticia', 'Matheus', 'Gabriela', 'Paulo', 'Amanda',
        'Ricardo', 'Juliana', 'Rodrigo', 'Vitória', 'Daniel', 'Isabela'
    ];

    const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Costa', 'Ferreira', 'Gomes',
        'Martins', 'Pereira', 'Carvalho', 'Ribeiro', 'Alves', 'Dias',
        'Rocha', 'Barbosa', 'Souza', 'Monteiro', 'Borges', 'Campos',
        'Machado', 'Teixeira', 'Correia', 'Lopes', 'Mendes', 'Nunes'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

// ============================================================
//  FUNÇÃO: GERAR DADOS FICTÍCIOS DE PEDIDOS
// ============================================================

function generateOrders() {
    const categories = ['Tradicional', 'Especial', 'Doce'];
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    allOrders = [];

    // Gerar 100 pedidos
    for (let i = 1; i <= 100; i++) {
        // Data aleatória dentro do mês
        const dayOfMonth = Math.floor(Math.random() * 28) + 1;
        const orderDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

        // Status: 10 cancelados, 90 concluído
        let status = 'Concluído';
        if (i <= 10) {
            status = 'Cancelado';
        }

        const order = {
            id: String(i).padStart(4, '0'),
            client: generateClientNames(),
            date: formatDate(orderDate),
            category: categories[Math.floor(Math.random() * categories.length)],
            value: (Math.random() * 50 + 30).toFixed(2), // Entre 30 e 80
            status: status,
            timestamp: orderDate // Para ordenação
        };

        allOrders.push(order);
    }

    // Ordenar por data (mais recentes primeiro)
    allOrders.sort((a, b) => b.timestamp - a.timestamp);
}

// ============================================================
//  FUNÇÃO: FORMATAR DATA
// ============================================================

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// ============================================================
//  FUNÇÃO: CONVERTER DATA DD/MM/YYYY PARA DATE
// ============================================================

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

// ============================================================
//  FUNÇÕES DE CÁLCULO DE KPIs
// ============================================================

function calculateDailyRevenue(filteredOrders) {
    const today = new Date();
    const todayFormatted = formatDate(today);

    return filteredOrders
        .filter(order => order.date === todayFormatted && order.status === 'Concluído')
        .reduce((sum, order) => sum + parseFloat(order.value), 0)
        .toFixed(2);
}

function calculateMonthlyRevenue(filteredOrders) {
    return filteredOrders
        .filter(order => order.status === 'Concluído')
        .reduce((sum, order) => sum + parseFloat(order.value), 0)
        .toFixed(2);
}

function countTotalOrders(filteredOrders) {
    return filteredOrders.length;
}

function countTodayOrders(filteredOrders) {
    const today = new Date();
    const todayFormatted = formatDate(today);

    return filteredOrders.filter(order => order.date === todayFormatted).length;
}

function countCanceledOrders(filteredOrders) {
    return filteredOrders.filter(order => order.status === 'Cancelado').length;
}

// ============================================================
//  FUNÇÃO: FILTRAR PEDIDOS
// ============================================================

function getFilteredOrders() {
    let filtered = [...allOrders];

    // Filtro por data
    if (currentFilters.date) {
        filtered = filtered.filter(order => order.date === currentFilters.date);
    }

    // Filtro por categoria
    if (currentFilters.category) {
        filtered = filtered.filter(order => order.category === currentFilters.category);
    }

    return filtered;
}

// ============================================================
//  FUNÇÃO: ATUALIZAR CARDS DE KPI
// ============================================================

function updateKPICards() {
    const filteredOrders = getFilteredOrders();

    const dailyRevenue = calculateDailyRevenue(filteredOrders);
    const monthlyRevenue = calculateMonthlyRevenue(filteredOrders);
    const totalOrders = countTotalOrders(filteredOrders);
    const todayOrders = countTodayOrders(filteredOrders);
    const canceledOrders = countCanceledOrders(filteredOrders);

    // Atualizar DOM
    document.getElementById('dailyRevenue').textContent = `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dailyRevenue)}`;
    document.getElementById('monthlyRevenue').textContent = `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(monthlyRevenue)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('todayOrders').textContent = todayOrders;
    document.getElementById('canceledOrders').textContent = canceledOrders;
}

// ============================================================
//  FUNÇÃO: RENDERIZAR TABELA DE PEDIDOS
// ============================================================

function renderOrdersTable() {
    const filteredOrders = getFilteredOrders();
    const tableBody = document.getElementById('ordersTableBody');

    tableBody.innerHTML = '';

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #888;">
                    Nenhum pedido encontrado com os filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    filteredOrders.forEach(order => {
        const row = document.createElement('tr');

        const statusClass = order.status === 'Concluído' ? 'status-concluido' : 'status-cancelado';
        const statusBadge = `<span class="status-badge ${statusClass}">${order.status}</span>`;

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.client}</td>
            <td>${order.date}</td>
            <td>${order.category}</td>
            <td>R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(order.value)}</td>
            <td>${statusBadge}</td>
        `;

        tableBody.appendChild(row);
    });

    // Atualizar KPIs também
    updateKPICards();
}

// ============================================================
//  SISTEMA DE LOGIN
// ============================================================

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Validação
    if (VALID_USERS[username] && VALID_USERS[username].password === password) {
        // Credenciais válidas
        const user = VALID_USERS[username];

        // Salvar sessão no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            username: username,
            role: user.role,
            roleDisplay: user.roleDisplay,
            loginTime: new Date().toISOString()
        }));

        // Redirecionar para dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Mostrar erro
        errorMessage.textContent = '❌ Usuário ou senha incorretos!';
        errorMessage.classList.add('show');

        // Limpar campos
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        // Remover erro após 4 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 4000);
    }
}

// ============================================================
//  VERIFICAR AUTENTICAÇÃO
// ============================================================

function checkAuthentication() {
    const session = localStorage.getItem(STORAGE_KEY);

    // Se não estiver no login.html, verificar se há sessão válida
    if (!window.location.pathname.includes('login.html')) {
        if (!session) {
            // Sem sessão, redirecionar para login
            window.location.href = 'login.html';
        } else {
            // Carregar dados do usuário
            currentUser = JSON.parse(session);
        }
    } else {
        // Se estiver no login.html e já tem sessão, redirecionar para dashboard
        if (session) {
            window.location.href = 'dashboard.html';
        }
    }
}

// ============================================================
//  CARREGAR INFORMAÇÕES DO USUÁRIO
// ============================================================

function loadUserInfo() {
    if (!currentUser) return;

    // Atualizar nome do usuário no botão profile
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = currentUser.username.toUpperCase();
    }

    // Atualizar dados no dropdown
    const dropdownUsername = document.getElementById('dropdownUsername');
    const dropdownRole = document.getElementById('dropdownRole');

    if (dropdownUsername) {
        dropdownUsername.textContent = currentUser.username;
    }

    if (dropdownRole) {
        dropdownRole.textContent = `Tipo: ${currentUser.roleDisplay}`;
    }

    // Aplicar controle de permissões visual
    applyPermissions();
}

// ============================================================
//  LOGOUT
// ============================================================

function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'login.html';
}

// ============================================================
//  CONTROLE DE PERMISSÕES
// ============================================================

function applyPermissions() {
    if (!currentUser) return;

    // Se for gerente, aplicar restrições visuais
    if (currentUser.role === 'gerente') {
        // Adicionar classe 'gerente' ao body para aplicar estilos específicos
        document.body.classList.add('role-gerente');
    } else if (currentUser.role === 'dono') {
        // Dono tem acesso completo
        document.body.classList.add('role-dono');
    }
}

// ============================================================
//  GERENCIAMENTO DO DROPDOWN DE PERFIL
// ============================================================

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!profileBtn || !profileDropdown) return;

    // Criar overlay dinamicamente
    let overlay = document.querySelector('.profile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'profile-overlay';
        document.body.appendChild(overlay);
    }

    // Função para posicionar o dropdown corretamente
    function positionDropdown() {
        const btnRect = profileBtn.getBoundingClientRect();
        profileDropdown.style.top = (btnRect.bottom + 8) + 'px';
        profileDropdown.style.right = window.innerWidth - btnRect.right + 'px';
    }

    // Abrir/Fechar dropdown ao clicar no botão
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isActive = profileDropdown.classList.contains('active');
        
        if (!isActive) {
            // Abrir dropdown
            positionDropdown();
            profileBtn.classList.add('active');
            profileDropdown.classList.add('active');
            overlay.classList.add('active');
            window.addEventListener('scroll', closeDropdownOnScroll);
        } else {
            // Fechar dropdown
            closeDropdown();
        }
    });

    // Função para fechar dropdown
    function closeDropdown() {
        profileBtn.classList.remove('active');
        profileDropdown.classList.remove('active');
        overlay.classList.remove('active');
        window.removeEventListener('scroll', closeDropdownOnScroll);
    }

    // Fechar dropdown ao fazer scroll
    function closeDropdownOnScroll() {
        closeDropdown();
    }

    // Fechar dropdown e overlay ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDropdown();
    });

    // Fechar dropdown ao clicar fora (mas não no overlay que já está configurado)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-dropdown-container')) {
            closeDropdown();
        }
    });

    // Repositionar dropdown ao redimensionar janela
    window.addEventListener('resize', () => {
        if (profileDropdown.classList.contains('active')) {
            positionDropdown();
        }
    });

    // Fechar dropdown ao clicar no botão logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// ============================================================
//  MENU HAMBURGUER
// ============================================================

function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Fechar sidebar ao clicar em um item
        const menuItems = sidebar.querySelectorAll('.menu-item a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        });

        // Fechar sidebar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// ============================================================
//  CONFIGURAR FILTROS
// ============================================================

function setupFilters() {
    const dateFilter = document.getElementById('dateFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            if (e.target.value) {
                currentFilters.date = e.target.value.split('-').reverse().join('/');
            } else {
                currentFilters.date = '';
            }
            renderOrdersTable();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            renderOrdersTable();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentFilters.date = '';
            currentFilters.category = '';

            if (dateFilter) dateFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';

            renderOrdersTable();
        });
    }
}

// ============================================================
//  ATUALIZAR DATA ATUAL NO HEADER
// ============================================================

function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');

    if (currentDateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('pt-BR', options);

        // Capitalizar primeira letra
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        currentDateElement.textContent = capitalizedDate;
    }
}

// ============================================================
//  INICIALIZAR DASHBOARD
// ============================================================

function initializeDashboard() {
    // Carregar informações do usuário
    loadUserInfo();

    // Gerar pedidos fictícios
    generateOrders();

    // Atualizar data
    updateCurrentDate();

    // Renderizar tabela inicial
    renderOrdersTable();

    // Configurar filtros
    setupFilters();

    // Configurar menu hambúrguer
    setupHamburgerMenu();

    // Configurar dropdown de perfil
    setupProfileDropdown();

    // Menu items navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remover classe active de todos
            menuItems.forEach(mi => mi.classList.remove('active'));

            // Adicionar classe active ao clicado
            item.classList.add('active');

            // Aqui você pode adicionar lógica para mudar de seções
            const section = item.querySelector('a').dataset.section;
            // console.log('Seção selecionada:', section);
        });
    });
}

// ============================================================
//  EXECUTAR NO CARREGAMENTO DO DOCUMENTO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação em todas as páginas
    checkAuthentication();

    // Se estiver na página de login, configurar o formulário
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);

        // Focar no campo de usuário
        document.getElementById('username').focus();
    }

    // Se estiver no dashboard, inicializar
    const ordersTable = document.getElementById('ordersTable');
    if (ordersTable) {
        initializeDashboard();
    }
});

// ============================================================
//  FUNÇÃO AUXILIAR: FORMATAR VALORES MONETÁRIOS
// ============================================================

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/* FIM DO SCRIPT */
