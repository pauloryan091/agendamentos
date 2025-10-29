import sqlite3
import json
import threading
import time
from datetime import datetime, date
from typing import List, Dict, Optional
import os

class BancoAgendamento:
    def __init__(self, db_path: str = "bancoAgendamento.db"):
        self.db_path = db_path
        self.criar_tabelas()
        self.inicializar_dados()
    
    def get_connection(self):
        """Cria e retorna uma conexão com o banco"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def criar_tabelas(self):
        """Cria as tabelas necessárias no banco"""
        with self.get_connection() as conn:
            # Tabela de serviços
            conn.execute('''
                CREATE TABLE IF NOT EXISTS servicos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    duracao INTEGER NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT 1,
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tabela de agendamentos
            conn.execute('''
                CREATE TABLE IF NOT EXISTS agendamentos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cliente_nome TEXT NOT NULL,
                    cliente_telefone TEXT,
                    cliente_email TEXT,
                    servico_nome TEXT NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    data_agendamento DATE NOT NULL,
                    hora_agendamento TIME NOT NULL,
                    status TEXT DEFAULT 'pendente',
                    observacoes TEXT,
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    def inicializar_dados(self):
        """Insere dados iniciais se as tabelas estiverem vazias"""
        with self.get_connection() as conn:
            # Verificar se já existem serviços
            servicos_count = conn.execute("SELECT COUNT(*) as count FROM servicos").fetchone()[0]
            
            if servicos_count == 0:
                servicos_iniciais = [
                    ('Corte de Cabelo', 50.00, 30, 'Corte e acabamento profissional'),
                    ('Manicure', 30.00, 45, 'Manicure completa'),
                    ('Pedicure', 35.00, 45, 'Pedicure completa'),
                    ('Barba', 25.00, 20, 'Aparar e modelar barba'),
                    ('Sobrancelha', 20.00, 15, 'Design de sobrancelha'),
                    ('Coloração', 120.00, 90, 'Coloração profissional')
                ]
                
                conn.executemany(
                    "INSERT INTO servicos (nome, valor, duracao, descricao) VALUES (?, ?, ?, ?)",
                    servicos_iniciais
                )
    
    # ========== OPERAÇÕES DE AGENDAMENTOS ==========
    
    def obter_agendamentos(self, filtros: Dict = None) -> List[Dict]:
        """Obtém todos os agendamentos com opção de filtros"""
        query = "SELECT * FROM agendamentos WHERE 1=1"
        params = []
        
        if filtros:
            if filtros.get('data'):
                query += " AND data_agendamento = ?"
                params.append(filtros['data'])
            
            if filtros.get('servico_nome'):
                query += " AND servico_nome = ?"
                params.append(filtros['servico_nome'])
            
            if filtros.get('status'):
                query += " AND status = ?"
                params.append(filtros['status'])
            
            if filtros.get('cliente_nome'):
                query += " AND cliente_nome LIKE ?"
                params.append(f'%{filtros["cliente_nome"]}%')
        
        query += " ORDER BY data_agendamento, hora_agendamento"
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            agendamentos = [dict(row) for row in cursor.fetchall()]
            
            # Converter para o formato do LocalStorage
            for agendamento in agendamentos:
                agendamento['id'] = agendamento['id']
                agendamento['cliente'] = agendamento['cliente_nome']
                agendamento['servico'] = agendamento['servico_nome']
                agendamento['data'] = agendamento['data_agendamento']
                agendamento['hora'] = agendamento['hora_agendamento']
                agendamento['dataCriacao'] = agendamento['data_criacao']
            
            return agendamentos
    
    def obter_agendamento_por_id(self, agendamento_id: int) -> Optional[Dict]:
        """Obtém um agendamento específico pelo ID"""
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM agendamentos WHERE id = ?", (agendamento_id,))
            row = cursor.fetchone()
            if row:
                agendamento = dict(row)
                # Converter para o formato do LocalStorage
                agendamento['id'] = agendamento['id']
                agendamento['cliente'] = agendamento['cliente_nome']
                agendamento['servico'] = agendamento['servico_nome']
                agendamento['data'] = agendamento['data_agendamento']
                agendamento['hora'] = agendamento['hora_agendamento']
                agendamento['dataCriacao'] = agendamento['data_criacao']
                return agendamento
            return None
    
    def criar_agendamento(self, dados: Dict) -> int:
        """Cria um novo agendamento e retorna o ID"""
        query = '''
            INSERT INTO agendamentos 
            (cliente_nome, cliente_telefone, cliente_email, servico_nome, valor, 
             data_agendamento, hora_agendamento, status, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            dados['cliente'],
            dados.get('cliente_telefone'),
            dados.get('cliente_email'),
            dados['servico'],
            dados['valor'],
            dados['data'],
            dados['hora'],
            dados.get('status', 'pendente'),
            dados.get('observacoes')
        )
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            return cursor.lastrowid
    
    def atualizar_agendamento(self, agendamento_id: int, dados: Dict) -> bool:
        """Atualiza um agendamento existente"""
        query = '''
            UPDATE agendamentos SET
            cliente_nome = ?, cliente_telefone = ?, cliente_email = ?,
            servico_nome = ?, valor = ?, data_agendamento = ?, 
            hora_agendamento = ?, status = ?, observacoes = ?,
            data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ?
        '''
        
        params = (
            dados['cliente'],
            dados.get('cliente_telefone'),
            dados.get('cliente_email'),
            dados['servico'],
            dados['valor'],
            dados['data'],
            dados['hora'],
            dados['status'],
            dados.get('observacoes'),
            agendamento_id
        )
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            return cursor.rowcount > 0
    
    def cancelar_agendamento(self, agendamento_id: int) -> bool:
        """Cancela um agendamento (muda status para 'cancelado')"""
        with self.get_connection() as conn:
            cursor = conn.execute(
                "UPDATE agendamentos SET status = 'cancelado', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
                (agendamento_id,)
            )
            return cursor.rowcount > 0
    
    def excluir_agendamento(self, agendamento_id: int) -> bool:
        """Exclui permanentemente um agendamento"""
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM agendamentos WHERE id = ?", (agendamento_id,))
            return cursor.rowcount > 0
    
    # ========== SINCRONIZAÇÃO COM LOCALSTORAGE ==========
    
    def sincronizar_com_localstorage(self, dados_localstorage: List[Dict]):
        """Sincroniza o banco com os dados do LocalStorage"""
        with self.get_connection() as conn:
            # Obter todos os agendamentos atuais do banco
            agendamentos_banco = {ag['id']: ag for ag in self.obter_agendamentos()}
            agendamentos_local = {ag['id']: ag for ag in dados_localstorage}
            
            # Encontrar diferenças
            ids_banco = set(agendamentos_banco.keys())
            ids_local = set(agendamentos_local.keys())
            
            # Agendamentos para adicionar (existem no local mas não no banco)
            for ag_id in ids_local - ids_banco:
                agendamento = agendamentos_local[ag_id]
                self.criar_agendamento(agendamento)
            
            # Agendamentos para atualizar (existem em ambos mas podem estar diferentes)
            for ag_id in ids_banco & ids_local:
                ag_banco = agendamentos_banco[ag_id]
                ag_local = agendamentos_local[ag_id]
                
                # Verificar se houve mudança (comparar campos importantes)
                if (ag_banco['cliente'] != ag_local['cliente'] or
                    ag_banco['servico'] != ag_local['servico'] or
                    ag_banco['valor'] != ag_local['valor'] or
                    ag_banco['data'] != ag_local['data'] or
                    ag_banco['hora'] != ag_local['hora'] or
                    ag_banco['status'] != ag_local['status']):
                    
                    self.atualizar_agendamento(ag_id, ag_local)
            
            # Agendamentos para remover (existem no banco mas não no local)
            for ag_id in ids_banco - ids_local:
                self.excluir_agendamento(ag_id)
    
    def exportar_para_localstorage(self) -> List[Dict]:
        """Exporta todos os agendamentos no formato do LocalStorage"""
        return self.obter_agendamentos()
    
    # ========== ESTATÍSTICAS ==========
    
    def obter_estatisticas(self) -> Dict:
        """Obtém estatísticas dos agendamentos"""
        hoje = date.today().isoformat()
        
        with self.get_connection() as conn:
            total = conn.execute("SELECT COUNT(*) as count FROM agendamentos").fetchone()[0]
            hoje_count = conn.execute("SELECT COUNT(*) as count FROM agendamentos WHERE data_agendamento = ?", (hoje,)).fetchone()[0]
            pendentes = conn.execute("SELECT COUNT(*) as count FROM agendamentos WHERE status = 'pendente'").fetchone()[0]
            faturamento = conn.execute("SELECT SUM(valor) as total FROM agendamentos WHERE status != 'cancelado'").fetchone()[0] or 0
            
            return {
                'total_agendamentos': total,
                'agendamentos_hoje': hoje_count,
                'agendamentos_pendentes': pendentes,
                'faturamento_total': float(faturamento)
            }
    
    # ========== OPERAÇÕES DE SERVIÇOS ==========
    
    def obter_servicos(self, apenas_ativos: bool = True) -> List[Dict]:
        """Obtém todos os serviços"""
        query = "SELECT * FROM servicos"
        if apenas_ativos:
            query += " WHERE ativo = 1"
        query += " ORDER BY nome"
        
        with self.get_connection() as conn:
            cursor = conn.execute(query)
            servicos = [dict(row) for row in cursor.fetchall()]
            
            # Converter para o formato do LocalStorage
            for servico in servicos:
                servico['nome'] = servico['nome']
                servico['valor'] = float(servico['valor'])
            
            return servicos

class SincronizadorLocalStorage:
    """Classe para sincronizar LocalStorage com banco de dados"""
    
    def __init__(self, banco: BancoAgendamento):
        self.banco = banco
        self.ultima_sincronizacao = None
        self.executando = False
    
    def iniciar_monitoramento(self, intervalo: int = 5):
        """Inicia o monitoramento automático"""
        self.executando = True
        
        def monitorar():
            while self.executando:
                try:
                    self.sincronizar()
                    time.sleep(intervalo)
                except Exception as e:
                    print(f"Erro na sincronização: {e}")
                    time.sleep(intervalo)
        
        thread = threading.Thread(target=monitorar, daemon=True)
        thread.start()
        print("🔄 Sincronizador iniciado - monitorando mudanças...")
    
    def parar_monitoramento(self):
        """Para o monitoramento"""
        self.executando = False
        print("⏹️ Sincronizador parado")
    
    def sincronizar(self):
        """Força uma sincronização manual"""
        try:
            # Aqui você implementaria a leitura do LocalStorage do navegador
            # Por enquanto, vamos simular ou usar um arquivo de intercâmbio
            dados_local = self.ler_localstorage_simulado()
            
            if dados_local:
                self.banco.sincronizar_com_localstorage(dados_local)
                self.ultima_sincronizacao = datetime.now()
                print(f"✅ Sincronizado em {self.ultima_sincronizacao.strftime('%H:%M:%S')}")
        
        except Exception as e:
            print(f"❌ Erro na sincronização: {e}")
    
    def ler_localstorage_simulado(self) -> List[Dict]:
        """
        Simula a leitura do LocalStorage do navegador
        Na prática, você precisaria de uma forma de acessar o LocalStorage
        """
        try:
            # Tentar ler de um arquivo JSON que simula o LocalStorage
            if os.path.exists('localstorage_backup.json'):
                with open('localstorage_backup.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('agendamentos', [])
        except:
            pass
        
        return []
    
    def escrever_localstorage_simulado(self, dados: List[Dict]):
        """
        Simula a escrita no LocalStorage do navegador
        """
        try:
            with open('localstorage_backup.json', 'w', encoding='utf-8') as f:
                json.dump({'agendamentos': dados}, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Erro ao escrever backup: {e}")

def criar_script_js_integracao():
    """Cria um script JavaScript para integrar com sua página existente"""
    
    script_js = """
