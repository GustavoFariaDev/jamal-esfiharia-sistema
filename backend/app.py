#!/usr/bin/env python3
"""
Aplicação Flask - Sistema de Gestão Jamal Esfiharia
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db

def create_app():
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Caminho absoluto para o banco de dados
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(basedir, 'instance')
    db_path = os.path.join(instance_path, 'jamal.db')
    
    # Criar diretórios necessários
    os.makedirs(instance_path, exist_ok=True)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
    
    # Criar diretório de uploads se não existir
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Inicializar extensões
    db.init_app(app)
    
    # Configurar CORS para aceitar requisições do frontend
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             "expose_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
         }},
         supports_credentials=False)
    
    # Configurar JWT
    from flask_jwt_extended import JWTManager
    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
    jwt = JWTManager(app)
    
    # Registrar blueprints/rotas
    from src.routes.auth import auth_bp
    from src.routes.user import user_bp
    from src.routes.esfiha import esfiha_bp
    from src.routes.pedido import pedido_bp
    from src.routes.categories import categories_bp
    from src.routes.upload import upload_bp
    from src.routes.print import print_bp
    from src.routes.delivery import delivery_bp
    from src.routes.pedido_simples import pedido_simples_bp
    from src.routes.configuracao_status import configuracao_status_bp # Importar a nova rota de status
    from src.routes.acrescimos import acrescimos_bp
    from src.routes.cliente import cliente_bp
    from src.routes.status_pedido import status_pedido_bp
    from src.routes.setup import setup_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(esfiha_bp, url_prefix='/api/esfihas')
    app.register_blueprint(pedido_bp, url_prefix='/api/pedidos')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(print_bp, url_prefix='/api/print')
    app.register_blueprint(delivery_bp, url_prefix='/api/delivery')
    app.register_blueprint(pedido_simples_bp, url_prefix='/api/pedidos-simples')
    app.register_blueprint(configuracao_status_bp, url_prefix='/api/configuracao')
    app.register_blueprint(acrescimos_bp, url_prefix='/api')
    app.register_blueprint(cliente_bp, url_prefix='/api/clientes')
    app.register_blueprint(status_pedido_bp, url_prefix='/api/pedidos')
    app.register_blueprint(setup_bp, url_prefix='/api/setup')
    
    # Rota para servir arquivos de upload
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Servir arquivos estáticos do React build (JS e CSS)
    @app.route('/static/js/<path:filename>')
    def serve_static_js(filename):
        static_js_folder = os.path.join(os.getcwd(), 'static', 'static', 'js')
        return send_from_directory(static_js_folder, filename)
    
    @app.route('/static/css/<path:filename>')
    def serve_static_css(filename):
        static_css_folder = os.path.join(os.getcwd(), 'static', 'static', 'css')
        return send_from_directory(static_css_folder, filename)
    
    # Rota para servir arquivos estáticos (imagens de upload)
    @app.route('/static/uploads/<filename>')
    def static_uploaded_file(filename):
        static_uploads_path = os.path.join(os.getcwd(), 'static', 'uploads')
        return send_from_directory(static_uploads_path, filename)
    
    # Servir frontend React
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        static_folder = os.path.join(os.getcwd(), 'static')
        # Ignora rotas da API
        if path.startswith('api/'):
            return {'error': 'Not found'}, 404
        # Serve arquivos se existirem
        if path and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        # Caso contrário, serve o index.html
        return send_from_directory(static_folder, 'index.html')
    
    # Criar tabelas do banco de dados
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    print("=" * 60)
    print("🥟 JAMAL ESFIHARIA - SISTEMA DE GESTÃO")
    print("=" * 60)
    print("🌐 Servidor iniciando...")
    print("📱 Painel Admin: http://localhost:5000/admin")
    print("🔧 API Base: http://localhost:5000/api/")
    print("=" * 60)
    
    # Executar servidor
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        use_reloader=False
    )
