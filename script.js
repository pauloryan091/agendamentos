document.addEventListener('DOMContentLoaded', function() {
    // -------------------
    // Configurações de modo e menu
    // -------------------
    const nav = document.querySelector('.nav-links');
    const modo = localStorage.getItem('modo') || 'cliente';
    const linksCliente = [
        {nome: "Dashboard", href:"dashboard.html"},
        {nome: "Serviços", href:"serviços.html"},
        {nome: "Perfil", href:"perfil.html"}
    ];
    const linksDev = [
        {nome: "Dashboard", href:"dashboard.html"},
        {nome: "Serviços", href:"serviços.html"},
        {nome: "Agendamento", href:"agendamento.html"},
        {nome: "Clientes", href:"clientes.html"},
        {nome: "Perfil", href:"perfil.html"}
    ];
    nav.innerHTML = (modo === 'dev' ? linksDev : linksCliente).map(l => `<a href="${l.href}" class="nav-link">${l.nome}</a>`).join('');
    document.getElementById('menuBtn')?.addEventListener('click', () => nav.classList.toggle('show'));

    // -------------------
    // Perfil
    // -------------------
    const fotoUsuario = document.getElementById('fotoUsuario');
    const uploadFoto = document.getElementById('uploadFoto');
    if(fotoUsuario) fotoUsuario.src = localStorage.getItem('fotoUsuario') || '';
    uploadFoto?.addEventListener('change', function() {
        const file = this.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = e => {
                fotoUsuario.src = e.target.result;
                localStorage.setItem('fotoUsuario', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    const formPerfil = document.getElementById('formPerfil');
    formPerfil?.addEventListener('submit', function(e){
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        localStorage.setItem('nomeUsuario', nome);
        localStorage.setItem('emailUsuario', email);
        localStorage.setItem('telefoneUsuario', telefone);
        document.getElementById('nomeUsuario').innerText = nome;
        document.getElementById('emailUsuario').innerText = email;
        document.getElementById('telefoneUsuario').innerText = telefone;
        document.getElementById('msgPerfil').innerText = "Perfil atualizado!";
    });

    // -------------------
    // Agendamentos
    // -------------------
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const corpoTabela = document.getElementById('corpoTabela');
    const msgAgendamento = document.getElementById('msgAgendamento');

    function mostrarAgendamentos(){
        if(!corpoTabela) return;
        corpoTabela.innerHTML = agendamentos.length === 0 ? 
            `<tr><td colspan="4" style="text-align:center;">Nenhum agendamento.</td></tr>` : 
            agendamentos.map(a => `<tr>
                <td>${a.cliente}</td><td>${a.servico}</td><td>${a.data}</td><td>${a.hora}</td>
            </tr>`).join('');
    }

    mostrarAgendamentos();

    document.getElementById('agendamentoForm')?.addEventListener('submit', function(e){
        e.preventDefault();
        const cliente = document.getElementById('cliente').value;
        const servico = document.getElementById('servico').value;
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        if(!cliente || !servico || !data || !hora){
            msgAgendamento.innerText = "Preencha todos os campos!";
            msgAgendamento.style.color = "red";
            return;
        }
        agendamentos.push({cliente, servico, data, hora});
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        msgAgendamento.innerText = "Agendamento realizado!";
        msgAgendamento.style.color = "green";
        mostrarAgendamentos();
        this.reset();
    });

    // -------------------
    // Serviços
    // -------------------
    let servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    function mostrarServicos(){
        const lista = document.getElementById('listaServicos');
        if(!lista) return;
        lista.innerHTML = servicos.map(s => `
            <div class="card">
                <img src="${s.foto}" alt="${s.nome}" class="card-img">
                <div class="card-body">
                    <h3>${s.nome}</h3>
                    <p>${s.descricao}</p>
                    <p>Valor: R$ ${s.valor.toFixed(2)}</p>
                    <a href="agendamento.html?servico=${s.nome}" class="btn btn-primary">Agendar</a>
                </div>
            </div>
        `).join('');
    }
    mostrarServicos();
});
// ------------------------
// Menu responsivo
// ------------------------
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("show");
});

// ------------------------
// Carregar agendamentos existentes do localStorage
// ------------------------
function carregarAgendamentos() {
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = ""; // limpa tabela antes de preencher

  agendamentos.forEach((agendamento, index) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${agendamento.cliente}</td>
      <td>${agendamento.servico}</td>
      <td>${agendamento.data}</td>
      <td>${agendamento.hora}</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

// ------------------------
// Adicionar novo agendamento
// ------------------------
document.getElementById("agendamentoForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const cliente = document.getElementById("cliente").value;
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  if (!cliente || !servico || !data || !hora) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  const novoAgendamento = { cliente, servico, data, hora };

  // Pega lista existente e adiciona novo
  const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  agendamentos.push(novoAgendamento);
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

  // Mostra mensagem de confirmação
  const msg = document.getElementById("msgAgendamento");
  msg.textContent = "Agendamento confirmado com sucesso!";
  msg.style.color = "green";

  // Limpa formulário
  this.reset();

  // Atualiza tabela
  carregarAgendamentos();
});

// ------------------------
// Inicialização
// ------------------------
carregarAgendamentos();
document.getElementById('agendamentoForm').addEventListener('submit', function(e){
  e.preventDefault();

  const cliente = document.getElementById('cliente').value;
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const hora = document.getElementById('hora').value;

  if (!cliente || !servico || !data || !hora) return;

  // pega os agendamentos já salvos ou cria um array vazio
  const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

  // adiciona o novo agendamento
  agendamentos.push({ cliente, servico, data, hora });

  // salva no localStorage
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

  // mensagem de sucesso
  document.getElementById('msgAgendamento').textContent = 'Agendamento salvo com sucesso!';

  // limpa formulário
  this.reset();
});

// Carrega agendamentos do localStorage e preenche tabela e select
  function carregarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const tbody = document.getElementById('corpoTabela');
    const select = document.getElementById('selectAgendamento');
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">Selecione um agendamento</option>';

    agendamentos.forEach((a, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.cliente}</td>
                      <td>${a.servico}</td>
                      <td>${a.valor || ''}</td>
                      <td>${a.data}</td>
                      <td>${a.hora}</td>`;
      tbody.appendChild(tr);

      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${a.cliente} - ${a.servico} - ${a.data} ${a.hora}`;
      select.appendChild(option);
    });
  }

  // Filtrar por data
  function filtrarAgendamentos() {
    const dataFiltro = document.getElementById('filtroData').value;
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const tbody = document.getElementById('corpoTabela');
    tbody.innerHTML = '';

    agendamentos.forEach(a => {
      if (!dataFiltro || a.data === dataFiltro) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${a.cliente}</td>
                        <td>${a.servico}</td>
                        <td>${a.valor || ''}</td>
                        <td>${a.data}</td>
                        <td>${a.hora}</td>`;
        tbody.appendChild(tr);
      }
    });
  }

  function limparFiltro() {
    document.getElementById('filtroData').value = '';
    carregarAgendamentos();
  }

  function editarSelecionado() {
    const index = document.getElementById('selectAgendamento').value;
    if (index === '') return alert('Selecione um agendamento para editar.');
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const a = agendamentos[index];

    const novoCliente = prompt('Nome do cliente:', a.cliente);
    const novoServico = prompt('Serviço:', a.servico);
    const novaData = prompt('Data:', a.data);
    const novaHora = prompt('Hora:', a.hora);

    if (novoCliente && novoServico && novaData && novaHora) {
      agendamentos[index] = { cliente: novoCliente, servico: novoServico, data: novaData, hora: novaHora };
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      carregarAgendamentos();
    }
  }

  function cancelarSelecionado() {
    const index = document.getElementById('selectAgendamento').value;
    if (index === '') return alert('Selecione um agendamento para cancelar.');
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      agendamentos.splice(index, 1);
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      carregarAgendamentos();
    }
  }

  // Carrega ao abrir a página
  window.onload = carregarAgendamentos;

  // Painel Desenvolvedor
  const devToggle = document.getElementById('devToggle');
  const devControls = document.getElementById('devControls');
  const modalServico = document.getElementById('modalServico');
  const formServico = document.getElementById('formServico');
  const listaServicos = document.getElementById('listaServicos');

  let modoDevAtivo = false;

  devToggle.addEventListener('click', () => {
    modoDevAtivo = !modoDevAtivo;
    devControls.style.display = modoDevAtivo ? 'block' : 'none';
    alert(`Modo Desenvolvedor ${modoDevAtivo ? 'Ativado' : 'Desativado'}`);
  });

  // Botão adicionar serviço
  if(devControls){
    const btnAddServico = document.createElement('button');
    btnAddServico.textContent = 'Adicionar Serviço';
    btnAddServico.className = 'btn btn-primary';
    btnAddServico.onclick = () => modalServico.style.display = 'flex';
    devControls.appendChild(btnAddServico);
  }

  function closeModalServico(){
    modalServico.style.display = 'none';
  }

  formServico.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nome = document.getElementById('nomeServico').value;
    const descricao = document.getElementById('descricaoServico').value;
    const valor = document.getElementById('valorServico').value;
    const foto = document.getElementById('fotoServico').value;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${foto}" alt="${nome}" class="card-img">
      <div class="card-body">
        <h3 class="card-title">${nome}</h3>
        <p class="card-text">${descricao}</p>
        <p>Valor: R$ ${valor}</p>
        <a href="agendar.html" class="btn btn-primary">Agendar</a>
      </div>
    `;
    listaServicos.appendChild(card);
    closeModalServico();
    formServico.reset();
  });

  document.addEventListener('DOMContentLoaded', () => {
  const devToggle = document.getElementById('devToggle');
  const devControls = document.getElementById('devControls');
  const modalServico = document.getElementById('modalServico');
  const formServico = document.getElementById('formServico');
  const listaServicos = document.getElementById('listaServicos');

  let modoDevAtivo = false;

  // Alterna Modo Desenvolvedor
  devToggle.addEventListener('click', () => {
    modoDevAtivo = !modoDevAtivo;
    devControls.style.display = modoDevAtivo ? 'block' : 'none';

    if (modoDevAtivo && devControls.children.length === 0) {
      // Cria botão Adicionar Serviço dentro do painel dev
      const btnAddServico = document.createElement('button');
      btnAddServico.textContent = 'Adicionar Serviço';
      btnAddServico.className = 'btn btn-primary';
      btnAddServico.addEventListener('click', () => {
        modalServico.style.display = 'flex';
      });
      devControls.appendChild(btnAddServico);
    }
  });

  // Fecha o modal
  window.closeModalServico = () => {
    modalServico.style.display = 'none';
  }

  // Adiciona serviço ao enviar o form
  formServico.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nomeServico').value;
    const descricao = document.getElementById('descricaoServico').value;
    const valor = document.getElementById('valorServico').value;
    const foto = document.getElementById('fotoServico').value;

    // Cria card do serviço
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${foto}" alt="${nome}" class="card-img">
      <div class="card-body">
        <h3 class="card-title">${nome}</h3>
        <p class="card-text">${descricao}</p>
        <p>Valor: R$ ${valor}</p>
        <a href="agendar.html" class="btn btn-primary">Agendar</a>
      </div>
    `;

    listaServicos.appendChild(card);
    modalServico.style.display = 'none';
    formServico.reset();
  });

  // Fecha modal ao clicar fora do conteúdo
  modalServico.addEventListener('click', (e) => {
    if (e.target === modalServico) modalServico.style.display = 'none';
  });

  // Botão hamburger para mobile
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('menu');
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const devToggle = document.getElementById('devToggle');
  const devControls = document.getElementById('devControls');
  const modalServico = document.getElementById('modalServico');
  const formServico = document.getElementById('formServico');
  const listaServicos = document.getElementById('listaServicos');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('menu');

  let modoDevAtivo = false;

  // Alterna Modo Desenvolvedor
  devToggle.addEventListener('click', () => {
    modoDevAtivo = !modoDevAtivo;
    devControls.style.display = modoDevAtivo ? 'block' : 'none';

    if (modoDevAtivo && devControls.children.length === 0) {
      const btnAddServico = document.createElement('button');
      btnAddServico.textContent = 'Adicionar Serviço';
      btnAddServico.className = 'btn btn-primary';
      btnAddServico.addEventListener('click', () => {
        modalServico.style.display = 'flex';
      });
      devControls.appendChild(btnAddServico);
    }
  });

  // Fecha o modal
  window.closeModalServico = () => {
    modalServico.style.display = 'none';
  }

  // Adiciona serviço
  formServico.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeServico').value;
    const descricao = document.getElementById('descricaoServico').value;
    const valor = document.getElementById('valorServico').value;
    const foto = document.getElementById('fotoServico').value;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${foto}" alt="${nome}" class="card-img">
      <div class="card-body">
        <h3 class="card-title">${nome}</h3>
        <p class="card-text">${descricao}</p>
        <p>Valor: R$ ${valor}</p>
        <a href="agendar.html" class="btn btn-primary">Agendar</a>
      </div>
    `;
    listaServicos.appendChild(card);
    modalServico.style.display = 'none';
    formServico.reset();
  });

  // Fecha modal clicando fora
  modalServico.addEventListener('click', e => {
    if (e.target === modalServico) modalServico.style.display = 'none';
  });

  // Hamburger menu
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const modalServico = document.getElementById('modalServico');
  const formServico = document.getElementById('formServico');
  const listaServicos = document.getElementById('listaServicos');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('menu');
  const btnAddServico = document.getElementById('btnAddServico');

  // Mostrar modal para qualquer usuário
  btnAddServico.addEventListener('click', () => {
    modalServico.style.display = 'flex';
  });

  // Fechar modal
  window.closeModalServico = () => {
    modalServico.style.display = 'none';
  }

  // Carregar serviços do localStorage
  function carregarServicos() {
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    servicos.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${s.foto}" alt="${s.nome}" class="card-img">
        <div class="card-body">
          <h3 class="card-title">${s.nome}</h3>
          <p class="card-text">${s.descricao}</p>
          <p>Valor: R$ ${s.valor}</p>
          <a href="agendar.html" class="btn btn-primary">Agendar</a>
        </div>
      `;
      listaServicos.appendChild(card);
    });
  }
  carregarServicos();

  // Adicionar serviço
  formServico.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeServico').value;
    const descricao = document.getElementById('descricaoServico').value;
    const valor = document.getElementById('valorServico').value;
    const arquivo = document.getElementById('fotoServico').files[0];

    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      const fotoDataUrl = event.target.result;

      // Cria card
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${fotoDataUrl}" alt="${nome}" class="card-img">
        <div class="card-body">
          <h3 class="card-title">${nome}</h3>
          <p class="card-text">${descricao}</p>
          <p>Valor: R$ ${valor}</p>
          <a href="agendar.html" class="btn btn-primary">Agendar</a>
        </div>
      `;
      listaServicos.appendChild(card);

      // Salva no localStorage
      const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
      servicos.push({ nome, descricao, valor, foto: fotoDataUrl });
      localStorage.setItem('servicos', JSON.stringify(servicos));

      modalServico.style.display = 'none';
      formServico.reset();
    };
    reader.readAsDataURL(arquivo);
  });

  // Fecha modal clicando fora
  modalServico.addEventListener('click', e => {
    if (e.target === modalServico) modalServico.style.display = 'none';
  });

  // Menu hamburger
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");

  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("show");
  });
});
