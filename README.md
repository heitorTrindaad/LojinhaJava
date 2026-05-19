# 🛒 Lojinha — Sistema de Marketplace

## 📌 Sobre o Projeto

Este projeto consiste em um sistema completo de marketplace (lojinha), desenvolvido com foco em práticas modernas de desenvolvimento backend utilizando Java. A aplicação permite o gerenciamento de usuários, produtos e compras, simulando um ambiente real de e-commerce.

O sistema foi desenvolvido parcialmente por mim e posteriormente evoluído a partir de sua versão original, com melhorias estruturais e funcionais.

---

## 🚀 Tecnologias Utilizadas

### 🔙 Backend

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- Hibernate

### 🗄 Banco de Dados

- MySQL

### 🌐 Frontend

- HTML, CSS, JavaScript

### 🐳 DevOps

- Docker
- Docker Compose
- Nginx

---

## ⚙️ Funcionalidades

### 👤 Usuários

- Cadastro de usuários (comprador/vendedor)
- Autenticação de login
- Desativação de conta
- Controle de permissões (ADMIN, VENDEDOR, COMPRADOR)

### 📦 Produtos

- Cadastro de produtos
- Listagem de produtos
- Exclusão com validação de permissão
- Associação com vendedor

### 🛍 Compras

- Finalização de compra
- Validação de estoque
- Associação entre usuário e produtos comprados

---

## 🔐 Segurança

- Autenticação utilizando Spring Security
- Controle de acesso por rotas
- Validação de identidade para ações sensíveis

> 🔄 Melhorias futuras: implementação de autenticação via JWT

---

## 🧠 Regras de Negócio

- Apenas o vendedor pode excluir seus próprios produtos
- Produtos com estoque zerado não podem ser comprados
- Apenas usuários autenticados podem realizar compras
- Validação de credenciais para operações críticas

---

## 🗂 Estrutura do Projeto

O backend segue uma arquitetura em camadas:

- **Controller** → Responsável pelas requisições HTTP
- **Service** → Contém as regras de negócio
- **Repository** → Acesso ao banco de dados
- **Model/Entity** → Representação das entidades

---

## ▶️ Como Executar o Projeto

### 🔧 Pré-requisitos

- Docker instalado

### 🚀 Executando com Docker

```bash
docker-compose up --build
```

### 🌍 Acesso

- Frontend: http://localhost
- Backend: http://localhost:8080

```

---

## 📄 Melhorias Implementadas neste Fork

- Reorganização de arquitetura em modulos para arquitetura em camadas.

---

## 📌 Melhorias Futuras

- Implementação de autenticação com JWT
- Criação de testes automatizados (JUnit e Mockito)
- Documentação da API com Swagger
- Deploy em ambiente cloud

---

## 👨‍💻 Autor

Desenvolvido por Heitor Trindade

---

## 📎 Observações

Este projeto foi baseado em uma versão inicial existente, sendo posteriormente evoluído com melhorias significativas. Todas as alterações e evoluções foram realizadas com o objetivo de aprimorar boas práticas de desenvolvimento e simular um ambiente real de aplicação.
```
