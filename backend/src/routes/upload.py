from flask import Blueprint, request, jsonify
import cloudinary
import cloudinary.uploader
import os

upload_bp = Blueprint('upload', __name__)

# Configurar Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'dbb7oidld'),
    api_key=os.getenv('CLOUDINARY_API_KEY', '468221897619255'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'HTmVxJABYYsmtUBsrYP13NSW9CU')
)

# Configurações de upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """
    Rota para upload de imagens no Cloudinary
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
        
        # Fazer upload para o Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder='jamal-esfiharia',  # Pasta no Cloudinary
            resource_type='image',
            format='webp',  # Converter para webp para otimização
            transformation=[
                {'width': 800, 'height': 800, 'crop': 'limit'},  # Limitar tamanho
                {'quality': 'auto'},  # Qualidade automática
                {'fetch_format': 'auto'}  # Formato automático
            ]
        )
        
        # Obter URL da imagem
        image_url = upload_result['secure_url']
        public_id = upload_result['public_id']
        
        print(f"Upload realizado com sucesso: {image_url}")
        
        return jsonify({
            'status': 'success',
            'message': 'Imagem enviada com sucesso',
            'data': {
                'url': image_url,
                'public_id': public_id
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao fazer upload: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Erro ao fazer upload: {str(e)}'
        }), 500

@upload_bp.route('/delete', methods=['POST'])
def delete_image():
    """
    Rota para deletar imagens do Cloudinary
    """
    try:
        data = request.get_json()
        public_id = data.get('public_id')
        
        if not public_id:
            return jsonify({
                'status': 'error',
                'message': 'ID da imagem não fornecido'
            }), 400
        
        # Deletar do Cloudinary
        result = cloudinary.uploader.destroy(public_id)
        
        if result.get('result') == 'ok':
            return jsonify({
                'status': 'success',
                'message': 'Imagem deletada com sucesso'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Erro ao deletar imagem'
            }), 500
            
    except Exception as e:
        print(f"Erro ao deletar imagem: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Erro ao deletar imagem: {str(e)}'
        }), 500
