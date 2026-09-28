# 🧩 Proyecto SecondHand Angular + Java (Spring Boot)

Este repositorio contiene una arquitectura básica para iniciar un proyecto con **Angular** en el frontend y **Java (Spring Boot)** en el backend. Incluye instrucciones para clonar, instalar dependencias y ejecutar ambos servidores.

---

## 🚀 Tecnologías utilizadas

**Frontend**  
- Angular  
- TypeScript  
- HTML
- CSS 

**Backend**  
- Java 17+  
- Spring Boot  
- Maven  
- JPA / Hibernate (opcional según base de datos)  
- MySQL / PostgreSQL / H2 (según configuración)  

---

## 📦 Estructura del proyecto

- /frontend → Aplicación Angular
- /backend → API REST con Java Spring Boot

---

## 🛠️ Requisitos previos

Asegúrate de tener instalado:  
- Node.js  
- npm  
- Angular CLI  
- Java 17+  
- Maven  
- Base de datos (MySQL, PostgreSQL o H2)

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/vanerb/SecondHand-Angular-Java.git
cd SecondHand-Angular-Java
```

## 🖥️ Instalación y ejecución

1️⃣ Backend (Java Spring Boot)

1. Entrar al directorio del backend:
```bash
cd backend
```

2. Configurar la base de datos:
- Abre application.properties o application.yml
- Modifica el nombre de la base de datos, usuario y contraseña según tu entorno
- Crea la base de datos en tu motor correspondiente (MySQL, PostgreSQL, etc.)

3. Compilar y ejecutar:
```bash
mvn clean install
mvn spring-boot:run
```
Por defecto, el backend se iniciará en: http://localhost:8080

2️⃣ Frontend (Angular)
1. Entrar al directorio del frontend:
```bash
cd frontend
```
2. Instalar dependencias:
```bash
npm install
```
3. Ejecutar Angular:
```bash
ng serve
```
