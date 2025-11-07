from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

upload_bp = Blueprint('upload', __name__)

# Configurações de upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """
    Rota para upload de imagens
    Salva a imagem na pasta static/uploads e retorna a URL
    """
    try:
        # Verificar se há arquivo na requisição
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'Nenhum arquivo enviado'
            }), 400
        
        file = request.files['file']
        
        # Verificar se um arquivo foi selecionado
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'Nenhum arquivo selecionado'
            }), 400
        
        # Verificar extensão do arquivo
        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': 'Tipo de arquivo não permitido. Use: PNG, JPG, JPEG, GIF ou WEBP'
            }), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'status': 'error',
                'message': 'Arquivo muito grande. Tamanho máximo: 5MB'
            }), 400
        
        # Gerar nome único para o arquivo
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        
        # Criar diretório de uploads se não existir
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Gerar URL da imagem
        image_url = f"/static/uploads/{unique_filename}"
        
        return jsonify({
            'status': 'success',
            'message': 'Imagem enviada com sucesso',
            'data': {
                'url': image_url,
                'filename': unique_filename
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao fazer upload: {str(e)}'
        }), 500

@upload_bp.route('/delete', methods=['POST'])
def delete_image():
    """
    Rota para deletar imagens do servidor
    """
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({
                'status': 'error',
                'message': 'Nome do arquivo não fornecido'
            }), 400
        
        # Remover apenas o nome do arquivo da URL se vier completa
        if '/' in filename:
            filename = filename.split('/')[-1]
        
        # Caminho do arquivo
        upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
        file_path = os.path.join(upload_folder, filename)
        
        # Verificar se arquivo existe e deletar
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({
                'status': 'success',
                'message': 'Imagem deletada com sucesso'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Arquivo não encontrado'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao deletar imagem: {str(e)}'
        }), 500