// ======================
// INTEGRAÇÃO COM BANCO DE DADOS
// ======================

class IntegradorBancoDados {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.sincronizando = false;
    }

    // ========== SINCRONIZAÇÃO ==========

    async sincronizarComBanco() {
        if (this.sincronizando) return;
        
        this.sincronizando = true;
        try {
            // Obter agendamentos do LocalStorage
            const agendamentosLocal = JSON.parse(localStorage.getItem('agendamentos')) || [];
            
            // Enviar para o banco
            const response = await fetch(`${this.apiBase}/sincronizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ agendamentos: agendamentosLocal })
            });
            
            if (response.ok) {
                console.log('✅ Dados sincronizados com o banco');
                
                // Atualizar LocalStorage com dados consolidados do banco
                const agendamentosBanco = await this.obterAgendamentosBanco();
                localStorage.setItem('agendamentos', JSON.stringify(agendamentosBanco));
                
                // Recarregar a interface
                if (typeof carregarAgendamentos === 'function') {
                    carregarAgendamentos();
                }
            }
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        } finally {
            this.sincronizando = false;
        }
    }

    async carregarDoBanco() {
        try {
            const agendamentos = await this.obterAgendamentosBanco();
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            
            if (typeof carregarAgendamentos === 'function') {
                carregarAgendamentos();
            }
            
            console.log('📥 Dados carregados do banco');
        } catch (error) {
            console.error('❌ Erro ao carregar do banco:', error);
        }
    }

    // ========== OPERAÇÕES DE AGENDAMENTOS ==========

    async obterAgendamentosBanco() {
        try {
            const response = await fetch(`${this.apiBase}/agendamentos`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter agendamentos:', error);
            return [];
        }
    }

    async salvarAgendamentoBanco(agendamento) {
        try {
            const method = agendamento.id ? 'PUT' : 'POST';
            const url = agendamento.id ? 
                `${this.apiBase}/agendamentos/${agendamento.id}` : 
                `${this.apiBase}/agendamentos`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agendamento)
            });

            return response.ok;
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            return false;
        }
    }

    async cancelarAgendamentoBanco(agendamentoId) {
        try {
            const response = await fetch(`${this.apiBase}/agendamentos/${agendamentoId}/cancelar`, {
                method: 'PUT'
            });
            return response.ok;
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            return false;
        }
    }

    // ========== ESTATÍSTICAS ==========

    async obterEstatisticasBanco() {
        try {
            const response = await fetch(`${this.apiBase}/estatisticas`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }

    // ========== SERVIÇOS ==========

    async obterServicosBanco() {
        try {
            const response = await fetch(`${this.apiBase}/servicos`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter serviços:', error);
            return [];
        }
    }

    // ========== INTERCEPTADORES ==========

    interceptarFuncoesOriginais() {
        // Interceptar a função de salvar agendamento
        const salvarOriginal = window.salvarAgendamento;
        if (salvarOriginal) {
            window.salvarAgendamento = async function(...args) {
                const resultado = salvarOriginal(...args);
                await integrador.sincronizarComBanco();
                return resultado;
            };
        }

        // Interceptar a função de cancelar agendamento
        const cancelarOriginal = window.cancelarAgendamento;
        if (cancelarOriginal) {
            window.cancelarAgendamento = async function(...args) {
                const resultado = cancelarOriginal(...args);
                await integrador.sincronizarComBanco();
                return resultado;
            };
        }

        console.log('🔧 Funções originais interceptadas');
    }
}

// ======================
// INICIALIZAÇÃO
// ======================

const integrador = new IntegradorBancoDados();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Integrador com banco de dados inicializado');
    
    // Aguardar um pouco para a página carregar completamente
    setTimeout(async () => {
        // Interceptar funções originais
        integrador.interceptarFuncoesOriginais();
        
        // Carregar dados do banco
        await integrador.carregarDoBanco();
        
        // Sincronizar a cada 30 segundos
        setInterval(() => integrador.sincronizarComBanco(), 30000);
        
        // Também sincronizar quando a página ganhar foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                integrador.sincronizarComBanco();
            }
        });
    }, 1000);
});

// Exportar para uso global
window.integradorBanco = integrador;
"""

    with open('integracao_banco.js', 'w', encoding='utf-8') as f:
        f.write(script_js)

def main():
    """Função principal"""
    print("=" * 50)
    print("🔄 SISTEMA DE AGENDAMENTOS - INTEGRAÇÃO COM BANCO")
    print("=" * 50)
    
    # Inicializar banco
    banco = BancoAgendamento()
    
    # Criar script de integração
    criar_script_js_integracao()
    
    print("✅ Banco de dados inicializado: bancoAgendamento.db")
    print("✅ Script de integração criado: integracao_banco.js")
    print()
    print("📝 INSTRUÇÕES:")
    print("1. Adicione este script na sua página HTML existente:")
    print('   <script src="integracao_banco.js"></script>')
    print()
    print("2. Execute o servidor Flask em outro terminal:")
    print("   python servidor_flask.py")
    print()
    print("3. Sua página HTML continuará funcionando normalmente")
    print("   mas agora os dados serão salvos no banco também!")
    print()
    print("🔄 Os dados serão sincronizados automaticamente")

if __name__ == "__main__":
    main()