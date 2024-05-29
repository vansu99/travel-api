-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 15, 2024 lúc 04:57 AM
-- Phiên bản máy phục vụ: 10.4.27-MariaDB
-- Phiên bản PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `demo`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `advertises`
--

CREATE TABLE `advertises` (
  `advertise_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT curdate(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `advertises`
--

INSERT INTO `advertises` (`advertise_id`, `title`, `image`, `location`, `description`, `created_at`, `deleted_at`) VALUES
(1, 'Bài viết 1', '', '', 'Mô tả bài viết 1', '2024-05-15 00:00:00', NULL),
(2, 'Bài viết 2', '', '', 'Mô tả bài viết 2', '2024-05-15 00:00:00', NULL),
(3, 'Bài viết 3', '', '', 'Mô tả bài viết 3', '2024-05-15 00:00:00', NULL);



-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(13) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `token` text DEFAULT NULL,
  `created_at` datetime DEFAULT curdate(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`customer_id`, `name`, `phone_number`, `email`, `user_name`, `password`, `token`, `created_at`, `deleted_at`) VALUES
(1, 'Admin', '0976849539', 'admin@gmail.com', 'admin', '123456Aa@', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidHlwZSI6InVzZXIiLCJleHBpcmUiOiIyMDI0LTA1LTE2VDA4OjU2OjIyKzA3OjAwIiwiaWF0IjoxNzE1NzM4MTgyfQ.ik8FHwOAwHpGkF60hNacGZdvJrajuZMUi9kplMavlTw', '2024-05-23T13:01:45.000Z', NULL),
(7, 'Customer 1', '0976849539', '', 'customer 1', '8a88afced3a218f436ced6f277a2d1e5', NULL, '2024-05-15 00:00:00', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tours`
--

CREATE TABLE `tours` (
  `tour_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` bigint(20) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT curdate(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tours`
--

INSERT INTO `tours` (`tour_id`, `name`, `location`, `image`, `description`, `price`, `start_time`, `end_time`,`created_at`, `deleted_at`) VALUES
(2, 'Tour 1', 'Nha Trang, Khanh Hoa, Vietnam', '', 'スタイルで大切にしている事◎☆お顔周りの似あわせ☆ 肌の魅せ方を活かして似合うを見つけま', 3000000, '2024-08-21 08:50:19', '2024-09-24 08:50:19','2024-05-15 00:00:00', NULL),
(3, 'Tour 2', 'Nha Trang, Khanh Hoa, Vietnam', '', '', 15000000, '2024-07-13 08:50:19', '2024-07-29 08:50:19','2024-05-15 00:00:00', NULL),
(4, 'Tour 3', 'Nha Trang, Khanh Hoa, Vietnam', '', '', 14000000, '2024-07-04 08:50:19', '2024-07-29 08:50:19','2024-05-15 00:00:00', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_regis_informations`
--

CREATE TABLE `tour_regis_informations` (
  `tour_regis_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `person_quantity` smallint(6) DEFAULT NULL,
  `price` bigint(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL, 
  `created_at` datetime DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tour_regis_informations`
--

INSERT INTO `tour_regis_informations` (`tour_regis_id`, `customer_id`, `tour_id`, `person_quantity`, `price`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(5, 1, 2, 3, 3000000, '2024-06-01', '2024-06-03', "DONE", '2024-05-13 00:00:00'),
(6, 1, 5, 3, 3000000, '2024-06-01', '2024-06-03', "DONE", '2024-05-13 00:00:00'),
(7, 1, 8, 3, 3000000, '2024-06-01', '2024-06-03', "DONE", '2024-05-15 00:00:00');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `advertises`
--
ALTER TABLE `advertises`
  ADD PRIMARY KEY (`advertise_id`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- Chỉ mục cho bảng `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`tour_id`);

--
-- Chỉ mục cho bảng `tour_regis_informations`
--
ALTER TABLE `tour_regis_informations`
  ADD PRIMARY KEY (`tour_regis_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `advertises`
--
ALTER TABLE `advertises`
  MODIFY `advertise_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `tours`
--
ALTER TABLE `tours`
  MODIFY `tour_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT cho bảng `tour_regis_informations`
--
ALTER TABLE `tour_regis_informations`
  MODIFY `tour_regis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
