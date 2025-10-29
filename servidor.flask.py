from flask import Flask, request, jsonify
from flask_cors import CORS
from sistema_agendamento_integrado import BancoAgendamento
import json

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

banco = BancoAgendamento()

@app.route('/api/agendamentos', methods=['GET'])
def obter_agendamentos():
    """Obtém todos os agendamentos"""
    try:
        filtros = {}
        
        if request.args.get('data'):
            filtros['data'] = request.args.get('data')
        if request.args.get('servico_nome'):
            filtros['servico_nome'] = request.args.get('servico_nome')
        if request.args.get('status'):
            filtros['status'] = request.args.get('status')
        if request.args.get('cliente_nome'):
            filtros['cliente_nome'] = request.args.get('cliente_nome')
        
        agendamentos = banco.obter_agendamentos(filtros)
        return jsonify(agendamentos)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/agendamentos', methods=['POST'])
def criar_agendamento():
    """Cria um novo agendamento"""
    try:
        dados = request.get_json()
        agendamento_id = banco.criar_agendamento(dados)
        return jsonify({'id': agendamento_id, 'mensagem': 'Agendamento criado com sucesso'})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/agendamentos/<int:agendamento_id>', methods=['PUT'])
def atualizar_agendamento(agendamento_id):
    """Atualiza um agendamento existente"""
    try:
        dados = request.get_json()
        if banco.atualizar_agendamento(agendamento_id, dados):
            return jsonify({'mensagem': 'Agendamento atualizado com sucesso'})
        return jsonify({'erro': 'Agendamento não encontrado'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/agendamentos/<int:agendamento_id>/cancelar', methods=['PUT'])
def cancelar_agendamento(agendamento_id):
    """Cancela um agendamento"""
    try:
        if banco.cancelar_agendamento(agendamento_id):
            return jsonify({'mensagem': 'Agendamento cancelado com sucesso'})
        return jsonify({'erro': 'Agendamento não encontrado'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/sincronizar', methods=['POST'])
def sincronizar():
    """Sincroniza dados do LocalStorage com o banco"""
    try:
        dados = request.get_json()
        agendamentos_local = dados.get('agendamentos', [])
        
        banco.sincronizar_com_localstorage(agendamentos_local)
        
        # Retornar dados consolidados do banco
        agendamentos_banco = banco.obter_agendamentos()
        return jsonify(agendamentos_banco)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/estatisticas', methods=['GET'])
def obter_estatisticas():
    """Obtém estatísticas"""
    try:
        estatisticas = banco.obter_estatisticas()
        return jsonify(estatisticas)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/servicos', methods=['GET'])
def obter_servicos():
    """Obtém serviços"""
    try:
        servicos = banco.obter_servicos()
        return jsonify(servicos)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servidor Flask iniciado em http://localhost:5000")
    print("📊 API REST disponível para integração")
    app.run(debug=True, port=5000)