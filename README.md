# 🚧 WIP — Work in Progress

# 🛍️ SecondHand — Angular + Java Spring Boot

**SecondHand** es una aplicación web de compraventa de productos de segunda mano, desarrollada con **Angular** en el frontend y **Java Spring Boot** en el backend.

La aplicación permite a los usuarios publicar productos, consultar artículos de otros usuarios, realizar búsquedas y aplicar filtros, guardar productos como favoritos y comunicarse mediante un sistema de chat.

El proyecto se encuentra actualmente **en desarrollo**.

---

## ✨ Funcionalidades

### 🛍️ Gestión de productos

Los usuarios pueden publicar productos para ponerlos a disposición de otros usuarios.

Cada producto puede contener información como:

* Nombre
* Categoría
* Precio
* Estado
* Disponibilidad
* Descripción
* Imágenes

Los productos pueden editarse o eliminarse posteriormente.

---

### 📸 Imágenes de productos

Los productos pueden tener varias imágenes para mostrar su estado y características.

La aplicación permite gestionar las imágenes asociadas a cada producto, incluyendo una imagen principal o de portada.

---

### 🔎 Búsqueda y filtros

La aplicación incorpora diferentes opciones para localizar productos rápidamente.

Se pueden utilizar filtros como:

* Nombre
* Categoría
* Precio mínimo
* Precio máximo
* Estado
* Disponibilidad
* Descripción

Esto permite encontrar productos concretos dentro de la colección de artículos publicados.

---

### ❤️ Favoritos

Los usuarios pueden guardar productos como favoritos para acceder a ellos posteriormente.

Los productos marcados como favoritos se gestionan de forma independiente para cada usuario.

---

### 💬 Chat entre usuarios

La aplicación incorpora un sistema de comunicación entre usuarios para facilitar el contacto entre compradores y vendedores.

El sistema utiliza **WebSocket**, permitiendo la comunicación en tiempo real.

Esto permite:

* Crear conversaciones.
* Consultar conversaciones existentes.
* Enviar mensajes.
* Recibir mensajes en tiempo real.
* Contactar con el vendedor de un producto.

---

### 👤 Usuarios

Cada usuario dispone de un perfil con información propia.

Entre los datos gestionados se encuentran:

* Nombre
* Apellidos
* Nombre de usuario
* Correo electrónico
* Imagen de perfil

También se permite gestionar una imagen de perfil y una imagen de portada.

---

### 🔐 Autenticación

El proyecto incorpora autenticación mediante **JWT (JSON Web Token)**.

Los usuarios pueden:

* Registrarse.
* Iniciar sesión.
* Mantener su sesión autenticada.
* Acceder a funcionalidades protegidas.

El backend utiliza Spring Security para proteger los diferentes recursos de la aplicación.

---

### 📦 Estados de los productos

Los productos pueden encontrarse en diferentes estados de conservación:

| Estado         | Descripción                         |
| -------------- | ----------------------------------- |
| **Nuevo**      | Producto sin utilizar               |
| **Como nuevo** | Producto prácticamente nuevo        |
| **Bueno**      | Producto en buen estado             |
| **Usado**      | Producto con signos normales de uso |
| **Muy usado**  | Producto con un uso considerable    |

También se puede indicar la disponibilidad del producto:

| Disponibilidad | Descripción                    |
| -------------- | ------------------------------ |
| **Disponible** | El producto está disponible    |
| **Reservado**  | El producto está reservado     |
| **Vendido**    | El producto ya ha sido vendido |

---

## 🗂️ Categorías

Los productos pueden clasificarse en diferentes categorías:

* 💻 Electrónica
* 🖥️ Informática
* 🎮 Videojuegos
* 📱 Móviles
* 👕 Ropa
* 🏠 Hogar
* ⚽ Deporte
* 📚 Libros
* 📦 Otros

---

## 🛠️ Tecnologías utilizadas

### Frontend

* **Angular**
* **TypeScript**
* **HTML5**
* **CSS**
* **Tailwind CSS**
* **Angular Material**
* **Bootstrap Icons**
* **RxJS**

### Backend

* **Java**
* **Spring Boot**
* **Spring Security**
* **Spring Data JPA**
* **Hibernate**
* **Maven**
* **REST API**
* **WebSocket**

### Base de datos

* **MySQL**

### Autenticación

* **JWT (JSON Web Token)**

### Herramientas

* **Git**
* **GitHub**
* **Postman**
* **npm**
* **Maven**

---

## 📂 Estructura del proyecto

```text id="8p7d3x"
SecondHand-Angular-Java/
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── ...
│
└── README.md
```

---

## 🏗️ Arquitectura

SecondHand utiliza una arquitectura cliente-servidor dividida en frontend y backend:

```text
                       ┌───────────────────┐
                       │      Usuario      │
                       └─────────┬─────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │      Angular     │
                       │     Frontend     │
                       └─────────┬─────────┘
                                 │
                            HTTP / REST
                                 │
                                 ▼
                       ┌───────────────────┐
                       │   Spring Boot    │
                       │     Backend      │
                       └──────┬─────┬──────┘
                              │     │
                 ┌────────────┘     └─────────────┐
                 ▼                                ▼
          ┌─────────────┐                  ┌─────────────┐
          │    MySQL    │                  │  WebSocket  │
          │  Database   │                  │    Chat     │
          └─────────────┘                  └─────────────┘
```

