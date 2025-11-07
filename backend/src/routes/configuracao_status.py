"""
Rotas para gerenciar configurações e status do restaurante
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User
from src.models.configuracao_status_model import ConfiguracaoStatus, StatusRestaurante
import json

configuracao_status_bp = Blueprint("configuracao_status", __name__)

# ============================================================================
# ROTAS PÚBLICAS - Status do Restaurante
# ============================================================================

@configuracao_status_bp.route('/status', methods=['GET'])
def get_status_publico():
    """Retorna o status público do restaurante (aberto/fechado)"""
    try:
        status = StatusRestaurante.get_status_atual()
        esta_aberto, mensagem = StatusRestaurante.verificar_horario_funcionamento()
        
        return jsonify({
            'aberto': esta_aberto,
            'aceita_pedidos': status.aceita_pedidos and esta_aberto,
            'mensagem': mensagem if not esta_aberto else 'Estamos abertos!',
            'horario_abertura': status.horario_abertura,
            'horario_fechamento': status.horario_fechamento,
            'dias_funcionamento': json.loads(status.dias_funcionamento) if status.dias_funcionamento else []
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ROTAS ADMINISTRATIVAS - Gerenciamento de Status
# ============================================================================

@configuracao_status_bp.route('/status/admin', methods=['GET'])
@jwt_required()
def get_status_admin():
    """Retorna o status completo do restaurante (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        status = StatusRestaurante.get_status_atual()
        esta_aberto, mensagem = StatusRestaurante.verificar_horario_funcionamento()
        
        return jsonify({
            'status': status.to_dict(),
            'verificacao': {
                'esta_aberto': esta_aberto,
                'mensagem': mensagem
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/status/toggle', methods=['POST'])
@jwt_required()
def toggle_status():
    """Abre ou fecha o restaurante manualmente (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        aberto = data.get('aberto')
        mensagem = data.get('mensagem')
        
        if aberto is None:
            return jsonify({'error': 'Campo "aberto" é obrigatório'}), 400
        
        status = StatusRestaurante.get_status_atual()
        status.aberto = aberto
        status.atualizado_por = user_id
        
        if mensagem:
            status.mensagem_fechamento = mensagem
        
        db.session.commit()
        
        return jsonify({
            'message': f'Restaurante {"aberto" if aberto else "fechado"} com sucesso',
            'status': status.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/status/pausar-temporario', methods=['POST'])
@jwt_required()
def pausar_temporario():
    """Pausa pedidos temporariamente por X minutos (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        minutos = data.get('minutos')
        
        if not minutos or minutos <= 0:
            return jsonify({'error': 'Campo "minutos" deve ser maior que zero'}), 400
        
        from datetime import datetime, timedelta
        
        status = StatusRestaurante.get_status_atual()
        status.pausa_temporaria = True
        status.pausa_ate = datetime.utcnow() + timedelta(minutes=minutos)
        status.tempo_pausa_minutos = minutos
        status.aceita_pedidos = False
        status.atualizado_por = user_id
        
        db.session.commit()
        
        return jsonify({
            'message': f'Pedidos pausados por {minutos} minutos',
            'status': status.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/status/cancelar-pausa', methods=['POST'])
@jwt_required()
def cancelar_pausa():
    """Cancela a pausa temporária de pedidos (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        status = StatusRestaurante.get_status_atual()
        status.pausa_temporaria = False
        status.pausa_ate = None
        status.tempo_pausa_minutos = None
        status.aceita_pedidos = True
        status.atualizado_por = user_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pausa cancelada. Pedidos reativados',
            'status': status.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/status/update', methods=['PUT'])
@jwt_required()
def update_status():
    """Atualiza configurações de status do restaurante (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        status = StatusRestaurante.get_status_atual()
        
        # Atualizar campos permitidos
        if 'aberto' in data:
            status.aberto = data['aberto']
        
        if 'mensagem_fechamento' in data:
            status.mensagem_fechamento = data['mensagem_fechamento']
        
        if 'horario_abertura' in data:
            status.horario_abertura = data['horario_abertura']
        
        if 'horario_fechamento' in data:
            status.horario_fechamento = data['horario_fechamento']
        
        if 'dias_funcionamento' in data:
            # Converter lista para JSON string
            if isinstance(data['dias_funcionamento'], list):
                status.dias_funcionamento = json.dumps(data['dias_funcionamento'])
            else:
                status.dias_funcionamento = data['dias_funcionamento']
        
        if 'aceita_pedidos' in data:
            status.aceita_pedidos = data['aceita_pedidos']
        
        if 'modo_manutencao' in data:
            status.modo_manutencao = data['modo_manutencao']
        
        if 'pausa_temporaria' in data:
            status.pausa_temporaria = data['pausa_temporaria']
            # Se desativar pausa, limpar campos relacionados
            if not data['pausa_temporaria']:
                status.pausa_ate = None
                status.tempo_pausa_minutos = None
        
        status.atualizado_por = user_id
        db.session.commit()
        
        return jsonify({
            'message': 'Status atualizado com sucesso',
            'status': status.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ROTAS DE CONFIGURAÇÕES GERAIS
# ============================================================================

@configuracao_status_bp.route('/config', methods=['GET'])
@jwt_required()
def get_configuracoes():
    """Lista todas as configurações (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        configs = ConfiguracaoStatus.query.all()
        return jsonify([config.to_dict() for config in configs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/config/<chave>', methods=['GET'])
def get_configuracao(chave):
    """Retorna uma configuração específica"""
    try:
        config = ConfiguracaoStatus.query.filter_by(chave=chave).first()
        
        if not config:
            return jsonify({'error': 'Configuração não encontrada'}), 404
        
        return jsonify(config.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/config', methods=['POST'])
@jwt_required()
def criar_configuracao():
    """Cria ou atualiza uma configuração (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        chave = data.get('chave')
        valor = data.get('valor')
        tipo = data.get('tipo', 'string')
        descricao = data.get('descricao')
        
        if not chave or valor is None:
            return jsonify({'error': 'Campos "chave" e "valor" são obrigatórios'}), 400
        
        # Verificar se já existe
        config = ConfiguracaoStatus.query.filter_by(chave=chave).first()
        
        if config:
            # Atualizar
            config.valor = str(valor)
            config.tipo = tipo
            if descricao:
                config.descricao = descricao
        else:
            # Criar nova
            config = ConfiguracaoStatus(
                chave=chave,
                valor=str(valor),
                tipo=tipo,
                descricao=descricao
            )
            db.session.add(config)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Configuração salva com sucesso',
            'config': config.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@configuracao_status_bp.route('/config/<int:config_id>', methods=['DELETE'])
@jwt_required()
def deletar_configuracao(config_id):
    """Deleta uma configuração (apenas admin)"""
    try:
        # Verificar se é admin
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        config = ConfiguracaoStatus.query.get(config_id)
        
        if not config:
            return jsonify({'error': 'Configuração não encontrada'}), 404
        
        db.session.delete(config)
        db.session.commit()
        
        return jsonify({'message': 'Configuração deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

