"""
Serviço de integração com Google Maps API para cálculo de distância.
"""

import os
import requests
from typing import Dict, Optional


class GoogleMapsService:
    """Serviço para calcular distância usando Google Maps Distance Matrix API"""
    
    # Endereço do restaurante (configurável)
    ENDERECO_RESTAURANTE = os.getenv(
        'ENDERECO_RESTAURANTE',
        'Rua Exemplo, 100, São Paulo, SP, Brasil'
    )
    
    # API Key do Google Maps
    API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
    
    # URL base da API
    BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json'
    
    @classmethod
    def calcular_distancia(cls, endereco_destino: str) -> Dict:
        """
        Calcula a distância entre o restaurante e o endereço do cliente.
        
        Args:
            endereco_destino (str): Endereço completo do cliente
            
        Returns:
            dict: Dicionário contendo:
                - distancia_km (float): Distância em quilômetros
                - distancia_texto (str): Distância formatada (ex: "3.2 km")
                - duracao_texto (str): Tempo estimado (ex: "15 mins")
                - endereco_origem (str): Endereço do restaurante
                - endereco_destino (str): Endereço do cliente
                - erro (str): Mensagem de erro, se houver
        """
        
        # Validar API Key
        if not cls.API_KEY:
            return {
                "distancia_km": None,
                "distancia_texto": None,
                "duracao_texto": None,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": "API Key do Google Maps não configurada. Configure a variável GOOGLE_MAPS_API_KEY."
            }
        
        # Validar endereço de destino
        if not endereco_destino or not endereco_destino.strip():
            return {
                "distancia_km": None,
                "distancia_texto": None,
                "duracao_texto": None,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": "Endereço de destino inválido ou vazio."
            }
        
        try:
            # Preparar parâmetros da requisição
            params = {
                'origins': cls.ENDERECO_RESTAURANTE,
                'destinations': endereco_destino,
                'key': cls.API_KEY,
                'mode': 'driving',  # Modo de transporte: carro
                'language': 'pt-BR',  # Idioma português
                'units': 'metric'  # Sistema métrico (km)
            }
            
            # Fazer requisição à API
            response = requests.get(cls.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Verificar status da resposta
            if data.get('status') != 'OK':
                erro_msg = cls._traduzir_erro(data.get('status'))
                return {
                    "distancia_km": None,
                    "distancia_texto": None,
                    "duracao_texto": None,
                    "endereco_origem": cls.ENDERECO_RESTAURANTE,
                    "endereco_destino": endereco_destino,
                    "erro": erro_msg
                }
            
            # Extrair dados da resposta
            rows = data.get('rows', [])
            if not rows or not rows[0].get('elements'):
                return {
                    "distancia_km": None,
                    "distancia_texto": None,
                    "duracao_texto": None,
                    "endereco_origem": cls.ENDERECO_RESTAURANTE,
                    "endereco_destino": endereco_destino,
                    "erro": "Não foi possível calcular a distância para este endereço."
                }
            
            element = rows[0]['elements'][0]
            
            # Verificar se a rota foi encontrada
            if element.get('status') != 'OK':
                erro_msg = cls._traduzir_erro_elemento(element.get('status'))
                return {
                    "distancia_km": None,
                    "distancia_texto": None,
                    "duracao_texto": None,
                    "endereco_origem": cls.ENDERECO_RESTAURANTE,
                    "endereco_destino": endereco_destino,
                    "erro": erro_msg
                }
            
            # Extrair distância e duração
            distance = element.get('distance', {})
            duration = element.get('duration', {})
            
            distancia_metros = distance.get('value', 0)
            distancia_km = round(distancia_metros / 1000, 1)  # Converter para km com 1 casa decimal
            distancia_texto = distance.get('text', f'{distancia_km} km')
            duracao_texto = duration.get('text', 'N/A')
            
            return {
                "distancia_km": distancia_km,
                "distancia_texto": distancia_texto,
                "duracao_texto": duracao_texto,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": None
            }
            
        except requests.exceptions.Timeout:
            return {
                "distancia_km": None,
                "distancia_texto": None,
                "duracao_texto": None,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": "Timeout ao conectar com Google Maps. Tente novamente."
            }
        except requests.exceptions.RequestException as e:
            return {
                "distancia_km": None,
                "distancia_texto": None,
                "duracao_texto": None,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": f"Erro ao conectar com Google Maps: {str(e)}"
            }
        except Exception as e:
            return {
                "distancia_km": None,
                "distancia_texto": None,
                "duracao_texto": None,
                "endereco_origem": cls.ENDERECO_RESTAURANTE,
                "endereco_destino": endereco_destino,
                "erro": f"Erro inesperado: {str(e)}"
            }
    
    @staticmethod
    def _traduzir_erro(status: str) -> str:
        """Traduz códigos de erro da API para mensagens em português"""
        erros = {
            'INVALID_REQUEST': 'Requisição inválida. Verifique o endereço informado.',
            'MAX_ELEMENTS_EXCEEDED': 'Limite de requisições excedido.',
            'OVER_DAILY_LIMIT': 'Limite diário da API excedido. Tente novamente amanhã.',
            'OVER_QUERY_LIMIT': 'Limite de requisições excedido. Tente novamente em alguns minutos.',
            'REQUEST_DENIED': 'Acesso negado à API. Verifique a configuração da API Key.',
            'UNKNOWN_ERROR': 'Erro desconhecido. Tente novamente.'
        }
        return erros.get(status, f'Erro na API do Google Maps: {status}')
    
    @staticmethod
    def _traduzir_erro_elemento(status: str) -> str:
        """Traduz códigos de erro de elemento para mensagens em português"""
        erros = {
            'NOT_FOUND': 'Endereço não encontrado. Verifique se o endereço está correto.',
            'ZERO_RESULTS': 'Não foi possível encontrar uma rota para este endereço.',
            'MAX_ROUTE_LENGTH_EXCEEDED': 'Distância muito grande para calcular.'
        }
        return erros.get(status, f'Erro ao calcular rota: {status}')
    
    @classmethod
    def validar_configuracao(cls) -> Dict:
        """
        Valida se a configuração do Google Maps está correta.
        
        Returns:
            dict: Status da configuração
        """
        if not cls.API_KEY:
            return {
                "configurado": False,
                "mensagem": "API Key não configurada. Configure GOOGLE_MAPS_API_KEY nas variáveis de ambiente."
            }
        
        if not cls.ENDERECO_RESTAURANTE:
            return {
                "configurado": False,
                "mensagem": "Endereço do restaurante não configurado. Configure ENDERECO_RESTAURANTE nas variáveis de ambiente."
            }
        
        return {
            "configurado": True,
            "mensagem": "Google Maps configurado corretamente.",
            "endereco_restaurante": cls.ENDERECO_RESTAURANTE,
            "api_key_presente": bool(cls.API_KEY)
        }