---

## 🔄 Funcionamiento general

El funcionamiento principal de la aplicación puede resumirse de la siguiente forma:

```text
                    Usuario
                       │
                       ▼
                ┌─────────────┐
                │   Angular   │
                │  Frontend   │
                └──────┬──────┘
                       │
                  REST / JWT
                       │
                       ▼
                ┌─────────────┐
                │ Spring Boot │
                │   Backend   │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
         ┌──────────┐      ┌──────────┐
         │  MySQL   │      │WebSocket │
         │ Database │      │   Chat   │
         └──────────┘      └──────────┘
```

---

## 💬 Comunicación en tiempo real

El sistema de chat utiliza **WebSocket** para establecer una comunicación persistente entre cliente y servidor.

Esto permite que los mensajes puedan enviarse y recibirse sin necesidad de realizar una petición HTTP independiente para cada actualización.

El sistema está preparado para trabajar con conversaciones asociadas a los usuarios de la plataforma.

---

## 🗄️ Base de datos

La aplicación utiliza **MySQL** como sistema de gestión de base de datos.

Entre las principales entidades del proyecto se encuentran:

* Usuarios
* Productos
* Imágenes
* Favoritos
* Conversaciones
* Mensajes

Las relaciones entre estas entidades permiten gestionar la publicación de productos, los favoritos y la comunicación entre compradores y vendedores.

---

## 🔐 Seguridad

El backend utiliza **Spring Security** junto con **JWT** para gestionar la autenticación y autorización.

Las peticiones a los recursos protegidos requieren un token válido.

Los recursos públicos, como determinados recursos de imágenes, pueden ser accesibles sin autenticación según la configuración del proyecto.

---

## 🛠️ Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

* **Node.js**
* **npm**
* **Angular CLI**
* **Java**
* **Maven**
* **MySQL**
* **Git**

---

# 📥 Clonar el repositorio

```bash id="7x0s3m"
git clone https://github.com/vanerb/SecondHand-Angular-Java.git
cd SecondHand-Angular-Java
```

---

# 🖥️ Instalación y ejecución

## 1️⃣ Backend — Java Spring Boot

Accede al directorio del backend:

```bash id="q9a2vn"
cd backend
```

Configura la conexión con MySQL en:

```text id="b6k9vr"
src/main/resources/application.properties
```

Configura los parámetros correspondientes a tu entorno:

```properties id="6k3m8j"
spring.datasource.url=jdbc:mysql://localhost:3306/TU_BASE_DE_DATOS
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
```

Crea previamente la base de datos en MySQL:

```sql id="q7w8sa"
CREATE DATABASE secondhand_bd;
```

Compila el proyecto:

```bash id="w0j0gc"
mvn clean install
```

Ejecuta Spring Boot:

```bash id="r6p2jf"
mvn spring-boot:run
```

El backend estará disponible por defecto en:

```text id="c2w5h8"
http://localhost:8080
```

---

## 2️⃣ Frontend — Angular

Abre otra terminal y accede al frontend:

```bash id="1cz9n5"
cd frontend
```

Instala las dependencias:

```bash id="3j7b0q"
npm install
```

Ejecuta Angular:

```bash id="x5w1zn"
ng serve
```

El frontend estará disponible normalmente en:

```text id="0y2n4r"
http://localhost:4200
```

---

## 🎯 Objetivo del proyecto

El objetivo de **SecondHand** es desarrollar una plataforma web de compraventa de productos de segunda mano que permita a los usuarios **publicar, descubrir y gestionar productos**, así como comunicarse entre ellos.

El proyecto permite poner en práctica diferentes conceptos de desarrollo Full Stack:

* Desarrollo de aplicaciones SPA con Angular.
* Creación de APIs REST con Spring Boot.
* Persistencia de datos mediante JPA/Hibernate.
* Gestión de bases de datos MySQL.
* Autenticación y autorización mediante JWT.
* Gestión de usuarios.
* Operaciones CRUD.
* Subida y gestión de imágenes.
* Búsqueda y filtrado de productos.
* Sistema de favoritos.
* Comunicación en tiempo real mediante WebSocket.
* Arquitectura cliente-servidor.

---

## 📌 Estado del proyecto

**🚧 WIP — Work in Progress**

El proyecto se encuentra actualmente en desarrollo.

Se están implementando y mejorando progresivamente diferentes funcionalidades relacionadas con la gestión de productos, usuarios, favoritos y comunicación entre usuarios.

### 🔮 Posibles mejoras futuras

* 🔔 Sistema de notificaciones.
* 💬 Mejoras en el sistema de chat.
* 🔎 Nuevas opciones de búsqueda y filtrado.
* ⭐ Valoraciones entre usuarios.
* 📍 Localización de productos.
* 📊 Estadísticas de publicaciones.
* 🔔 Notificaciones sobre favoritos y mensajes.
* 📱 Mejoras de diseño responsive.

---

## 👩‍💻 Autora

**Vanesa Ribera Bautista**

Proyecto desarrollado utilizando **Angular + Java Spring Boot + MySQL + JWT + WebSocket**.
