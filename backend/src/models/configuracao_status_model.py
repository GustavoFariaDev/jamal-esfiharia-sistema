"""
Modelo de Configuração do Restaurante
Gerencia configurações como horário de funcionamento e status de abertura
"""
from datetime import datetime
from src.models.user import db

class ConfiguracaoStatus(db.Model):
    """Modelo para armazenar configurações do restaurante"""
    __tablename__ = 'configuracao_status'
    
    id = db.Column(db.Integer, primary_key=True)
    chave = db.Column(db.String(100), unique=True, nullable=False)
    valor = db.Column(db.String(500), nullable=False)
    tipo = db.Column(db.String(50), default='string')  # string, boolean, json
    descricao = db.Column(db.String(200))
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        valor_convertido = self.valor
        
        # Converter valor baseado no tipo
        if self.tipo == 'boolean':
            valor_convertido = self.valor.lower() in ['true', '1', 'sim', 'yes']
        elif self.tipo == 'json':
            import json
            try:
                valor_convertido = json.loads(self.valor)
            except:
                valor_convertido = self.valor
        
        return {
            'id': self.id,
            'chave': self.chave,
            'valor': valor_convertido,
            'tipo': self.tipo,
            'descricao': self.descricao,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None
        }

class StatusRestaurante(db.Model):
    """Modelo para gerenciar status de abertura/fechamento do restaurante"""
    __tablename__ = 'status_restaurante'
    
    id = db.Column(db.Integer, primary_key=True)
    aberto = db.Column(db.Boolean, default=True, nullable=False)
    mensagem_fechamento = db.Column(db.String(500))
    horario_abertura = db.Column(db.String(5))  # Formato: HH:MM
    horario_fechamento = db.Column(db.String(5))  # Formato: HH:MM
    dias_funcionamento = db.Column(db.String(100))  # JSON: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]
    aceita_pedidos = db.Column(db.Boolean, default=True, nullable=False)
    modo_manutencao = db.Column(db.Boolean, default=False, nullable=False)
    pausa_temporaria = db.Column(db.Boolean, default=False, nullable=False)
    pausa_ate = db.Column(db.DateTime, nullable=True)  # Quando a pausa temporária termina
    tempo_pausa_minutos = db.Column(db.Integer, nullable=True)  # Duração da pausa em minutos
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    atualizado_por = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        import json
        
        dias = []
        if self.dias_funcionamento:
            try:
                dias = json.loads(self.dias_funcionamento)
            except:
                dias = []
        
        return {
            'id': self.id,
            'aberto': self.aberto,
            'mensagem_fechamento': self.mensagem_fechamento,
            'horario_abertura': self.horario_abertura,
            'horario_fechamento': self.horario_fechamento,
            'dias_funcionamento': dias,
            'aceita_pedidos': self.aceita_pedidos,
            'modo_manutencao': self.modo_manutencao,
            'pausa_temporaria': self.pausa_temporaria,
            'pausa_ate': self.pausa_ate.isoformat() if self.pausa_ate else None,
            'tempo_pausa_minutos': self.tempo_pausa_minutos,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None,
            'atualizado_por': self.atualizado_por
        }
    
    @staticmethod
    def get_status_atual():
        """Retorna o status atual do restaurante"""
        status = StatusRestaurante.query.first()
        if not status:
            # Criar status padrão se não existir
            status = StatusRestaurante(
                aberto=True,
                mensagem_fechamento='Estamos fechados no momento. Volte em breve!',
                horario_abertura='18:00',
                horario_fechamento='23:00',
                dias_funcionamento='["ter", "qua", "qui", "sex", "sab", "dom"]',
                aceita_pedidos=True,
                modo_manutencao=False,
                pausa_temporaria=False,
                pausa_ate=None,
                tempo_pausa_minutos=None
            )
            db.session.add(status)
            db.session.commit()
        
        return status
    
    @staticmethod
    def verificar_horario_funcionamento():
        """Verifica se o restaurante está aberto baseado no horário atual"""
        import json
        from datetime import datetime
        
        status = StatusRestaurante.get_status_atual()
        
        # Se está em modo manutenção, retorna fechado
        if status.modo_manutencao:
            return False, "Sistema em manutenção"
        
        # Se foi manualmente fechado, retorna fechado
        if not status.aberto:
            return False, status.mensagem_fechamento or "Estamos fechados no momento"
        
        # Se foi manualmente aberto, retorna aberto (ignora horário automático)
        # Isso permite que o admin abra a loja fora do horário normal
        if status.aberto:
            return True, "Restaurante aberto"
        
        # Verificar se está em pausa temporária
        if status.pausa_temporaria and status.pausa_ate:
            agora_utc = datetime.utcnow()
            if agora_utc < status.pausa_ate:
                minutos_restantes = int((status.pausa_ate - agora_utc).total_seconds() / 60)
                return False, f"Pausado temporariamente. Voltamos em {minutos_restantes} minutos"
            else:
                # Pausa expirou, desativar
                status.pausa_temporaria = False
                status.pausa_ate = None
                status.tempo_pausa_minutos = None
                db.session.commit()
        
        # Verificar dia da semana
        dias_semana = {
            0: 'seg', 1: 'ter', 2: 'qua', 3: 'qui',
            4: 'sex', 5: 'sab', 6: 'dom'
        }
        
        agora = datetime.now()
        dia_atual = dias_semana[agora.weekday()]
        
        try:
            dias_funcionamento = json.loads(status.dias_funcionamento) if status.dias_funcionamento else []
        except:
            dias_funcionamento = []
        
        if dia_atual not in dias_funcionamento:
            return False, f"Não abrimos às {['segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados', 'domingos'][agora.weekday()]}"
        
        # Verificar horário
        if status.horario_abertura and status.horario_fechamento:
            try:
                hora_abertura = datetime.strptime(status.horario_abertura, '%H:%M').time()
                hora_fechamento = datetime.strptime(status.horario_fechamento, '%H:%M').time()
                hora_atual = agora.time()
                
                if not (hora_abertura <= hora_atual <= hora_fechamento):
                    return False, f"Horário de funcionamento: {status.horario_abertura} às {status.horario_fechamento}"
            except ValueError as e:
                # Formato de horário inválido, ignorar verificação de horário
                print(f"Erro ao validar horário: {e}")
        
        return True, "Restaurante aberto"

