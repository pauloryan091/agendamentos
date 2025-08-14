document.addEventListener('DOMContentLoaded', function() {
    // ---------------------------
    // Menu responsivo
    // ---------------------------
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');
    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
    }

    // ---------------------------
    // Perfil do usuário
    // ---------------------------
    const uploadFoto = document.getElementById('uploadFoto');
    const fotoUsuario = document.getElementById('fotoUsuario');
    const formPerfil = document.getElementById('formPerfil');
    const msgPerfil = document.getElementById('msgPerfil');

    // Carregar dados do localStorage
    if(fotoUsuario) {
        const fotoSalva = localStorage.getItem('fotoUsuario');
        if(fotoSalva) fotoUsuario.src = fotoSalva;
    }
    if(document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').innerText = localStorage.getItem('nomeUsuario') || '';
    if(document.getElementById('emailUsuario')) document.getElementById('emailUsuario').innerText = localStorage.getItem('emailUsuario') || '';
    if(document.getElementById('telefoneUsuario')) document.getElementById('telefoneUsuario').innerText = localStorage.getItem('telefoneUsuario') || '';

    // Atualizar foto
    if(uploadFoto) {
        uploadFoto.addEventListener('change', function() {
            const file = this.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = e => {
                    if(fotoUsuario) fotoUsuario.src = e.target.result;
                    localStorage.setItem('fotoUsuario', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Editar perfil
    if(formPerfil) {
        formPerfil.addEventListener('submit', function(e){
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;

            if(document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').innerText = nome;
            if(document.getElementById('emailUsuario')) document.getElementById('emailUsuario').innerText = email;
            if(document.getElementById('telefoneUsuario')) document.getElementById('telefoneUsuario').innerText = telefone;

            if(msgPerfil) {
                msgPerfil.innerText = "Perfil atualizado com sucesso!";
                msgPerfil.style.color = "green";
            }

            localStorage.setItem('nomeUsuario', nome);
            localStorage.setItem('emailUsuario', email);
            localStorage.setItem('telefoneUsuario', telefone);
        });
    }

    // ---------------------------
    // Agendamentos
    // ---------------------------
    const modal = document.getElementById('agendamentoModal');
    const formAgendamento = document.getElementById('agendamentoForm');
    const corpoTabela = document.getElementById('corpoTabela');

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    function mostrarAgendamentos(lista = agendamentos) {
        if(!corpoTabela) return;
        corpoTabela.innerHTML = '';

        if(lista.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        lista.forEach((a, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${a.cliente}</td>
                <td>${a.servico}</td>
                <td>R$ ${parseFloat(a.valor).toFixed(2)}</td>
                <td>${a.data.split("-").reverse().join("/")}</td>
                <td>${a.hora}</td>
                <td class="table-actions">
                    <button class="btn btn-danger" onclick="cancelarAgendamentoTabela(${i})">Cancelar</button>
                </td>
            `;
            corpoTabela.appendChild(row);
        });
    }

    window.cancelarAgendamentoTabela = function(index) {
        if(confirm(`Deseja realmente cancelar o agendamento de ${agendamentos[index].cliente} em ${agendamentos[index].data} às ${agendamentos[index].hora}?`)) {
            agendamentos.splice(index, 1);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            mostrarAgendamentos();
        }
    };

    // Abrir modal de agendamento
    window.openAgendamentoModal = function(day, month, year) {
        if(!modal) return;

        const data = `${day.toString().padStart(2,'0')}/${month.toString().padStart(2,'0')}/${year}`;
        document.getElementById('agendamentoData').textContent = data;

        // Serviços
        const selectServico = document.getElementById('servico');
        const valorInput = document.getElementById('valor');
        if(selectServico) {
            selectServico.innerHTML = '<option value="" disabled selected>Selecione um serviço</option>';
            const servicos = [
                { nome: 'Corte de Cabelo', duracao: '45 min', valor: 60 },
                { nome: 'Manicure Completa', duracao: '60 min', valor: 35 },
                { nome: 'Design de Sobrancelhas', duracao: '30 min', valor: 25 },
                { nome: 'Massagem Relaxante', duracao: '60 min', valor: 120 }
            ];
            servicos.forEach((s, i) => {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${s.nome} - ${s.duracao} (R$ ${s.valor})`;
                option.dataset.valor = s.valor;
                selectServico.appendChild(option);
            });

            selectServico.addEventListener('change', function() {
                const selected = servicos[this.value];
                if(valorInput) valorInput.value = selected ? selected.valor : '';
            });
        }

        modal.classList.add('active');
    }

    window.closeModal = function() {
        if(modal) {
            modal.classList.remove('active');
        }
        if(formAgendamento) formAgendamento.reset();
    }

    if(window.onclick === undefined) {
        window.onclick = function(event) {
            if(event.target === modal) closeModal();
        }
    }

    if(formAgendamento) {
        formAgendamento.addEventListener('submit', function(e){
            e.preventDefault();
            const novoAgendamento = {
                cliente: document.getElementById('cliente').value,
                servico: document.getElementById('servico').options[document.getElementById('servico').selectedIndex].text,
                valor: parseFloat(document.getElementById('valor').value),
                data: document.getElementById('data').value,
                hora: document.getElementById('hora').value
            };
            agendamentos.push(novoAgendamento);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            alert('Agendamento confirmado!');
            closeModal();
            mostrarAgendamentos();
        });
    }

    mostrarAgendamentos();

    // ---------------------------
    // Inicializar calendário
    // ---------------------------
    if(document.getElementById('calendar')) initCalendar();

    function initCalendar() {
        const now = new Date();
        renderCalendar(now.getMonth(), now.getFullYear());

        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');

        if(prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        if(nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
    }

    function changeMonth(offset) {
        const calendar = document.getElementById('calendar');
        if(!calendar) return;

        let month = parseInt(calendar.getAttribute('data-month'));
        let year = parseInt(calendar.getAttribute('data-year'));

        month += offset;
        if(month < 0) { month = 11; year--; }
        if(month > 11) { month = 0; year++; }

        renderCalendar(month, year);
    }

    function renderCalendar(month, year) {
        const calendar = document.getElementById('calendar');
        const title = document.getElementById('calendarTitle');
        const body = document.getElementById('calendarBody');
        if(!calendar || !title || !body) return;

        calendar.setAttribute('data-month', month);
        calendar.setAttribute('data-year', year);

        const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        title.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        body.innerHTML = '';
        let day = 1;

        for(let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for(let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if(i === 0 && j < firstDay || day > daysInMonth) {
                    cell.textContent = '';
                } else {
                    cell.textContent = day;
                    const today = new Date();
                    if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                    }
                    cell.classList.add('available');
                    cell.title = 'Horário disponível';
                    cell.addEventListener('click', () => openAgendamentoModal(day, month+1, year));
                    day++;
                }
                row.appendChild(cell);
            }
            body.appendChild(row);
            if(day > daysInMonth) break;
        }
    }
});
