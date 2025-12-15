"""
Endpoint para assinatura de requisições do QZ Tray
Permite que o QZ Tray funcione em HTTPS sem bloqueio de certificado
"""
import os
import base64
import hashlib
from flask import Blueprint, request, jsonify, send_file
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

qz_signing_bp = Blueprint('qz_signing', __name__)

# Caminhos dos arquivos de certificado
CERT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'certs')
PRIVATE_KEY_PATH = os.path.join(CERT_DIR, 'private-key.pem')
CERTIFICATE_PATH = os.path.join(CERT_DIR, 'digital-certificate.txt')


@qz_signing_bp.route('/qz/certificate', methods=['GET'])
def get_certificate():
    """
    Retorna o certificado público para o QZ Tray
    """
    try:
        if not os.path.exists(CERTIFICATE_PATH):
            return jsonify({
                'success': False,
                'error': 'Certificado não encontrado'
            }), 404
        
        return send_file(
            CERTIFICATE_PATH,
            mimetype='text/plain',
            as_attachment=False
        )
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@qz_signing_bp.route('/qz/sign', methods=['POST'])
def sign_request():
    """
    Assina uma requisição do QZ Tray usando a chave privada
    
    Recebe:
        - request (string): Dados a serem assinados
    
    Retorna:
        - signature (string): Assinatura em base64
    """
    try:
        # Obter dados da requisição
        data = request.get_json()
        
        if not data or 'request' not in data:
            return jsonify({
                'success': False,
                'error': 'Dados inválidos. Envie {"request": "dados_para_assinar"}'
            }), 400
        
        to_sign = data['request']
        
        # Verificar se a chave privada existe
        if not os.path.exists(PRIVATE_KEY_PATH):
            return jsonify({
                'success': False,
                'error': 'Chave privada não encontrada'
            }), 404
        
        # Carregar chave privada
        with open(PRIVATE_KEY_PATH, 'rb') as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )
        
        # Assinar os dados
        signature = private_key.sign(
            to_sign.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA512()
        )
        
        # Converter para base64
        signature_b64 = base64.b64encode(signature).decode('utf-8')
        
        return jsonify({
            'success': True,
            'signature': signature_b64
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@qz_signing_bp.route('/qz/test', methods=['GET'])
def test_signing():
    """
    Testa se o sistema de assinatura está funcionando
    """
    try:
        # Verificar se os arquivos existem
        cert_exists = os.path.exists(CERTIFICATE_PATH)
        key_exists = os.path.exists(PRIVATE_KEY_PATH)
        
        # Ler certificado
        cert_content = None
        if cert_exists:
            with open(CERTIFICATE_PATH, 'r') as f:
                cert_content = f.read()[:100] + '...'  # Primeiros 100 caracteres
        
        return jsonify({
            'success': True,
            'certificate_exists': cert_exists,
            'private_key_exists': key_exists,
            'certificate_preview': cert_content,
            'cert_path': CERTIFICATE_PATH,
            'key_path': PRIVATE_KEY_PATH
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
