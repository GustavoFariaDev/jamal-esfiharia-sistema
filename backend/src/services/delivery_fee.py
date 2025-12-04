"""
Módulo para cálculo de taxa de entrega baseado na distância.
"""

class DeliveryFeeCalculator:
    """Calculadora de taxa de entrega baseada em distância."""
    
    # Tabela de taxas por faixa de distância (0-9,5km)
    TABELA_FAIXAS = [
        (0.0, 1.5, 3.00),
        (1.5, 2.5, 4.00),
        (2.5, 3.5, 5.00),
        (3.5, 4.5, 6.00),
        (4.5, 5.5, 7.00),
        (5.5, 6.5, 8.00),
        (6.5, 7.5, 9.00),
        (7.5, 8.5, 10.00),
        (8.5, 9.5, 11.00),
    ]
    
    # Distâncias específicas (10km+) com arredondamento para cima
    DISTANCIAS_ESPECIFICAS = {
        10.0: 13.00,
        12.0: 15.00,
        13.0: 16.00,
        14.0: 18.00,
        15.0: 20.00,
        16.0: 22.00,
        18.0: 25.00,
        19.0: 27.00,
        20.0: 29.00,
    }
    
    @staticmethod
    def calcular_taxa(distancia_km):
        """
        Calcula a taxa de entrega baseada na distância.
        
        Args:
            distancia_km (float): Distância em quilômetros
            
        Returns:
            dict: Dicionário contendo:
                - taxa (float): Valor da taxa de entrega
                - distancia (float): Distância fornecida
                - faixa (str): Descrição da faixa de distância
                - erro (str): Mensagem de erro, se houver
        """
        if distancia_km is None or distancia_km < 0:
            return {
                "taxa": 0.0,
                "distancia": distancia_km,
                "faixa": None,
                "erro": "Distância inválida. Deve ser um valor positivo."
            }
        
        # Verificar faixas contínuas (0-9,5km)
        for min_dist, max_dist, taxa in DeliveryFeeCalculator.TABELA_FAIXAS:
            if min_dist <= distancia_km < max_dist:
                faixa_descricao = f"{min_dist}km a {max_dist}km"
                return {
                    "taxa": taxa,
                    "distancia": distancia_km,
                    "faixa": faixa_descricao,
                    "erro": None
                }
        
        # Verificar distâncias específicas (10km+)
        # Se a distância é exatamente um dos pontos tabelados
        if distancia_km in DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS:
            taxa = DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS[distancia_km]
            return {
                "taxa": taxa,
                "distancia": distancia_km,
                "faixa": f"{int(distancia_km)}km",
                "erro": None
            }
        
        # Se a distância é maior que 9,5km, arredondar para o próximo ponto tabelado
        if distancia_km > 9.5:
            # Encontrar o próximo ponto tabelado maior que a distância
            pontos_ordenados = sorted(DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS.keys())
            
            for ponto in pontos_ordenados:
                if distancia_km < ponto:
                    taxa = DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS[ponto]
                    return {
                        "taxa": taxa,
                        "distancia": distancia_km,
                        "faixa": f"até {int(ponto)}km",
                        "erro": None
                    }
            
            # Se passou de todos os pontos (> 20km)
            return {
                "taxa": 0.0,
                "distancia": distancia_km,
                "faixa": None,
                "erro": "Distância acima de 20km. Entre em contato para calcular a taxa."
            }
        
        # Distância entre 9,5 e 10km (arredondar para 10km)
        if 9.5 <= distancia_km < 10.0:
            taxa = DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS[10.0]
            return {
                "taxa": taxa,
                "distancia": distancia_km,
                "faixa": "até 10km",
                "erro": None
            }
        
        return {
            "taxa": 0.0,
            "distancia": distancia_km,
            "faixa": None,
            "erro": "Não foi possível calcular a taxa para esta distância."
        }
    
    @staticmethod
    def calcular_valor_total(valor_pedido, distancia_km):
        """
        Calcula o valor total do pedido incluindo a taxa de entrega.
        
        Args:
            valor_pedido (float): Valor do pedido sem taxa de entrega
            distancia_km (float): Distância em quilômetros
            
        Returns:
            dict: Dicionário contendo:
                - valor_pedido (float): Valor original do pedido
                - taxa_entrega (float): Taxa de entrega calculada
                - valor_total (float): Valor total (pedido + taxa)
                - distancia (float): Distância fornecida
                - faixa (str): Descrição da faixa de distância
                - erro (str): Mensagem de erro, se houver
        """
        if valor_pedido is None or valor_pedido < 0:
            return {
                "valor_pedido": valor_pedido,
                "taxa_entrega": 0.0,
                "valor_total": 0.0,
                "distancia": distancia_km,
                "faixa": None,
                "erro": "Valor do pedido inválido. Deve ser um valor positivo."
            }
        
        resultado_taxa = DeliveryFeeCalculator.calcular_taxa(distancia_km)
        
        if resultado_taxa["erro"]:
            return {
                "valor_pedido": valor_pedido,
                "taxa_entrega": 0.0,
                "valor_total": valor_pedido,
                "distancia": distancia_km,
                "faixa": resultado_taxa["faixa"],
                "erro": resultado_taxa["erro"]
            }
        
        taxa_entrega = resultado_taxa["taxa"]
        valor_total = round(valor_pedido + taxa_entrega, 2)
        
        return {
            "valor_pedido": valor_pedido,
            "taxa_entrega": taxa_entrega,
            "valor_total": valor_total,
            "distancia": distancia_km,
            "faixa": resultado_taxa["faixa"],
            "erro": None
        }
    
    @staticmethod
    def obter_tabela_completa():
        """
        Retorna a tabela completa de taxas de entrega.
        
        Returns:
            list: Lista de dicionários com as faixas e taxas
        """
        tabela = []
        
        # Adicionar faixas contínuas (0-9,5km)
        for min_dist, max_dist, taxa in DeliveryFeeCalculator.TABELA_FAIXAS:
            tabela.append({
                "faixa": f"{min_dist}km a {max_dist}km",
                "taxa": f"R$ {taxa:.2f}".replace('.', ',')
            })
        
        # Adicionar distâncias específicas (10km+)
        for dist in sorted(DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS.keys()):
            taxa = DeliveryFeeCalculator.DISTANCIAS_ESPECIFICAS[dist]
            tabela.append({
                "faixa": f"{int(dist)}km",
                "taxa": f"R$ {taxa:.2f}".replace('.', ',')
            })
        
        return tabela
