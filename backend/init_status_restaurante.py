#!/usr/bin/env python3
"""
Script para inicializar a tabela status_restaurante
Cria o registro padrão se não existir
"""

from app import create_app
from src.models.user import db
from src.models.configuracao import StatusRestaurante

def init_status():
    """Inicializa o status do restaurante"""
    app = create_app()
    
    with app.app_context():
        # Criar tabela se não existir
        db.create_all()
        print('✅ Tabelas verificadas/criadas')
        
        # Verificar se já existe um registro de status
        status = StatusRestaurante.query.first()
        
        if not status:
            print('📝 Criando registro padrão de status do restaurante...')
            
            novo_status = StatusRestaurante(
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
            
            db.session.add(novo_status)
            db.session.commit()
            
            print('✅ Status do restaurante criado com sucesso!')
            print('   Aberto: Sim')
            print('   Horário: 18:00 - 23:00')
            print('   Dias: Terça a Domingo')
        else:
            print('✅ Status do restaurante já existe')
            print(f'   Aberto: {"Sim" if status.aberto else "Não"}')
            print(f'   Horário: {status.horario_abertura} - {status.horario_fechamento}')

if __name__ == '__main__':
    print('=' * 60)
    print('🏪 INICIALIZAR STATUS DO RESTAURANTE')
    print('=' * 60)
    init_status()
    print('=' * 60)
    print('✅ Processo concluído!')
    print('=' * 60)
