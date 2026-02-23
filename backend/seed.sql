-- Execute este arquivo no MySQL Workbench para criar o banco, a tabela e inserir os produtos iniciais

CREATE DATABASE IF NOT EXISTS alpha_convites;
USE alpha_convites;

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  image_url   TEXT,
  category    TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price, image_url, category) VALUES
('Cartões de Visita', 'Cartão de visita couchê 300g, frente e verso colorido, acabamento fosco ou brilhante.', 9.99, 'https://placehold.co/150x150/ffffff/333333?text=Card', 'Mais Vendidos'),
('Flyers', 'Flyer couchê 150g, impressão frente e verso, formato A5.', 12.99, 'https://placehold.co/150x150/ffffff/333333?text=Flyer', 'Mais Vendidos'),
('Adesivos', 'Adesivos em vinil recortado ou impresso, resistente à água e ao sol.', 7.99, 'https://placehold.co/150x150/ffffff/333333?text=Adesivo', 'Mais Vendidos'),
('Embalagens', 'Embalagens personalizadas para produto, caixa kraft ou branca com logo.', 19.99, 'https://placehold.co/150x150/ffffff/333333?text=Embalagem', 'Embalagens'),
('Brindes', 'Brindes personalizados: canetas, canecas, chaveiros e mais.', 14.99, 'https://placehold.co/150x150/ffffff/333333?text=Brinde', 'Brindes'),
('Roupas', 'Camisetas, bonés e uniformes com sua marca, bordado ou silk screen.', 34.99, 'https://placehold.co/150x150/ffffff/333333?text=Roupa', 'Roupas'),
('Carimbos', 'Carimbo automático personalizado, com ou sem tinta, entrega rápida.', 29.99, 'https://placehold.co/150x150/ffffff/333333?text=Selo', 'Mais Vendidos'),
('Banners e Lonas', 'Banner em lona 440g com ilhoses, impressão digital de alta resolução.', 49.99, 'https://placehold.co/150x150/ffffff/333333?text=Banner', 'Materiais Promocionais');
