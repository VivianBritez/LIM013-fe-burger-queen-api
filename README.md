# Burger Queen - API con Node.js

Link desplegado en AWS 
<http://3.82.101.104:8000>


## Índice

* [1. Preámbulo](#1-pre%C3%A1mbulo)
* [2. Resumen del proyecto](#2-resumen-del-proyecto)
* [3. Objetivos de aprendizaje](#3-objetivos-de-aprendizaje)
* [4. API ](#5-criterios-de-aceptaci%C3%B3n-m%C3%ADnimos-del-proyecto)
* [5 HTTP API Checklist](#7-http-api-checklist)

## 1. Preámbulo

Un pequeño restaurante de hamburguesas, que está creciendo, necesita un
sistema a través del cual puedan tomar pedidos usando una _tablet_, y enviarlos
a la cocina para que se preparen ordenada y eficientemente.

Este proyecto tiene dos áreas: interfaz (cliente) y API (servidor). Nuestra
clienta nos ha solicitado desarrollar la API que se debe integra con la
interfaz,  que otro equipo de desarrolladoras está trabajando
simultáneamente

## 2. Resumen del proyecto

Con una API en este caso nos referimos a un _servidor web_, que es
básicamente un programa que _escucha_ en un puerto de red, a través del cual
podemos enviarle _consultas_ (_request_) y obtener _respuestas_ (_response_).

Un servidor web debe _manejar_ consultas entrantes y producir respuestas a esas
consultas que serán enviadas de vuelta al _cliente_. Cuando hablamos de
_aplicaciones de servidor_, esto implica una arquitectura de _cliente/servidor_,
donde el cliente es un programa que hace consultas a través de una red (por
ejemplo el navegador, cURL, ...), y el _servidor_ es el programa que recibe
estas consultas y las responde.

[Node.js](https://nodejs.org/) nos permite crear servidores web super eficientes
de manera relativamente simple y todo esto usando JavaScript!

En este proyecto partimos de un _boilerplate_ que ya contiene una serie de
_endpoints_ (puntos de conexión o URLs) y nos piden completar la aplicación.
Esto implica que tendremos que partir por leer la implementación existente, y
familiarizarnos con el _stack_ elegido ([Node.js](https://nodejs.org/) y
[Express](https://expressjs.com/)) y complementarlo con un motor de bases de
datos, el cual tu deberás elegir entre [MongoDB](https://www.mongodb.com/) y
[MySQL](https://www.mysql.com/).

La clienta nos ha dado un [link a la documentación](https://laboratoria.github.io/burger-queen-api/)
que especifica el comportamiento esperado de la API que expondremos por
HTTP.  Ahí puedes encontrar todos los detalles de qué _endpoints_ debe
implementar  la aplicación, qué parámetros esperan, qué deben responder, etc.

## 3. Objetivos de aprendizaje

El objetivo principal de aprendizaje es adquirir experiencia con **Node.js**
como herramienta para desarrollar _aplicaciones de servidor_, junto con una
serie de herramientas comunes usadas en este tipo de contexto (Express como
framework, MongoDB o MySQL como base datos, contenedores de docker, servidores
virtuales, etc).

En este proyecto tendrás que construir un servidor web que debe _servir_ `JSON`
sobre `HTTP`, y desplegarlo en un servidor en la nube.

Para completar el proyecto tendrás que familiarizarte con conceptos como
**rutas** (_routes_), **URLs**, **HTTP** y **REST** (verbs, request, response, headers,
body, status codes...), **JSON**, **JWT** (_JSON Web Tokens_), **conexión con
una base datos** (`MongoDB` o `MySQL`), **variables de entorno**, **deployment**,
**contenedores de `docker`**...

### Node

* [ ] Instalar y usar módulos. ([npm](https://www.npmjs.com/))
* [ ] [Configuración de package.json.](https://docs.npmjs.com/files/package.json)
* [ ] [Configuración de npm-scripts](https://docs.npmjs.com/misc/scripts)

### Testing

* [x ] [Testeo unitario.](https://jestjs.io/docs/es-ES/getting-started)
* [x] [Testeo asíncrono.](https://jestjs.io/docs/es-ES/asynchronous)
* [x] Tests de integración.

### Estructura del código y guía de estilo

* [x] Organizar y dividir el código en módulos (Modularización)
* [x] Uso de identificadores descriptivos (Nomenclatura | Semántica)
* [x] Uso de linter (ESLINT)

### Git y GitHub

* [x] Uso de comandos de git (add | commit | pull | status | push)
* [x] Manejo de repositorios de GitHub (clone | fork | gh-pages)
* [x] Colaboración en Github (branches | pull requests | |tags)
* [x] Organización en Github (projects | issues | labels | milestones)

### Express

* [x] Rutas.
* [x] `middlewares`

### HTTP

* [x] [Request, Response.](https://developer.mozilla.org/es/docs/Web/HTTP/Messages)
* [x] Headers.
* [x] Body.
* [x] [Verbos HTTP.](https://developer.mozilla.org/es/docs/Web/HTTP/Methods)
* [x] [Codigos de status de HTTP.](https://dev.to/khaosdoctor/the-complete-guide-to-status-codes-for-meaningful-rest-apis-1-5c5)
* [x] Encodings y `JSON`.
* [x] [CORS.](https://developer.mozilla.org/es/docs/Web/HTTP/Access_control_CORS)

### Autenticación

* [x] `JWT`
* [x] Almacenamiento y acceso de contraseñas.

### Servidores

* [x] Variables de entorno.
* [x] `SSH`
* [x] `SSH` keys.
* [x] Qué es un VPS.

### Base de datos (MongoDB o MySQL)

* [x] Instalación.
* [x] Conexión a través de cliente.
* [x] Connection string.
* [x] Queries y comandos (creación, lectura, actualización, eliminación)

### Deployment

* [x] Contenedores.
* [x] Docker.
* [] Docker compose.


##4. API

<img src="https://i.ibb.co/VpDxFwF/Sale.png" alt="Sale" border="0">


####  `/`

* `GET /`

#### `/auth`

* `POST /auth`

#### `/users`

* `GET /users`
* `GET /users/:uid`
* `POST /users`
* `PUT /users/:uid`
* `DELETE /users/:uid`

#### `/products`

* `GET /products`
* `GET /products/:productid`
* `POST /products`
* `PUT /products/:productid`
* `DELETE /products/:productid`

####  `/orders`

* `GET /orders`
* `GET /orders/:orderId`
* `POST /orders`
* `PUT /orders/:orderId`
* `DELETE /orders/:orderId`

### 5.2 CLI

La clienta nos ha solicitado que la aplicación cuente un comando **`npm start`**
que se debe encargar de ejecutar nuestra aplicación node y que además pueda
recibir información de configuración, como el puerto en el que escuchar, a qué
base datos conectarse, etc. Estos datos de configuración serán distintos entre
diferentes entornos (desarrollo, producción, ...). El _boilerplate_ ya implementa
[el código necesario](config.js) para leer esta información de los
[argumentos de invocación](https://nodejs.org/docs/latest/api/process.html#process_process_argv)
y el
[entorno](https://nodejs.org/docs/latest/api/process.html#process_process_env).

####  Argumentos de línea de comando

Podemos especificar el puerto en el que debe arrancar la aplicación pasando un
argumento a la hora de invocar nuestro programa:

```sh
# Arranca la aplicación el puerto 8888 usando npm
npm start 8888
```

#### Variables de entorno

Nuestra aplicación usa las siguientes variables de entorno:

* `PORT`: Si no se ha especificado un puerto como argumento de lína de comando,
  podemos usar la variable de entorno `PORT` para especificar el puerto. Valor
  por defecto `8080`.
* `DB_URL`: El _string_ de conexión de _MongoDB_ o _MySQL_. Cuando ejecutemos la
  aplicación en nuestra computadora (en entorno de desarrollo), podemos usar el
  una base de datos local, pero en producción deberemos utilizar las instancias
  configuradas con `docker-compose` (mas sobre esto en la siguiente sección de
  **Deployment**)
* `JWT_SECRET`: Nuestra aplicación implementa autenticación usando JWT (JSON
   Web Tokens). Para poder firmar (cifrar) y verificar (descifrar) los tokens,
  nuestra aplicación necesita un secreto. En local puedes usar el valor por
  defecto (`xxxxxxxx`), pero es muy importante que uses un _secreto_ de verdad
  en producción.
* `ADMIN_EMAIL`: Opcionalmente podemos especificar un email y password para
  el usuario admin (root). Si estos detalles están presentes la aplicación se
  asegurará que exista el usuario y que tenga permisos de administrador. Valor
  por defecto `admin@localhost`.
* `ADMIN_PASSWORD`: Si hemos especificado un `ADMIN_EMAIL`, debemos pasar
  también una contraseña para el usuario admin. Valor por defecto: `changeme`.

### Deployment

Nuestra clienta nos ha manifestado que su equipo de _devops_ está siempre con muchas
tareas, por por lo que nos pide como requerimiento que la aplicación esté configurada
con `docker-compose` para que pueda ser desplegada sin dificultades en cualquier
entorno.

El _boilerplate_ ya cuenta con una configuración incial de `docker-compose` para
la aplicación de node, tu tarea será extender esa configuración para incluir la
configuración de base de datos que hayas elegido.
Ten en cuenta que como vas a tener dos servidores corriendo sobre una misma
configuración, deberás exponer los servicios en diferentes puertos.

Una vez que tengas tu configuración de `docker-compose`, deberás crear un servidor
en la nube (VPS) (en el área de recursos te proponemos algunas alternativas de
proveedores), acceder a él a través de `ssh`, clonar tu repositorio y ejecutar
`docker-compose up` para levantar la aplicación y la documentación, para que
queden online y accesibles.



## 7 HTTP API Checklist

### 7.1 `/`

* [x] `GET /`

### 7.2 `/auth`

* [x] `POST /auth`

### 7.3 `/users`

* [x] `GET /users`
* [x] `GET /users/:uid`
* [x] `POST /users`
* [x] `PUT /users/:uid`
* [x] `DELETE /users/:uid`

### 7.4 `/products`

* [x] `GET /products`
* [x] `GET /products/:productid`
* [x] `POST /products`
* [x] `PUT /products/:productid`
* [x] `DELETE /products/:productid`

### 7.5 `/orders`

* [x] `GET /orders`
* [x] `GET /orders/:orderId`
* [x] `POST /orders`
* [x] `PUT /orders/:orderId`
* [x] `DELETE /orders/:orderId`

<img src="https://i.ibb.co/hCzsBcw/create-products.png" alt="create-products" border="0">
<img src="https://i.ibb.co/TkQ5LGp/create-users.png" alt="create-users" border="0">
<img src="https://i.ibb.co/8zjGCJY/delete.png" alt="delete" border="0">
<img src="https://i.ibb.co/j3640kJ/get-orders.png" alt="get-orders" border="0">
<img src="https://i.ibb.co/FX5G47m/get-products.png" alt="get-products" border="0">
<img src="https://i.ibb.co/tqLhpQp/get-users-with-page.png" alt="get-users-with-page" border="0">
<img src="https://i.ibb.co/Hpw4jb7/update-users.png" alt="update-users" border="0">