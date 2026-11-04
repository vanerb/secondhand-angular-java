-- SecondHand: base de datos de prueba con datos inventados.
-- Cuentas: lucia@secondhand.test, marcos@secondhand.test, ana@secondhand.test, pablo@secondhand.test
-- Contraseña de todas: Usuario123*
-- Importar en MySQL o MariaDB. No borra nada: si las tablas ya existen, la importación se detiene con un error.

CREATE DATABASE IF NOT EXISTS `secondhand_bd` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `secondhand_bd`;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user1_id` bigint NOT NULL,
  `user2_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqy0ufa6yoqyqsqkdfll9hp24a` (`product_id`),
  KEY `FK8wv0rmd8jb3cqcbyng15ubrmk` (`user1_id`),
  KEY `FKe7w0k1xem21pp85wxh5moodnk` (`user2_id`),
  CONSTRAINT `FK8wv0rmd8jb3cqcbyng15ubrmk` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKe7w0k1xem21pp85wxh5moodnk` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqy0ufa6yoqyqsqkdfll9hp24a` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgh1s14hhb9qb8p2do933hscsf` (`user_id`,`product_id`),
  KEY `FK6sgu5npe8ug4o42bf9j71x20c` (`product_id`),
  CONSTRAINT `FK6sgu5npe8ug4o42bf9j71x20c` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKk7du8b8ewipawnnpg76d55fus` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `image` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `from_id` bigint DEFAULT NULL,
  `from_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_cover` bit(1) DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `conversation_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt492th6wsovh1nush5yl5jj8e` (`conversation_id`),
  KEY `FK4ui4nnwntodh6wjvck53dbk9m` (`sender_id`),
  CONSTRAINT `FK4ui4nnwntodh6wjvck53dbk9m` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKt492th6wsovh1nush5yl5jj8e` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `method` enum('CARD','CASH') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `status` enum('CANCELLED','CASH_AWAITING_CONFIRMATION','PAID','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_id` bigint NOT NULL,
  `conversation_id` bigint NOT NULL,
  `price_offer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK5un4x2ot5xbgawcnqx0cwm8v5` (`price_offer_id`),
  KEY `FKg08mb5mpvbebidb9wewidf5al` (`buyer_id`),
  KEY `FK9137i04ws3ly0m3fvjmogp1mk` (`conversation_id`),
  KEY `FK7t03l8tlgddntpigs5oe1xyo6` (`product_id`),
  KEY `FKovvk2chrwh1hvqltk0365xe18` (`seller_id`),
  CONSTRAINT `FK7t03l8tlgddntpigs5oe1xyo6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FK9137i04ws3ly0m3fvjmogp1mk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `FKg08mb5mpvbebidb9wewidf5al` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKj7jxk540iqjnm3881yeppnnrt` FOREIGN KEY (`price_offer_id`) REFERENCES `price_offers` (`id`),
  CONSTRAINT `FKovvk2chrwh1hvqltk0365xe18` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `price_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `responded_at` datetime(6) DEFAULT NULL,
  `status` enum('ACCEPTED','CANCELLED','PENDING','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `receiver_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6qi38b525ogxecrg3oh28rk7f` (`conversation_id`),
  KEY `FK85pdghbk2ijf8edjp46k4h6y6` (`product_id`),
  KEY `FKt3bg1ieawoc1we3yw9qm68oi4` (`receiver_id`),
  KEY `FK4ymcfh71u2h1sfw1ewiwfoiun` (`sender_id`),
  CONSTRAINT `FK4ymcfh71u2h1sfw1ewiwfoiun` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK6qi38b525ogxecrg3oh28rk7f` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `FK85pdghbk2ijf8edjp46k4h6y6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKt3bg1ieawoc1we3yw9qm68oi4` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `availability` enum('AVAILABLE','RESERVED','SOLD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_condition` enum('GOOD','LIKE_NEW','NEW','USED','VERY_USED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdb050tk37qryv15hd932626th` (`user_id`),
  CONSTRAINT `FKdb050tk37qryv15hd932626th` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cogname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `name`, `cogname`, `email`, `password`, `profile_image`, `type`) VALUES
  (1, 'lucia.prado', 'Lucía', 'Prado', 'lucia@secondhand.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', NULL, 'USER'),
  (2, 'marcos.vega', 'Marcos', 'Vega', 'marcos@secondhand.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', NULL, 'USER'),
  (3, 'ana.solis', 'Ana', 'Solís', 'ana@secondhand.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', NULL, 'USER'),
  (4, 'pablo.nieto', 'Pablo', 'Nieto', 'pablo@secondhand.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', NULL, 'USER');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `product_condition`, `availability`, `description`, `archived`, `user_id`) VALUES
  (1, 'Chaqueta vaquera', 'CLOTHING', 35, 'GOOD', 'AVAILABLE', 'Chaqueta vaquera talla M, con poco uso y sin roturas.', 0, 1),
  (2, 'Teclado mecánico', 'COMPUTERS', 48, 'LIKE_NEW', 'AVAILABLE', 'Teclado mecánico con interruptores marrones y distribución española.', 0, 2),
  (3, 'Novela de misterio', 'BOOKS', 6, 'USED', 'AVAILABLE', 'Novela de bolsillo con algunas marcas en la portada.', 0, 3),
  (4, 'Bicicleta de paseo', 'SPORTS', 120, 'GOOD', 'RESERVED', 'Bicicleta de paseo con cesta delantera, revisada hace poco.', 0, 1),
  (5, 'Lámpara de escritorio', 'HOME', 18, 'NEW', 'AVAILABLE', 'Lámpara regulable sin estrenar, en su caja.', 0, 4),
  (6, 'Auriculares inalámbricos', 'ELECTRONICS', 30, 'VERY_USED', 'SOLD', 'Funcionan bien; la batería dura unas cuatro horas.', 0, 2),
  (7, 'Mando de consola', 'VIDEO_GAMES', 22, 'GOOD', 'AVAILABLE', 'Mando genérico con cable, probado y sin fallos.', 0, 3),
  (8, 'Funda de móvil', 'MOBILE', 5, 'NEW', 'AVAILABLE', 'Funda de silicona de color azul, sin usar.', 0, 4);
INSERT INTO `image` (`id`, `from_id`, `from_type`, `is_cover`, `url`) VALUES
  (1, 1, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23b5c7de''/%3E%3C/svg%3E'),
  (2, 2, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%238d99ae''/%3E%3C/svg%3E'),
  (3, 3, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23e0b1a0''/%3E%3C/svg%3E'),
  (4, 4, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%239bc4a4''/%3E%3C/svg%3E'),
  (5, 5, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23efd28d''/%3E%3C/svg%3E'),
  (6, 6, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23b9a7d9''/%3E%3C/svg%3E'),
  (7, 7, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23a3d5d3''/%3E%3C/svg%3E'),
  (8, 8, 'PRODUCT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%239db4e8''/%3E%3C/svg%3E');
INSERT INTO `favorites` (`id`, `product_id`, `user_id`) VALUES
  (1, 1, 2),
  (2, 2, 3),
  (3, 5, 1),
  (4, 7, 4);
INSERT INTO `conversations` (`id`, `created_at`, `product_id`, `user1_id`, `user2_id`) VALUES
  (1, '2026-10-01 10:00:00', 4, 2, 1),
  (2, '2026-10-03 18:30:00', 6, 3, 2);
INSERT INTO `messages` (`id`, `content`, `created_at`, `is_read`, `conversation_id`, `sender_id`) VALUES
  (1, 'Hola, ¿sigue disponible la bicicleta?', '2026-10-01 10:00:00', 1, 1, 2),
  (2, 'Sí, puedes verla cuando quieras.', '2026-10-01 10:12:00', 1, 1, 1),
  (3, '¿Aceptarías 100 euros?', '2026-10-01 10:15:00', 0, 1, 2),
  (4, 'Me quedo con los auriculares.', '2026-10-03 18:30:00', 1, 2, 3);
INSERT INTO `price_offers` (`id`, `amount`, `created_at`, `responded_at`, `status`, `conversation_id`, `product_id`, `receiver_id`, `sender_id`) VALUES
  (1, 100, '2026-10-01 10:15:00', NULL, 'PENDING', 1, 4, 1, 2),
  (2, 30, '2026-10-03 18:31:00', '2026-10-03 18:40:00', 'ACCEPTED', 2, 6, 2, 3);
INSERT INTO `payments` (`id`, `amount`, `cancelled_at`, `card_last4`, `created_at`, `method`, `paid_at`, `status`, `buyer_id`, `conversation_id`, `price_offer_id`, `product_id`, `seller_id`) VALUES
  (1, 30, NULL, '0000', '2026-10-03 18:45:00', 'CARD', '2026-10-03 18:45:00', 'PAID', 3, 2, 2, 6, 2);

SET FOREIGN_KEY_CHECKS = 1;
