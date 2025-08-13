document.addEventListener('DOMContentLoaded', function() {
    // Fechar alertas
    document.querySelectorAll('.alert-close').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });

    // Inicializar calendário
    if (document.getElementById('calendar')) {
        initCalendar();
    }

    // Inicializar modais
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
        });
    });

    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Formulário de agendamento
    if (document.getElementById('agendamentoForm')) {
        document.getElementById('agendamentoForm').addEventListener('submit', function(e) {
            e.preventDefault();
            submitAgendamento();
        });
    }
});

// Função para inicializar o calendário
function initCalendar() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    renderCalendar(currentMonth, currentYear);
    
    // Navegação do calendário
    document.getElementById('prevMonth').addEventListener('click', function() {
        const currentMonth = parseInt(document.getElementById('calendar').getAttribute('data-month'));
        const currentYear = parseInt(document.getElementById('calendar').getAttribute('data-year'));
        
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear = currentYear - 1;
        }
        
        renderCalendar(newMonth, newYear);
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        const currentMonth = parseInt(document.getElementById('calendar').getAttribute('data-month'));
        const currentYear = parseInt(document.getElementById('calendar').getAttribute('data-year'));
        
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear = currentYear + 1;
        }
        
        renderCalendar(newMonth, newYear);
    });
}

// Função para renderizar o calendário
function renderCalendar(month, year) {
    const calendar = document.getElementById('calendar');
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarBody = document.getElementById('calendarBody');
    
    // Atualizar atributos do calendário
    calendar.setAttribute('data-month', month);
    calendar.setAttribute('data-year', year);
    
    // Definir título do calendário
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    
    // Obter primeiro dia do mês e último dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Obter dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
    const startingDay = firstDay.getDay();
    
    // Limpar corpo do calendário
    calendarBody.innerHTML = '';
    
    // Criar dias do calendário
    let day = 1;
    for (let i = 0; i < 6; i++) {
        // Criar linha
        const row = document.createElement('tr');
        
        // Criar células para cada dia da semana
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if (i === 0 && j < startingDay) {
                // Dias do mês anterior
                cell.textContent = '';
            } else if (day > daysInMonth) {
                // Dias do próximo mês
                cell.textContent = '';
            } else {
                // Dias do mês atual
                cell.textContent = day;
                
                // Verificar se é o dia atual
                const currentDate = new Date();
                if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                    cell.classList.add('today');
                }
                
                // Simular alguns horários agendados (apenas para demonstração)
                if (Math.random() < 0.3) {
                    cell.classList.add('booked');
                    cell.title = 'Horário indisponível';
                } else {
                    cell.classList.add('available');
                    cell.title = 'Horário disponível';
                }
                
                // Adicionar evento de clique
                cell.addEventListener('click', function() {
                    if (this.classList.contains('available')) {
                        openAgendamentoModal(day, month + 1, year);
                    }
                });
                
                day++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
        
        // Parar se já preenchemos todos os dias do mês
        if (day > daysInMonth) {
            break;
        }
    }
}

// Função para abrir modal de agendamento
function openAgendamentoModal(day, month, year) {
    const data = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    document.getElementById('agendamentoData').textContent = data;
    
    // Simular carregamento de serviços disponíveis
    const selectServico = document.getElementById('servico');
    selectServico.innerHTML = '<option value="" disabled selected>Carregando...</option>';
    
    setTimeout(() => {
        // Simular resposta da API
        const servicos = [
            { id: 1, nome: 'Corte de Cabelo', duracao: '45 min', valor: 'R$ 60,00' },
            { id: 2, nome: 'Manicure Completa', duracao: '60 min', valor: 'R$ 35,00' },
            { id: 3, nome: 'Design de Sobrancelhas', duracao: '30 min', valor: 'R$ 25,00' },
            { id: 4, nome: 'Massagem Relaxante', duracao: '60 min', valor: 'R$ 120,00' }
        ];
        
        selectServico.innerHTML = '<option value="" disabled selected>Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.nome} - ${servico.duracao} (${servico.valor})`;
            selectServico.appendChild(option);
        });
        
        // Simular carregamento de horários disponíveis
        const selectHorario = document.getElementById('horario');
        selectHorario.innerHTML = '<option value="" disabled selected>Carregando...</option>';
        
        setTimeout(() => {
            // Gerar horários disponíveis (das 9h às 18h, a cada 30 minutos)
            selectHorario.innerHTML = '<option value="" disabled selected>Selecione um horário</option>';
            for (let h = 9; h <= 18; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const hora = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
                    const option = document.createElement('option');
                    option.value = hora;
                    option.textContent = hora;
                    selectHorario.appendChild(option);
                }
            }
        }, 500);
    }, 500);
    
    // Mostrar modal
    document.getElementById('agendamentoModal').classList.add('active');
}

// Função para enviar agendamento
function submitAgendamento() {
    const form = document.getElementById('agendamentoForm');
    const submitBtn = document.getElementById('agendamentoSubmit');
    const loader = document.getElementById('agendamentoLoader');
    const successMsg = document.getElementById('agendamentoSuccess');
    
    // Simular envio
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';
    
    // Simular resposta da API após 1.5 segundos
    setTimeout(() => {
        loader.style.display = 'none';
        successMsg.style.display = 'block';
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
            document.getElementById('agendamentoModal').classList.remove('active');
            form.reset();
            submitBtn.disabled = false;
            successMsg.style.display = 'none';
            
            // Exibir mensagem de sucesso
            const alert = document.createElement('div');
            alert.className = 'alert alert-success fade-in';
            alert.innerHTML = `
                <span>Agendamento realizado com sucesso!</span>
                <button class="alert-close">&times;</button>
            `;
            document.querySelector('.main-content .container').prepend(alert);
            
            // Adicionar evento de clique para fechar alerta
            alert.querySelector('.alert-close').addEventListener('click', function() {
                this.parentElement.style.display = 'none';
            });
        }, 2000);
    }, 1500);
}

// Função para cancelar agendamento
function cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        // Simular requisição AJAX
        const loader = document.getElementById(`loader-${id}`);
        const btn = document.getElementById(`cancelar-${id}`);
        
        btn.style.display = 'none';
        loader.style.display = 'inline-block';
        
        setTimeout(() => {
            // Simular resposta da API
            loader.style.display = 'none';
            document.getElementById(`agendamento-${id}`).style.opacity = '0.5';
            document.getElementById(`status-${id}`).textContent = 'Cancelado';
            
            // Exibir mensagem de sucesso
            const alert = document.createElement('div');
            alert.className = 'alert alert-success fade-in';
            alert.innerHTML = `
                <span>Agendamento cancelado com sucesso!</span>
                <button class="alert-close">&times;</button>
            `;
            document.querySelector('.main-content .container').prepend(alert);
            
            // Adicionar evento de clique para fechar alerta
            alert.querySelector('.alert-close').addEventListener('click', function() {
                this.parentElement.style.display = 'none';
            });
        }, 1000);
    }
}
