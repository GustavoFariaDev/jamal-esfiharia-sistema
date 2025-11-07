"""
Módulo para cálculo de taxa de entrega baseado na distância.
"""

class DeliveryFeeCalculator:
    """Calculadora de taxa de entrega baseada em distância."""
    
    # Tabela de taxas por faixa de distância
    TABELA_TAXAS = [
        (0.0, 1.5, 3.00),
        (1.5, 2.5, 4.00),
        (2.5, 3.5, 5.00),
        (3.5, 4.5, 6.00),
        (4.5, 5.5, 7.00),
        (5.5, 6.5, 8.00),
        (6.5, 7.5, 9.00),
        (7.5, 8.5, 10.00),
        (8.5, 9.5, 11.00),
        (9.5, 10.0, 11.00),
        (10.0, 10.01, 13.00),
        (10.01, 12.0, 15.00),
        (12.0, 13.0, 16.00),
        (13.0, 14.0, 18.00),
        (14.0, 15.0, 20.00),
        (15.0, 16.0, 22.00),
        (16.0, 18.0, 25.00),
        (18.0, 19.0, 27.00),
        (19.0, 20.0, 29.00),
    ]
    
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
        
        # Casos especiais: distâncias exatas
        distancias_especificas = {
            10.0: (13.00, "10km"),
            12.0: (15.00, "12km"),
            13.0: (16.00, "13km"),
            14.0: (18.00, "14km"),
            15.0: (20.00, "15km"),
            16.0: (22.00, "16km"),
            18.0: (25.00, "18km"),
            19.0: (27.00, "19km"),
            20.0: (29.00, "20km"),
        }
        
        if distancia_km in distancias_especificas:
            taxa, faixa = distancias_especificas[distancia_km]
            return {
                "taxa": taxa,
                "distancia": distancia_km,
                "faixa": faixa,
                "erro": None
            }
        
        # Buscar a taxa correspondente na tabela
        for min_dist, max_dist, taxa in DeliveryFeeCalculator.TABELA_TAXAS:
            if min_dist <= distancia_km < max_dist:
                faixa_descricao = f"{min_dist}km a {max_dist}km"
                return {
                    "taxa": taxa,
                    "distancia": distancia_km,
                    "faixa": faixa_descricao,
                    "erro": None
                }
        
        # Distâncias específicas entre 10km e 20km
        taxas_especificas = {
            12.0: 15.00,
            13.0: 16.00,
            14.0: 18.00,
            15.0: 20.00,
            16.0: 22.00,
            18.0: 25.00,
            19.0: 27.00,
            20.0: 29.00,
        }
        
        if distancia_km in taxas_especificas:
            return {
                "taxa": taxas_especificas[distancia_km],
                "distancia": distancia_km,
                "faixa": f"{distancia_km}km",
                "erro": None
            }
        
        # Distância acima de 20km ou entre valores específicos não definidos
        if distancia_km > 20.0:
            return {
                "taxa": 0.0,
                "distancia": distancia_km,
                "faixa": None,
                "erro": "Distância acima de 20km. Entre em contato para calcular a taxa."
            }
        
        # Distância entre valores específicos (ex: 10.5km, 11km, etc.)
        # Arredondar para o próximo valor da tabela
        for dist_especifica in sorted(taxas_especificas.keys()):
            if distancia_km < dist_especifica:
                return {
                    "taxa": taxas_especificas[dist_especifica],
                    "distancia": distancia_km,
                    "faixa": f"até {dist_especifica}km",
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
        
        # Adicionar faixas contínuas
        for min_dist, max_dist, taxa in DeliveryFeeCalculator.TABELA_TAXAS[:9]:
            tabela.append({
                "faixa": f"{min_dist}km a {max_dist}km",
                "taxa": f"R$ {taxa:.2f}".replace('.', ',')
            })
        
        # Adicionar distâncias específicas
        distancias_especificas = [
            (10, 13.00),
            (12, 15.00),
            (13, 16.00),
            (14, 18.00),
            (15, 20.00),
            (16, 22.00),
            (18, 25.00),
            (19, 27.00),
            (20, 29.00),
        ]
        
        for dist, taxa in distancias_especificas:
            tabela.append({
                "faixa": f"{dist}km",
                "taxa": f"R$ {taxa:.2f}".replace('.', ',')
            })
        
        return tabela

