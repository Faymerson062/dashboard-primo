export type ProdutoMock = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoAntigo?: number;
  imagem: string;
  avaliacao: number;
  vendidos: number;
};

export const PRODUTOS: ProdutoMock[] = [
  { id: "1", nome: "Fone Bluetooth Pro", categoria: "Áudio", preco: 299.9, precoAntigo: 399.9, imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", avaliacao: 4.8, vendidos: 1240 },
  { id: "2", nome: "Smartwatch Série 7", categoria: "Wearables", preco: 899.0, precoAntigo: 1199.0, imagem: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80", avaliacao: 4.9, vendidos: 860 },
  { id: "3", nome: "Câmera Mirrorless", categoria: "Fotografia", preco: 3499.0, imagem: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80", avaliacao: 4.7, vendidos: 320 },
  { id: "4", nome: "Teclado Mecânico RGB", categoria: "Periféricos", preco: 459.9, precoAntigo: 549.9, imagem: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80", avaliacao: 4.6, vendidos: 2100 },
  { id: "5", nome: "Mouse Gamer Sem Fio", categoria: "Periféricos", preco: 249.9, imagem: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80", avaliacao: 4.5, vendidos: 1780 },
  { id: "6", nome: "Caixa de Som Portátil", categoria: "Áudio", preco: 199.0, precoAntigo: 259.0, imagem: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", avaliacao: 4.4, vendidos: 940 },
  { id: "7", nome: "Óculos VR Imersivo", categoria: "Realidade Virtual", preco: 1999.0, imagem: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80", avaliacao: 4.8, vendidos: 410 },
  { id: "8", nome: "Drone 4K Compacto", categoria: "Fotografia", preco: 2799.0, precoAntigo: 3199.0, imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80", avaliacao: 4.7, vendidos: 560 },
];

export const CATEGORIAS = ["Todos", "Áudio", "Wearables", "Fotografia", "Periféricos", "Realidade Virtual"];

export type UsuarioOnlineMock = {
  id: number;
  nome: string;
  avatar: string;
};

export type VisitaMock = {
  id: string;
  cidade: string;
  estado: string;
  pais: string;
  bandeira: string;
  site: string;
  status: "online" | "away" | "offline";
  hora: string;
};

export const VISITAS: VisitaMock[] = [
  { id: "v1", cidade: "São Paulo", estado: "SP", pais: "Brasil", bandeira: "🇧🇷", site: "loja.exemplo.com", status: "online", hora: "14:35" },
  { id: "v2", cidade: "Lisboa", estado: "Lisboa", pais: "Portugal", bandeira: "🇵🇹", site: "blog.exemplo.com", status: "online", hora: "14:30" },
  { id: "v3", cidade: "Rio de Janeiro", estado: "RJ", pais: "Brasil", bandeira: "🇧🇷", site: "loja.exemplo.com", status: "away", hora: "14:22" },
  { id: "v4", cidade: "Miami", estado: "FL", pais: "EUA", bandeira: "🇺🇸", site: "outlet.exemplo.com", status: "online", hora: "14:18" },
  { id: "v5", cidade: "Curitiba", estado: "PR", pais: "Brasil", bandeira: "🇧🇷", site: "promo.exemplo.com", status: "offline", hora: "14:05" },
  { id: "v6", cidade: "Porto", estado: "Porto", pais: "Portugal", bandeira: "🇵🇹", site: "blog.exemplo.com", status: "online", hora: "13:52" },
  { id: "v7", cidade: "Belo Horizonte", estado: "MG", pais: "Brasil", bandeira: "🇧🇷", site: "loja.exemplo.com", status: "away", hora: "13:40" },
];

export const USUARIOS_ONLINE: UsuarioOnlineMock[] = [
  { id: 1, nome: "João", avatar: "https://i.pravatar.cc/64?img=1" },
  { id: 2, nome: "Maria", avatar: "https://i.pravatar.cc/64?img=2" },
  { id: 3, nome: "Pedro", avatar: "https://i.pravatar.cc/64?img=3" },
  { id: 4, nome: "Ana", avatar: "https://i.pravatar.cc/64?img=4" },
  { id: 5, nome: "Carlos", avatar: "https://i.pravatar.cc/64?img=5" },
];
